import cors from 'cors';
import express from 'express';
import fs from 'fs'
import path from 'path'
import { initAPI } from './api/api.js';
import { loadConfigSync } from './config.js';
import PlayBill, { loadDB } from './playbill.js';
import VideoProcessor from './video_processor.js';
import proxy from 'express-http-proxy';

export const config = loadConfigSync();
export const app = express();
let playbill: PlayBill;
export let processor: VideoProcessor;

async function start() {
    if (!fs.existsSync(config.data_folder)) {
        console.warn(`Data folder does not exist! Creating it at ${path.resolve(config.data_folder)}`);
        fs.mkdirSync(config.data_folder);
    }
    app.use(cors());
    playbill = new PlayBill(await loadDB(config), config.data_folder);
    processor = new VideoProcessor(config, playbill);

    app.use('/', initAPI(config, playbill));

    app.use('/submit', express.static(path.join(__dirname, '../../submission-portal/build/')));
    app.use('/admin', express.static(path.join(__dirname, '../../admin-panel/build/')));

    app.listen(config.port, () => {
        console.log(`Film Sumbission server started on port ${config.port}.`)
    });
}

start()

