
import { Server as SocketServer, Socket } from 'socket.io';
import express, { request } from 'express';
import { Server } from 'http'
import auth from '../api/auth';
import passport from 'passport';
import passportSocketIo from 'passport.socketio';
import PlayBill from '../playbill';

// Bullshittary to avoid the fact that Socket.io isn't typed to follow the official example properly.
const wrap = (middleware: express.RequestHandler) => (socket: any, next: any) => middleware(socket.request, {} as any, next);

export interface ReplicationModel {

}

/**
 * Manages the interfacing with playback clients.
 */
export default class PlaybackServer {
    private _io: SocketServer
    private _playbill: PlayBill;
    private _downloadQueue: string[] = [];

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

    private initConnection(socket: Socket) {
        console.log(`New socket connection ${socket.id}`)

        const session = (socket.request as express.Request).session;
        console.log(`Saving sid ${socket.id} in session ${session.id}`);
        (session as any).socketId = socket.id;

        socket.on('setDownloadQueue', queue => {
            this._downloadQueue = queue;
        })
    }
    
    private initListeners() {
        this.playbill.onSetOrder(order => {
            this.io.emit('setFilmOrder', order);
        })

        this.playbill.onModifyFilm((id, data) => {
            this.io.emit('modifyFilm', id, data);
        })
    }

    refreshDownloadQueue() {
        this.io.emit('setDownloadQueue', this.downloadQueue);
    }

    public setDownloadQueue(queue: string[]) {
        this._downloadQueue = queue;
        this.refreshDownloadQueue();
    }

    public queueDownload(id: string) {
        this.downloadQueue.push(id);
        this.refreshDownloadQueue();
    }
}