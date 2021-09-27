/**
 * API for communicating information about the currently connected playback client.
 */
export interface PlaybackConnectionInfo {
    /**
     * Is there a client connected?
     */
    connected: boolean,

    /**
     * The IP of the connected client.
     */
    ip?: string,

    /**
     * The time that the client connected as a readable string.
     */
    time?: string,

    /**
     * The Unix time that the client connected.
     */
    issued?: number
}