import express from 'express';
import fs from 'fs'
import path from 'path'
import { initAPI } from './api/api.js';
import { loadConfigSync } from './config.js';
import PlayBill, { loadDB } from './playbill.js';

export const config = loadConfigSync();
export const app = express();
let playbill: PlayBill;

async function start() {
    if (!fs.existsSync(config.data_folder)) {
        console.warn(`Data folder does not exist! Creating it at ${path.resolve(config.data_folder)}`);
        fs.mkdirSync(config.data_folder);
    }
    
    playbill = new PlayBill(await loadDB(config));
    initAPI(config, playbill, app);
    
    app.listen(config.port, () => {
        console.log(`Film Sumbission server started on port ${config.port}.`)
    });
}

start()

