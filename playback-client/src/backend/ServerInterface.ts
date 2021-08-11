import io, { Socket } from 'socket.io-client';
import { Creds } from '../util';
import axios from 'axios';

/**
 * Wrapper around a connection to an FSE server.
 */
export default class ServerInterface {
    private _socket: Socket
    static client = axios.create({ timeout: 5000 });

    /**
     * The hostname of the server we're connected to.
     */
    public hostname: string

    constructor(socket: Socket, hostname: string) {
        this._socket = socket;
        this.hostname = hostname;
    }
    
    /**
     * The socket connection used under the hood.
     */
    public getSocket() {
        return this._socket;
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
            try {
                socket = io(address);
            } catch (e) {
                return reject(`Unable to establish socket connection. ${e}`);
            }

            resolve(new ServerInterface(socket, address));
        });
    }
    
}