import { Low, JSONFile } from 'lowdb'
import path from "path";
import fs from 'fs';
import { Config } from "./config.js";
import { FilmInfo } from "./meta.js";

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

export default class PlayBill {
    private _db: Low<PBDatabase>

    constructor(db: Low<PBDatabase>) {
        this._db = db;
    }

    get database() {
        return this._db;
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