import { BrowserWindow, ipcMain } from 'electron';
import { Creds } from '../util';
import MediaPlayer from './MediaPlayer';
import ServerInterface from './ServerInterface';
import url from 'url';

module backend {
    export let server: ServerInterface | null = null;
    export let mainWindow: BrowserWindow;
    export let mediaPlayer: MediaPlayer | null = null;

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
                mainWindow.webContents.send('mediaDurationChange', duration);
            });

            mediaPlayer.onTimeUpdate((time) => {
                mainWindow.webContents.send('mediaTimeUpdate', time);
            });

            mediaPlayer.onSetIsPlaying((playing) => {
                mainWindow.webContents.send('setIsPlaying', playing);
            })
        }
    }
 
    ipcMain.handle('login', (event, creds: Creds) => {
        return new Promise<any | undefined>((resolve, reject) => {
            ServerInterface.connect(creds).then(connection => {
                server = connection;
                resolve(undefined);
            }).catch(err => {
                resolve(err);
            })
        });
    })

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