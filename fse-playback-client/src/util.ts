import { DownloadStatus, FilmInfo } from 'fse-shared/dist/meta';
import { LitePlaylist } from './api/Playlist';

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

export interface NowPlaying {
    local: boolean,
    id?: string,
    url: string
}

export interface ReplicationModel {
    mediaDuration: number,
    mediaTime: number,
    isPlaying: boolean,
    downloadStatus: Record<string, DownloadStatus>,
    nowPlaying: NowPlaying | null,
    downloadQueue: string[],
    titles: Record<string, string>
}

export const defaultReplication: ReplicationModel = {
    isPlaying: false,
    mediaDuration: 10,
    mediaTime: 0,
    downloadStatus: {},
    nowPlaying: null,
    downloadQueue: [],
    titles: {}
}