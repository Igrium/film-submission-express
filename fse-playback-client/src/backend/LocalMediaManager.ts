import ServerInterface, { ClientPlayBill } from './ServerInterface';
import path from 'path';
import fs from 'fs';
import { DownloadState, DownloadStatus, UploadState } from 'fse-shared/dist/meta'
import EventEmitter from 'events';
import url from 'url';
import backend from './backend';

interface DownloadHandle {
    length: number,
    percent: number
}

export default class LocalMediaManager {
    public downloadQueue: string[] = []
    public readonly connection: ServerInterface;
    public readonly mediaFolder: string;
    public readonly installedFilms: string[] = [];
    public readonly emitter = new EventEmitter();
    private handles: Record<string, DownloadHandle> = {};
    
    private _isDownloading: boolean = false;

    public constructor(connection: ServerInterface, mediaFolder: string) {
        this.connection = connection;
        this.mediaFolder = mediaFolder;
        
        fs.mkdirSync(mediaFolder, { recursive: true });

        connection.socket.on('setDownloadQueue', queue => {
            this.downloadQueue = queue;
            this.emitter.emit('updateDownloadQueue', this.downloadQueue);
            if (!this.isDownloading) {
                this.beginDownload();
            }
        })

        fs.readdirSync(mediaFolder).forEach(name => {
            if (name.endsWith('.mp4'))
            this.installedFilms.push(path.basename(name, '.mp4'));
        })

        this.onUpdateDownloadStatus((id, status) => {
            connection.updateDownloadStatus({ [id]: status })
        })
        const all: Record<string, DownloadStatus> = {};
        this.installedFilms.forEach(id => {
            all[id] = { state: DownloadState.Ready }
        })
        connection.updateDownloadStatus(all);
    }

    get isDownloading() {
        return this._isDownloading;
    }

    /** 
     * Get the expected local path for a given film ID.
     */
    getLocalMediaPath(id: string) {
        return path.resolve(this.mediaFolder, id+'.mp4');
    }

    /**
     * Add a film to the download queue and start downloading.
     * @param id Film ID.
     */
    queueDownload(id: string) {
        if (!(id in this.connection.playbill.films)) {
            throw new Error(`Unable to download nonexistant film: ${id}`);
        }
        if (id in this.downloadQueue) {
            console.warn(`Film '${id}' is already queued for download!'`);
        }

        this.downloadQueue.push(id);
        console.log(`Added '${id}' to download queue.'`)
        this.updateDownloadQueue();
        if (!this.isDownloading) {
            this.beginDownload();
        }
    }

    /**
     * Iterate through all the processed films and queue them for download if they aren't installed locally.
     * 
     * Starts by going through the program in order, as those are the priority. Then, it downloads the rest
     * of the processed films, regardless of whether they've been approved.
     */
    queueMissing() {
        console.log("Scanning for missing films...");
        const attemptDownload = (id: string) => {
            if (this.getDownloadStatus(id).state === DownloadState.Waiting
                && !(id in this.downloadQueue)
                && this.connection.playbill.films[id].uploadState >= UploadState.ProcessingPreview) {
                    this.downloadQueue.push(id);
                    console.log(`Added '${id}' to download queue.'`)
                }
        }

        this.connection.playbill.order.forEach(id => {
            attemptDownload(id);
        })

        Object.keys(this.connection.playbill.films).forEach(id => {
            attemptDownload(id);
        })
        this.beginDownload();
    }
    
    /**
     * Download a film from the server.
     * @param id Film ID.
     * @returns A promise that rejects if there's an error.
     */
    async download(id: string) {
        if (id in this.installedFilms) {
            console.warn(`Film ${id} has already been downloaded.`);
            return;
        }

        try {
            this._isDownloading = true;       

            const url = new URL(`/api/media?id=${id}`, this.connection.hostname);
            console.log(`Downloading film from ${url}`);
    
            const file = this.getLocalMediaPath(id);
            if (fs.existsSync(file)) {
                console.warn("Film is already installed. Aborting.");
            };
            const writer = fs.createWriteStream(file);
            const response = await ServerInterface.client.get(url.toString(), { responseType: 'stream' });
            this.handles[id] = {length: response.headers['content-length'], percent: 0 };
            this.updateDownloadStatus(id);

            response.data.pipe(writer);
            return new Promise<void>((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`Saved meda to ${file}`);
                    this.installedFilms.push(id);
                    delete this.handles[id];
                    this.updateDownloadStatus(id);
                    resolve();
                });
                writer.on('error', (err) => {
                    delete this.handles[id];
                    this.updateDownloadStatus(id);
                    reject(err);
                });
            })
        } catch (error) {
            delete this.handles[id];
            this.updateDownloadStatus(id);
            throw error;
        }
    }
    
    /**
     * Begin downloading the contents of the download queue.
     * @returns A promise that returns when the queue is empty.
     */
    async beginDownload() {
        if (this.isDownloading) return;
        console.log("Begining queued download...")
        while (this.downloadQueue.length !== 0) {
            const film = this.downloadQueue[0];
            try {
                await this.download(film);
            } catch (err) {
                console.error(`Unable to download film '${film}'. ${err}`);
            }
            this.downloadQueue.shift();
            this.updateDownloadQueue();
        }
    }

    /**
     * Get the download state of a given film.
     * @param id ID of the film.
     * @returns The film's download state.
     */
    getDownloadStatus(id: string): DownloadStatus {
        if (this.installedFilms.includes(id)) {
            return { state: DownloadState.Ready };
        } else if (id in this.handles) {
            return { state: DownloadState.Downloading }
        } else {
            return { state: DownloadState.Waiting }
        }
    }

    /**
     * Get the download status of all the films in the playbill.
     * @returns A record of all the download states.
     */
    getAllDownloadStatus() {
        const status: Record<string, DownloadStatus> = {};
        Object.keys(this.connection.playbill.films).forEach(id => {
            status[id] = this.getDownloadStatus(id);
        })
        return status;
    }

    /**
     * Get a list of all the films that are actively downloading.
     * @returns Downloading films.
     */
    getDownloadingFilms() {
        return Object.keys(this.handles);
    }
    
    /**
     * Called whenever the download status for a film has changed.
     * @param listener Event listener.
     */
    onUpdateDownloadStatus(listener: (id: string, status: DownloadStatus) => void) {
        this.emitter.on('updateDownloadStatus', listener);
    }

    private updateDownloadStatus(id: string) {
        this.emitter.emit('updateDownloadStatus', id, this.getDownloadStatus(id));
    }

    /**
     * Called when the download queue is updated for any reason.
     * @param listener Event listener.
     */
    onUpdateDownloadQueue(listener: (queue: string[]) => void) {
        this.emitter.on('updateDownloadQueue', listener);
    }

    /**
     * Send the server the current copy of the download queue.
     * Should be called every time the `downloadQueue` array is updated.
     */
    updateDownloadQueue() {
        this.connection.socket.emit('setDownloadQueue', this.downloadQueue);
        this.emitter.emit('updateDownloadQueue', this.downloadQueue);
    }

    /**
     * Get the local URL for a film.
     * @param id ID of the film.
     * @returns Local URL.
     * @throws If the film doesn't exist or is still downloading.
     */
    public getLocalMedia(id: string) {
        if (this.getDownloadStatus(id).state !== DownloadState.Ready) {
            throw new Error(`Local media for '${id}' is nonexistant or incomplete.`);
        }
        return url.pathToFileURL(this.getLocalMediaPath(id));
    }
}