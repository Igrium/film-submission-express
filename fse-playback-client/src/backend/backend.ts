import { BrowserWindow, ipcMain } from 'electron';
import { Creds, defaultReplication, ReplicationModel } from '../util';
import MediaPlayer from './MediaPlayer';
import ServerInterface from './ServerInterface';
import { Replicator } from 'fse-shared/dist/replication';
import LocalMediaManager from './LocalMediaManager';
import { Server } from 'react-bootstrap-icons';

module backend {
    export let server: ServerInterface | null = null;
    export let mainWindow: BrowserWindow;
    export let mediaPlayer: MediaPlayer | null = null;
    export let replicator: Replicator<ReplicationModel>
    export let mediaManager: LocalMediaManager | null;

    class IpcReplicator<T extends object> extends Replicator<T> {

        public readonly window: BrowserWindow;

        constructor(data: T, window: BrowserWindow) {
            super(data, true);
            this.window = window;
        }

        init() {
            super.init();
            ipcMain.handle('sync', () => {
                return this.data;
            })
        }
        
        protected send(data: Partial<T>): void {
            this.window.webContents.send('replicate', data);
        }
        protected listen(callback: (data: Partial<T>) => void): void {
            ipcMain.on('replicate', (event, data) => callback(data));
        }
        protected request(callback: (data: T) => void): void {
            throw new Error('Method not implemented.');
        }
        
    }

    export function init(window: BrowserWindow) {
        mainWindow = window;
        replicator = new IpcReplicator(defaultReplication, window);
        replicator.init();
    }

    export function launchMediaPlayer() {
        if (mediaPlayer === null) {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.window.on('closed', () => {
                mediaPlayer = null;
            });
            
            mediaPlayer.onMediaFinished(() => {
                mainWindow.webContents.send('mediaFinished');
            });

            mediaPlayer.onDurationChange((duration) => {
                replicator.setData({ mediaDuration: duration })
            });

            mediaPlayer.onTimeUpdate((time) => {
                replicator.setData({ mediaTime: time });
            });

            mediaPlayer.onSetIsPlaying((playing) => {
                replicator.setData({ isPlaying: playing });
            })
        }
    }
 
    ipcMain.handle('login', async (event, creds: Creds) => {
        try {
            await login(creds);
        } catch (err) {
            return err;
        }
    })

    /**
     * Log into a server.
     * @param creds Credentials to use. Includes server address.
     */
    export async function login(creds: Creds) {
        server = await ServerInterface.connect(creds);
        mediaManager = new LocalMediaManager(server, './media');
        server.playbill.onSetOrder(order => {
            replicator.setData({ pipelineOrder: order });
        })
        server.playbill.onModifyFilm((id, data) => {
            replicator.setData({ pipelineFilms: server?.playbill.films });
        })
        replicator.setData({
            pipelineFilms: server.playbill.films,
            pipelineOrder: server.playbill.order
        })
        return server;
    }

    ipcMain.handle('getCredentials', () => {
        if (server) {
            return server.credentials
        } else {
            return null;
        } 
    })
    
    ipcMain.on('launchMediaPlayer', launchMediaPlayer)

    // MEDIA CONTROLS
    ipcMain.on('loadVideoFile', (event, url: string) => {
        if (mediaPlayer) {
            mediaPlayer.displayVideo(url);
        }
    })

    ipcMain.on('togglePlayback', event => {
        if (mediaPlayer) {
            mediaPlayer.toggle();
        }
    })
}

export default backend;