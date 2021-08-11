import { BrowserWindow, ipcMain } from 'electron';
import { Creds } from '../util';
import ServerInterface from './ServerInterface';

module backend {
    export let server: ServerInterface;
    export let mainWindow: BrowserWindow;

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
}

export default backend;