import { BrowserWindow, ipcMain } from 'electron';
import EventEmitter from 'events';

export default class MediaPlayer {
    private _window: BrowserWindow;
    private _emitter = new EventEmitter()
    private _isPlaying: boolean;

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

        ipcMain.on('player.mediaFinished', mediaFinished);
        ipcMain.on('player.durationChange', durationChange);
        ipcMain.on('player.timeUpdate', timeUpdate);
        
        this.window.once('closed', () => {
            ipcMain.off('player.mediaFinished', mediaFinished);
            ipcMain.off('player.durationChange', durationChange);
            ipcMain.off('player.timeUpdate', timeUpdate);
            this.emitter.emit('closed');
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

    /**
     * Display an image in the player.
     * @param image Image URL.
     */
    public displayImage(image: string) {
        this.window.webContents.send('displayImage', image);
    }

    /**
     * Display a video in the player.
     * @param video Video URL.
     */
    public displayVideo(video: string) {
        console.log(`Playing video from ${video}`);
        this.window.webContents.send('displayVideo', video);
        this._isPlaying = true;
        this.emitter.emit('setIsPlaying', true);
    }

    /**
     * Display arbitrary HTML in the player.
     * 
     * **Warning:** only use with trusted sources. Potential script tags are NOT sandboxed.
     * @param html HTML content to display.
     */
    public displayHTML(html: string) {
        this.window.webContents.send('displayHTML', html);
    }
}