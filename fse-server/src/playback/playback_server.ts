
import { Server as SocketServer, Socket } from 'socket.io';
import express, { request } from 'express';
import { Server } from 'http'
import auth from '../api/auth';
import passport from 'passport';
import passportSocketIo from 'passport.socketio';
import PlayBill from '../playbill';
import { PlaybackReplicationModel, Replicator } from 'fse-shared/dist/replication';
import { DownloadStatus, FilmInfo } from 'fse-shared/dist/meta';
import pipeline from '../pipeline';

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
    private _downloadQueue: string[] = [];
    private _head = 0;
    private _connection: Socket | null = null;

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

    public get downloadQueue() {
        return this._downloadQueue;
    }

    public get head() {
        return this._head;
    }

    /**
     * The currently connected playback client.
     */
    public get connection() {
        return this._connection;
    }

    private initConnection(socket: Socket) {
        console.log(`New socket connection ${socket.id}`)

        if (this.connection) {
            socket.disconnect();
        }

        const session = (socket.request as express.Request).session;
        console.log(`Saving sid ${socket.id} in session ${session.id}`);
        (session as any).socketId = socket.id;

        socket.on('setDownloadQueue', queue => {
            this._downloadQueue = queue;
        });

        socket.on('getFilms', (callback: (films: Record<string, FilmInfo>) => void) => {
            callback(this.playbill.films);
        });

        socket.on('getOrder', (callback: (order: string[]) => void) => {
            callback(this.playbill.order);
        });

        socket.on('setHead', (head: number) => {
            this._head = head;
            console.log(`Client is playing film at index ${head}`) // TESTING ONLY
        })

        socket.on('disconnect', () => {
            this._connection = null;
        })

        pipeline.downloadingFilms = {}; // We need to wait for the client to tell us about its download status.
        socket.on('updateDownloadStatus', (status: Record<string, DownloadStatus>) => {
            Object.keys(status).forEach(id => {
                pipeline.downloadingFilms[id] = status[id];
            })
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

    /**
     * Provide the client with a new copy of the download queue.
     */
    refreshDownloadQueue() {
        this.io.emit('setDownloadQueue', this.downloadQueue);
    }

    public setDownloadQueue(queue: string[]) {
        this._downloadQueue = queue;
        this.refreshDownloadQueue();
    }

    /**
     * Add a film to the download queue.
     * @param id Film ID
     */
    public queueDownload(id: string) {
        this.downloadQueue.push(id);
        this.refreshDownloadQueue();
    }
}