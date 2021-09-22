import { BrowserWindow, ipcMain } from 'electron';
import EventEmitter from 'events';
import Playlist from '../api/Playlist';

export default class MediaPlayer {
    private _window: BrowserWindow;
    private _emitter = new EventEmitter()
    private _isPlaying: boolean;
    private _playlist: Playlist | null;

    constructor() {
        this._window = new BrowserWindow({
            width: 1280,
            height: 720,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
            }
        });

        this.window.loadFile('src/media_player/media_player.html')
        this.window.setMenuBarVisibility(false);

        const mediaFinished = () => this.emitter.emit('mediaFinished')
        const durationChange = (event: any, duration: number) => this.emitter.emit('durationChange', duration);
        const timeUpdate = (event: any, time: number) => {
            this.emitter.emit('timeUpdate', time);
        }
        const error = (event: any, message: string, error: any) => {
            this.emitter.emit('error', message, error);
        }

        ipcMain.on('player.mediaFinished', mediaFinished);
        ipcMain.on('player.durationChange', durationChange);
        ipcMain.on('player.timeUpdate', timeUpdate);
        ipcMain.on('player.error', error)
        
        this.window.once('closed', () => {
            ipcMain.off('player.mediaFinished', mediaFinished);
            ipcMain.off('player.durationChange', durationChange);
            ipcMain.off('player.timeUpdate', timeUpdate);
            this.emitter.emit('closed');
        })

        this.onMediaFinished(() => {
            this.skip();
        })
    }

    public get window() {
        return this._window;
    }

    public get emitter() {
        return this._emitter;
    }

    public get isPlaying() {
        return this._isPlaying;
    }

    /**
     * The currently active playlist.
     */
    public get playlist() {
        return this._playlist;
    }
    

    /**
     * Query the media render process for whether the media is playing or not.
     */
    public getIsPlaying() {
        return new Promise<boolean>((resolve, reject) => {
            try {
                this.window.webContents.send('isPlaying', (response: boolean) => {
                    resolve(response);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    public stop() {
        this._playlist = null;
        this.displayHTML('');
    }

    public setPlaying(playing: boolean) {
        this.window.webContents.send('setIsPlaying', playing);
        this._isPlaying = playing;
        this.emitter.emit('setIsPlaying', this.isPlaying);
    }

    public play() {
        this.setPlaying(true);
    }

    public pause() {
        this.setPlaying(false);
    }

    public toggle() {
        this.setPlaying(!this.isPlaying);
    }

    /**
     * Called when the player has finished whatever media it is playing.
     */
    public onMediaFinished(listener: () => void) {
        this.emitter.on('mediaFinished', listener);
    }

    /**
     * Called when, for whatever reason, the total duration of the media has changed.
     */
    public onDurationChange(listener: (duration: number) => void) {
        this.emitter.on('durationChange', listener);
    }
    
    /**
     * Called when the playhead in the media moves.
     */
    public onTimeUpdate(listener: (time: number) => void) {
        this.emitter.on('timeUpdate', listener);
    }

    public onSetIsPlaying(listener: (playing: boolean) => void) {
        this.emitter.on('setIsPlaying', listener);
    }

    public onError(listener: (message: string, error: any) => void) {
        this.emitter.on('error', listener);
    }

    /**
     * Load a playlist and play an item from it.
     * @param playlist Playlist to load.
     * @param index Start at this index. Defaults to current playlist head.
     */
    public loadPlaylist(playlist: Playlist, index=playlist.head) {
        this._playlist = playlist;
        playlist.displayFunction(playlist.play(index), this);
    }

    /**
     * Display an image in the player.
     * @param image Image URL.
     * @param clearPlaylist Clear the current playlist. Defaults to true.
     */
    public displayImage(image: string, clearPlaylist=true) {
        this.window.webContents.send('displayImage', image);
        if (clearPlaylist) this._playlist = null;
    }

    /**
     * Skip to the next entry in the playlist.
     */
    public skip() {
        if (this.playlist && this.playlist.hasNext) {
            this.playlist.displayFunction(this.playlist.next(), this);
        } else {
            this.stop();
        }
    }

    /**
     * Display a video in the player.
     * @param video Video URL.
     * @param clearPlaylist Clear the current playlist. Defaults to true.
     */
    public displayVideo(video: string, clearPlaylist=true) {
        console.log(`Playing video from ${video}`);
        this.window.webContents.send('displayVideo', video);
        this._isPlaying = true;
        if (clearPlaylist) this._playlist = null;
        this.emitter.emit('setIsPlaying', true);
    }

    /**
     * Display arbitrary HTML in the player.
     * 
     * **Warning:** only use with trusted sources. Potential script tags are NOT sandboxed.
     * @param html HTML content to display.
     * @param clearPlaylist Clear the current playlist. Defaults to true.
     */
    public displayHTML(html: string, clearPlaylist=true) {
        this.window.webContents.send('displayHTML', html);
        if (clearPlaylist) this._playlist = null;
    }
}