import { ipcRenderer, contextBridge } from 'electron';
import { BackendAPI } from './util';

(window as any).ipcRenderer = ipcRenderer;



const backendAPI: BackendAPI = {
    send: (channel: string, ...args: any[]) => {
        ipcRenderer.send(channel, ...args)
    },

    invoke: (channel: string, ...args: any[]) => {
        return ipcRenderer.invoke(channel, ...args);
    },

    on: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, (event, ...args) => listener(...args))
    }
}

contextBridge.exposeInMainWorld(
    'backendAPI', backendAPI
)