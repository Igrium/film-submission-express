import path from "path";
import fs from 'fs';
import { Config } from "./config.js";
import { FilmInfo } from "fse-shared/src/meta";
import EventEmitter from 'events';
import { JsonDB } from 'node-json-db'

export interface PBDatabase {
    /**
     * All the films in the database.
     */
    films: Record<string, FilmInfo>

    /**
     * Film IDs in the order they will play in.
     */
    order: string[]
}

/**
 * Represents a single "film festival." I would use the name "Program," 
 * but that would get confused with "application."
 */
export default class PlayBill {
    private _db: JsonDB;
    public _emitter = new EventEmitter();
    private _dataFolder: string

    constructor(db: JsonDB, dataFolder: string) {
        this._db = db;
        this._dataFolder = dataFolder;
        // this.onUpdateFilm(() => {
        //     db.save();
        // })
        // this.onUpdateOrder(() => {
        //     db.write();
        // })
    }

    get database() {
        return this._db;
    }

    get emitter() {
        return this._emitter;
    }

    get dataFolder() {
        return this._dataFolder;
    }

    /**
     * All the films in the database.
     */
    get films() {
        return this.database.getObject<Record<string, FilmInfo>>('/films');
    }

    /**
     * Film IDs in the order they will play in. Make sure to call `fireUpdateOrder` after editing.
     */
    get order() {
        return this.database.getObject<string[]>('/order');
    }

    /**
     * Modify the data in a film entry.
     * @param id ID of the film.
     * @param data Data to modify.
     */
    public modifyFilm(id: string, data: Partial<FilmInfo>) {
        if (!this.database.exists(`/films/${id}`)) {
            throw new Error(`No film with ID '${id}'`);
        }
        let film = this.database.getObject<FilmInfo>(`/films/${id}`);
        let merged = merge(film, data)
        this.database.push(`/films/${id}`, merged);
        this.emitter.emit('modifyFilm', id, merged);
    }

    public onModifyFilm(listener: (id: string, data: FilmInfo) => void) {
        this.emitter.on('modifyFilm', listener);
    }

    /**
     * Set the order that films will play in.
     * @param order Film IDs in the proper order.
     */
    public setOrder(order: string[]) {
        this.database.push('/order', order);
        this.emitter.emit('setOrder', order);
    }

    /**
     * Append a set of films to the back of the order.
     * @param ids Film IDs to add.
     */
    public append(...ids: string[]) {
        let order = this.order;
        order.push(...ids);
        this.setOrder(order);
    }

    public onSetOrder(listener: (order: string[]) => void) {
        this.emitter.on('setOrder', listener);
    }
    
}

function merge<T>(base: T, layer: Partial<T>) {
    const obj: any = {};
    Object.keys(base).forEach(key => {
        if (key in layer && (layer as any)[key] !== undefined) {
            obj[key] = (layer as any)[key];
        } else {
            obj[key] = (base as any)[key];
        }
    })
    return obj as T;
}

export async function loadDB(config: Config) {
    console.log('Loading database...');
    let file = path.resolve(config.data_folder, 'meta.json')
    if (!fs.existsSync(file)) {
        let db: PBDatabase = {
            films: {},
            order: []
        }

        fs.writeFileSync(file, JSON.stringify(db));
    }

    return new JsonDB(file, true, true);
}