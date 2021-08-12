import { BackendAPI, Creds } from '../util';
import { EventEmitter } from 'events';
const api: BackendAPI = (window as any).backendAPI;

console.log(api)
module backendInterface {
    export const emitter = new EventEmitter

    /**
     * Attempt to login to the server.
     * @param credentials Credentials to login with.
     * @returns A promise that resolves on successful login and rejects on failed login.
     */
    export function login(credentials: Creds) {
        return new Promise<void>((resolve, reject) => {
            api.invoke('login', credentials).then((err) => {
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
        let creds = await api.invoke('getCredentials') as Creds | null;
        return creds;
    }

    /**
     * Tell the backend to launch the media player.
     */
    export function launchMediaPlayer() {
        api.send('launchMediaPlayer');
    }
    
    export function loadVideoFile(url: string) {
        api.send('loadVideoFile', url);
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

    api.on('mediaFinished', () => {
        emitter.emit('mediaFinished');
    });

    api.on('mediaDurationChange', (duration) => {
        emitter.emit('mediaDurationChange', duration);
    });

    api.on('mediaTimeUpdate', (time) => {
        console.log(`Time: ${time}`)
        emitter.emit('mediaTimeUpdate', time);
    });
}

export default backendInterface;