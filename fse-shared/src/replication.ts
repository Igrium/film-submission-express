import { EventEmitter } from 'events';
import { FilmInfo } from './meta';

/**
 * Handles replication of values between a server and client.
 */
export abstract class Replicator<Model extends object> {
    private _data: Model
    private _authoritative: boolean
    public readonly emitter = new EventEmitter();

    /**
     * Initialize a replicatora
     * @param data Default data. Should be the same across server and client.
     * @param authoritative Whether this is the authoritative source of the data. Should only be true on the server.
     */
    constructor(data: Model, authoritative: boolean) {
        this._data = data;
        this._authoritative = authoritative;
    }

    /**
     * The most up-to-date version of the data.
     */
    public get data() {
        return this._data;
    }

    /**
     * Whether this is the authoritative source of the data. Should only be true on the server.
     */
    public get authoritative() {
        return this._authoritative
    }

    /**
     * Send a packet of data.
     * @param data Data to send.
     */
    protected abstract send(data: Partial<Model>): void;
    /**
     * Setup listener for packets of data.
     * @param callback Listener.
     */
    protected abstract listen(callback: (data: Partial<Model>) => void): void;
    /**
     * Ask the server for the complete data. Only needs to be implemented on clients.
     * @param callback The data listener.
     */
    protected abstract request(callback: (data: Model) => void): void;

    /**
     * Update values in the data model.
     * @param data The data to update.
     */
    public setData(data: Partial<Model>) {
        Replicator.merge(this.data, data);
        this.send(data);
        this.emitter.emit('update', data);
    }

    /**
     * Synchronize the data across all devices.
     */
    public sync() {
        if (this.authoritative) {
            this.send(this.data);
        } else {
            this.request((data) => {
                this._data = data;
            })
        }
    }

    /**
     * Setup listeners for the connection.
     */
    public init() {
        this.listen((data) => {
            Replicator.merge(this.data, data);
            this.emitter.emit('update', data);
        });
        if (!this.authoritative) {
            this.sync();
        }
    }

    /**
     * Called when the data is updated, either locally or remotely.
     * @param listener Listener.
     */
    public onUpdate(listener: (data: Partial<Model>) => void) {
        this.emitter.on('update', listener);
    }

    private static merge<T extends object>(base: T, update: Partial<T>) {
        Object.keys(update).forEach(key => {
            (base as any)[key] = (update as any)[key]
        })
    }

}

export interface PlaybackReplicationModel {
    films: Record<string, FilmInfo>,
    order: string[],
    downloadQuueue: string[]
}