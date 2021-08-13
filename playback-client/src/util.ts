export interface Creds {
    address: string,
    username: string,
    password: string
}

export interface BackendAPI {
    send: (channel: string, ...args: any[]) => void,
    invoke: (channel: string, ...args: any[]) => Promise<any>,
    on: (channel: string, listener: (...args: any[]) => void) => void
}

export interface ReplicationModel {
    mediaDuration: number,
    mediaTime: number,
    isPlaying: boolean
}

export const defaultReplication: ReplicationModel = {
    isPlaying: false,
    mediaDuration: 10,
    mediaTime: 0
}