import { IpcRenderer } from 'electron';
import { Creds } from '../util';
const ipcRenderer: IpcRenderer = (window as any).ipcRenderer

console.log(ipcRenderer)
module backendInterface {
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
}

export default backendInterface;