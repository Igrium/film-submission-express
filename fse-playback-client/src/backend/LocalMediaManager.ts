import ServerInterface from './ServerInterface';
import path from 'path';
import fs from 'fs';

export default class LocalMediaManager {
    public downloadQueue: string[] = []
    public readonly connection: ServerInterface;
    public readonly mediaFolder: string;
    
    private _isDownloading: boolean = false;

    public constructor(connection: ServerInterface, mediaFolder: string) {
        this.connection = connection;
        this.mediaFolder = mediaFolder;
        fs.mkdirSync(mediaFolder, { recursive: true });

        connection.socket.on('setDownloadQueue', queue => {
            this.downloadQueue = queue;
            if (!this.isDownloading) {
                this.beginDownload();
            }
        })
    }

    get isDownloading() {
        return this._isDownloading;
    }
    
    async download(id: string) {
        this._isDownloading = true;       

        const url = new URL(`/api/media?id=${id}`, this.connection.hostname);
        console.log(`Downloading film from ${url}`);

        const file = path.resolve(this.mediaFolder, id+'.mp4');
        if (fs.existsSync(file)) {
            console.warn("Film is already installed. Aborting.");
        };
        const writer = fs.createWriteStream(file);

        const response = await ServerInterface.client.get(url.toString(), { responseType: 'stream' });
        
        response.data.pipe(writer);

        console.log(`Saved meda to ${file}`);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        })
    }

    async beginDownload() {
        while (this.downloadQueue.length !== 0) {
            const film = this.downloadQueue[0];
            try {
                await this.download(film);
            } catch (err) {
                console.log(`Unable to download film '${film}'. ${err}`);
            }
            this.downloadQueue.shift();
        }
    }

    /**
     * Send the server the current copy of the download queue.
     */
    updateDownloadQueue() {
        this.connection.socket.emit('setDownloadQueue', this.downloadQueue);
    }
}