import { BackendAPI, Creds } from '../util';
import { EventEmitter } from 'events';
const api: BackendAPI = (window as any).backendAPI;

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

    export function togglePlayback() {
        api.send('togglePlayback');
    }

    export function onMediaFinished(listener: () => void) {
        api.on('mediaFinished', listener);
    }

    export function onMediaDurationChange(listener: (duration: number) => void) {
        api.on('mediaDurationChange', listener)
    }

    export function onMediaTimeUpdate(listener: (time: number) => void) {
        emitter.on('mediaTimeUpdate', listener);
        api.on('mediaTimeUpdate', listener);
    }

    export function onSetIsPlaying(listener: (isPlaying: boolean) => void) {
        api.on('setIsPlaying', listener);
    }
}

export default backendInterface;