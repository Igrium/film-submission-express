import { IpcRenderer } from 'electron';
import { Creds } from '../util';
import { EventEmitter } from 'events';
const ipcRenderer: IpcRenderer = (window as any).ipcRenderer

console.log(ipcRenderer)
module backendInterface {
    export const emitter = new EventEmitter

    /**
     * Attempt to login to the server.
     * @param credentials Credentials to login with.
     * @returns A promise that resolves on successful login and rejects on failed login.
     */
    export function login(credentials: Creds) {
        return new Promise<void>((resolve, reject) => {
            ipcRenderer.invoke('login', credentials).then((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }).catch(reject);
        });
    }

    /**
     * Get the current login credentials.
     * @returns The current credentials, or `null` if we're not logged in.
     */
    export async function getCredentials() {
        let creds = await ipcRenderer.invoke('getCredentials') as Creds | null;
        return creds;
    }

    /**
     * Tell the backend to launch the media player.
     */
    export function launchMediaPlayer() {
        ipcRenderer.send('launchMediaPlayer');
    }
    
    export function loadVideoFile(url: string) {
        ipcRenderer.send('loadVideoFile', url);
    }

    export function onMediaFinished(listener: () => void) {
        emitter.on('mediaFinished', listener);
    }

    export function onMediaDurationChange(listener: (duration: number) => void) {
        emitter.on('mediaDurationChange', listener);
    }

    export function onMediaTimeUpdate(listener: (time: number) => void) {
        emitter.on('mediaTimeUpdate', listener);
    }

    // ipcRenderer.on('mediaFinished', () => {
    //     emitter.emit('mediaFinished');
    // });

    // ipcRenderer.on('mediaDurationChange', (event, duration) => {
    //     emitter.emit('mediaDurationChange', duration);
    // });

    // ipcRenderer.on('mediaTimeUpdate', (event, time) => {
    //     emitter.emit('mediaTimeUpdate', time);
    // });
}

export default backendInterface;