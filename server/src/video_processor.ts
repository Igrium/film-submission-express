import { Config } from "./config";
import PlayBill from "./playbill";
import handbrake, { HandbrakeOptions } from "handbrake-js";
import path from "path";
import { UploadState } from "../../shared/dist/meta.js"
import fs from 'fs';

interface QueueItem { input: string, id: string, ext: string, callback: (result: string | Error) => void }

export default class VideoProcessor {
    private config: Config;
    private playbill: PlayBill;
    private queue: QueueItem[] = []
    private isActive = false

    constructor(config: Config, playbill: PlayBill) {
        this.config = config;
        this.playbill = playbill;
    }

    /**
     * Queue a film for processing.
     * @param input Raw video file from producer.
     * @param id Film ID.
     * @param ext Original extension.
     * @param callback Called when processing is complete.
     */
    process(input: string, id: string, ext: string, callback?: (result: string | Error) => void) {
        if (!callback) callback = () => {};
        this.queue.push({ input, id, ext, callback });
        this.beginQueue()
    }

    private beginQueue() {
        if (this.isActive || this.queue.length == 0) return;
        this.processVideo(this.queue[0]);
    }

    private async processVideo(item: QueueItem) {
        const mediaFolder = path.resolve(this.config.data_folder, 'media');
        console.log(`Processing film '${item.id}'`);
        this.isActive = true;
        const output = path.resolve(mediaFolder, item.id+'.mp4');
        if (!fs.existsSync(mediaFolder)) {
            fs.mkdirSync(mediaFolder);
        }
        const options: HandbrakeOptions = {
            input: item.input,
            output,
            format: 'av_mp4',
            encoder: 'x264_10bit',
            'encoder-preset': 'fast',
            'all-audio': true,
            quality: 20
            
        }

        handbrake.spawn(options).on('error', (err) => {
            console.error(`Film '${item.id} failed to process!`, err.message);
            item.callback(err);
            this.advance();
        }).on('progress', progress => {
            console.log(`Transcode progress: ${progress.percentComplete}, ETA: ${progress.eta}`)
        }).on('end', () => {
            console.log(`Transcoded film '${item.id} to ${output}`);
            this.playbill.database.push(`/films/${item.id}/uploadState`, UploadState.Ready);
            item.callback(output);
            this.advance();
        })
    }

    private advance() {
        this.queue.shift();

        if (this.queue.length > 0) {
            this.processVideo(this.queue[0]);
        } else {
            this.isActive = false;
        }
    }
}