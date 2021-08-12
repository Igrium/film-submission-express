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