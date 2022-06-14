
import express from 'express';
import { DownloadStatus, FilmInfo } from 'fse-shared/dist/meta';
import { Replicator } from 'fse-shared/dist/replication';
import { Server } from 'http';
import passport from 'passport';
import { Server as SocketServer, Socket } from 'socket.io';
import auth from '../api/auth';
import PlayBill from '../playbill';

// Bullshittary to avoid the fact that Socket.io isn't typed to follow the official example properly.
const wrap = (middleware: express.RequestHandler) => (socket: any, next: any) => middleware(socket.request, {} as any, next);

export class SocketServerReplicator<T extends object> extends Replicator<T> {
    public readonly connection: Socket;

    constructor(connection: Socket, data: T) {
        super(data, true);
        this.connection = connection;
    }

    init() {
        super.init();
        this.connection.on('sync', callback => {
            callback(this.data);
        });
    }

    protected send(data: Partial<T>): void {
        this.connection.emit('replicate', data);
    }
    protected listen(callback: (data: Partial<T>) => void): void {
        this.connection.on('replicate', data => callback(data));
    }
    protected request(callback: (data: T) => void): void {
        throw new Error('Method not implemented.');
    }

}

/**
 * Manages the interfacing with playback clients.
 */
export default class PlaybackServer {
    private _io: SocketServer
    private _playbill: PlayBill;
    private _connection: Socket | null = null;
    private _downloads: Record<string, DownloadStatus> = {};
    private _head: number = 0;

    /**
     * Construct a playback server.
     * @param http HTTP server to start on.
     */
    constructor(http: Server, playbill: PlayBill) {
        this._io = new SocketServer(http);
        this._playbill = playbill;

        this.io.use(wrap(auth.sessionMiddleware));
        this.io.use(wrap(passport.initialize()));
        this.io.use(wrap(passport.session()));

        this.io.use((socket, next) => {
            console.log((socket.request as any).user);
            // if ((socket.request as any).session.passport.user) {
            //     next();
            // } else {
            //     next(new Error('unauthorized'));
            // }
            next();
        })
        this.io.on('connection', socket => this.initConnection(socket));
        this.initListeners();
    }

    /**
     * The socket.io server that's used under the hood.
     */
    public get io() {
        return this._io
    }

    public get playbill() {
        return this._playbill;
    }


    /**
     * The currently connected playback client.
     */
    public get connection() {
        return this._connection;
    }

    /**
     * The state of downloads on the client, the last time the server heard about them.
     */
    public get downloads() {
        return this._downloads;
    }

    /**
     * The current playback head of the client, the last time the server heard about it.
     */
    public get head() {
        return this._head;
    }

    private initConnection(socket: Socket) {
        console.log(`New socket connection ${socket.id}`)

        if (this.connection) {
            socket.disconnect();
        }

        const session = (socket.request as express.Request).session;
        console.log(`Saving sid ${socket.id} in session ${session.id}`);
        (session as any).socketId = socket.id;

        // DEPRACATED
        socket.on('getFilms', (callback: (films: Record<string, FilmInfo>) => void) => {
            callback(this.playbill.films);
        });

        // DEPRACATED
        socket.on('getOrder', (callback: (order: string[]) => void) => {
            callback(this.playbill.order);
        });

        socket.on('disconnect', () => {
            this._connection = null;
        })

        socket.on('setHead', (head: number) => {
            this._head = head;
        })

        socket.on('updateDownloadStatus', (status: Record<string, DownloadStatus>) => {
            Object.assign(this._downloads, status)
        })

        this._connection = socket
    }
    
    private initListeners() {
        this.playbill.onSetOrder(order => {
            this.io.emit('setFilmOrder', order);
        })

        this.playbill.onModifyFilm((id, data) => {
            this.io.emit('modifyFilm', id, data);
        })
        
    }

    public setDownloadQueue(queue: string[]) {
        this.io.emit('setDownloadQueue', queue);
    }

    /**
     * Add a film to the download queue.
     * @param id Film ID
     */
    public queueDownload(id: string) {
        this.io.emit('queueDownload', id);
    }

    /**
     * Ask the client for the current playback head.
     * @returns The index of the film that's currently playing.
     */
    public getHead(): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                this.io.emit('getHead', (head: number) => {
                    this._head = head;
                    resolve(head)
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * Ask the client for the download status of one or more films. 
     * @param ids The films. If undefined, all films are retrieved.
     * @returns A record with film IDs and their download statuses.
     */
    public getDownloadStatus(ids?: string[]): Promise<Record<string, DownloadStatus>> {
        return new Promise((resolve, reject) => {
            try {
                this.io.emit('getDownloadStatus', (items: Record<string, DownloadStatus>) => {
                    resolve(items)
                })
            } catch (e) {
                reject(e)
            }
        })
    }
}