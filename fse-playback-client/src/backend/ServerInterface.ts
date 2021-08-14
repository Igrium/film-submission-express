import io, { Socket } from 'socket.io-client';
import { Creds } from '../util';
import axios from 'axios';
import { FilmInfo } from 'fse-shared/dist/meta';
import EventEmitter from 'events';

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

            resolve(new ServerInterface(socket, address, credentials));
        });
    }
    
}