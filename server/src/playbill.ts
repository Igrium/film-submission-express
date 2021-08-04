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