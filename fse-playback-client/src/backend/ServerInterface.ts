import io, { Socket } from 'socket.io-client';
import { Creds } from '../util';
import axios from 'axios';
import { DownloadStatus, FilmInfo } from 'fse-shared/dist/meta';
import EventEmitter from 'events';
import { Replicator } from 'fse-shared/dist/replication';

/**
 * Client proxy of playbill. DO NOT WRITE TO DIRECTLY!
 * Use REST API to contact the server instead.
 */
export class ClientPlayBill {
    readonly emitter = new EventEmitter;
    films: Record<string, FilmInfo> = {}
    order: string[] = [];

    onModifyFilm(listener: (id: string, data: FilmInfo) => void) {
        this.emitter.on('modifyFilm', listener);
    }

    onSetOrder(listener: (order: string[]) => void) {
        this.emitter.on('setOrder', listener);
    }
}

export class SocketClientReplicator<T extends object> extends Replicator<T> {
    public readonly connection: Socket;

    constructor(connection: Socket, data: T) {
        super(data, false);
        this.connection = connection;
    }

    protected send(data: Partial<T>): void {
        this.connection.emit('replicate', data);
    }
    protected listen(callback: (data: Partial<T>) => void): void {
        this.connection.on('replicate', data => callback(data));
    }
    protected request(callback: (data: T) => void): void {
        this.connection.emit('sync', (data: T) => {
            callback(data);
        })
    }

}

/**
 * Wrapper around a connection to an FSE server.
 */
export default class ServerInterface {
    private _socket: Socket
    private _creds: Creds;
    private _hostname: string
    readonly playbill = new ClientPlayBill();
    static client = axios.create({ timeout: 5000 });

    constructor(socket: Socket, hostname: string, credentials: Creds) {
        this._socket = socket;
        this._hostname = hostname;
        this._creds = credentials;
        this.initConnection();
    }
    
    /**
     * The socket connection used under the hood.
     */
    get socket() {
        return this._socket;
    }
    
    /**
     * The credentials used to log into the server.
     */
    get credentials() {
        return this._creds;
    }

    /**
     * The hostname of the server we're connected to.
     */
    get hostname() {
        return this._hostname;
    }

    public updateDownloadStatus(status: Record<string, DownloadStatus>) {
        this.socket.emit('updateDownloadStatus', status);
    }

    private initConnection() {
        this.socket.on('modifyFilm', (id, data) => {
            this.playbill.films[id] = data;
            this.playbill.emitter.emit('modifyFilm', id, data);
        })
        this.socket.on('setFilmOrder', order => {
            this.playbill.order = order;
            this.playbill.emitter.emit('setOrder', order);
            console.log(order);
        })
    }

    /**
     * Synchronize the local proxy with the server.
     * Does not call listeners, as this is generally used
     * upon initial connection.
     */
    public async sync() {
        console.log("Syncing with server...");

        let filmPromise = this.getFilms();
        let orderPromise = this.getOrder();

        let result = await Promise.all([filmPromise, orderPromise]);
        this.playbill.films = result[0];
        this.playbill.order = result[1];
    }
    
    private async getFilms() {
        return new Promise<Record<string, FilmInfo>>((resolve, reject) => {
            try {
                this.socket.emit('getFilms', (films: Record<string, FilmInfo>) => {
                    resolve(films);
                })
            } catch (e) {
                reject(e);
            }
        })
    }

    private async getOrder() {
        return new Promise<string[]>((resolve, reject) => {
            try {
                this.socket.emit('getOrder', (order: string[]) => {
                    resolve(order);
                })
            } catch (e) {
                reject(e);
            }
        })
    }

    /**
     * Attempt to connect to a FSE server.
     * @param credentials Credentials to connect with.
     * @returns A promise that resolves on successful connection and rejects on unsuccessful connection.
     */
    public static connect(credentials: Creds) {
        return new Promise<ServerInterface>(async (resolve, reject) => {
            const { address, username, password } = credentials;

            let loginURL
            try {
                loginURL = new URL('/api/users/login', address)
            } catch (error) {
                return reject(`Invalid URL: ${address}`);
            }

            let loginResponse
            try {
                loginResponse = await this.client.post(loginURL.toString(),{
                    username,
                    password
                }, { withCredentials: true })
            } catch (e) {
                return reject(`Unable to authenticate. ${e}`);
            }
            
            let socket;
            console.log(`Establishing socket connection to ${address}`);
            try {
                socket = io(address);
                socket.on('connect', () => {
                    console.log("Socket connection established.");
                })
            } catch (e) {
                return reject(`Unable to establish socket connection. ${e}`);
            }

            let server = new ServerInterface(socket, address, credentials);
            await server.sync();
            resolve(server);
        });
    }
    
}