import { Low, JSONFile } from 'lowdb'
import path from "path";
import fs from 'fs';
import { Config } from "./config.js";
import { FilmInfo } from "fse-shared/src/meta";
import EventEmitter from 'events';

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
    private _db: Low<PBDatabase>
    public _emitter = new EventEmitter();

    constructor(db: Low<PBDatabase>) {
        this._db = db;
        this.onUpdateFilm(() => {
            db.write();
        })
        this.onUpdateOrder(() => {
            db.write();
        })
    }

    get database() {
        return this._db;
    }

    get emitter() {
        return this._emitter;
    }

    private get data(): PBDatabase {
        let data = this._db.data;
        if (data == null) {
            throw new ReferenceError("The playbill metadata hasn't been loaded!");
        }
        return data;
    }

    /**
     * All the films in the database. Make sure to call `fireUpdateFilm` after editing.
     */
    get films() {
        return this.data.films;
    }

    /**
     * Film IDs in the order they will play in. Make sure to call `fireUpdateOrder` after editing.
     */
    get order() {
        return this.data.order;
    }

    /**
     * Functions which modify the metadata of a film should call this when they're done.
     * @param id ID of the film that was changed.
     */
    public fireUpdateFilm(id: String) {
        this.emitter.emit('updateFilm', id);
    }

    /**
     * Called when there has been an update to a film's metadata or a film has been added.
     * @param listener Listener function.
     */
    public onUpdateFilm(listener: (id: string) => void) {
        this.emitter.on('updateFilm', listener);
    }

    /**
     * Functions that modify the film order should call this when they're done.
     */
    public fireUpdateOrder() {
        this.emitter.emit('updateOrder', this.data.order);
    }

    /**
     * Called when there's an update to the film order.
     * @param listener Listener function.
     */
    public onUpdateOrder(listener: (newOrder: string[]) => void) {
        this.emitter.on('updateOrder', listener);
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

    let adapter = new JSONFile<PBDatabase>(file);
    let db = new Low(adapter);
    await db.read();
    return db;
}