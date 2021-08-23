import { BackendAPI, Creds, defaultReplication, ReplicationModel } from '../util';
import { EventEmitter } from 'events';
import { Replicator } from 'fse-shared/dist/replication'
const api: BackendAPI = (window as any).backendAPI;

class IpcReplicator<T extends object> extends Replicator<T> {
    constructor(data: T) {
        super(data, false);
    }

    protected send(data: Partial<T>): void {
        api.send('replicate', data);
    }
    protected listen(callback: (data: Partial<T>) => void) {
        api.on('replicate', (data) => callback(data));
    }
    protected async request(callback: (data: T) => void) {
        const result: T = await api.invoke('sync')
        callback(result);
    }

}

module backendInterface {
    export const emitter = new EventEmitter
    export const replicator = new IpcReplicator<ReplicationModel>(defaultReplication);
    replicator.init()

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

    export function onUpdateReplicationData(listener: (data: Partial<ReplicationModel>) => void) {
        replicator.onUpdate(listener);
    }

    export function onMediaError(listener: (message: string, error: any) => void) {
        api.on('mediaError', listener);
    }
    
}

export default backendInterface;