import { Router } from "express";
import fs from 'fs';
import uploader from 'huge-uploader-nodejs';
import { nanoid } from 'nanoid';
import path from "path";
import { ApprovalState, FilmInfo, UploadState } from '../../shared/dist/meta.js';
import { UploadMeta, UploadRequest } from '../../shared/dist/upload.js';
import { Config } from "./config.js";
import PlayBill from "./playbill.js";


const maxFileSize = 1000;
const maxChunkSize = 10;

export interface FileUploadInfo {
    /**
     * The unprocessed size of the file, in mebibytes.
     */
    size: number

    /**
     * MD5 hash of the full file.
     */
    hash: string

    /**
     * The number of chunks in the file.
     */
    numChunks: number

    /**
     * The number of chunks that have actually been uploaded.
     */
    uploadedChunks: number
}

export function initUploadAPI(config: Config, playbill: PlayBill, app: Router) {

    app.post('/upload', (req, res) => {
        const tempdir = path.resolve(config.data_folder, 'uploads');
        if (!fs.existsSync(tempdir)) {
            fs.mkdirSync(tempdir, { recursive: true });
        }
        uploader(req, tempdir, maxFileSize, maxChunkSize).then((assembleChunks: () => Promise<unknown>) => {
            res.writeHead(204, 'No Content');
            res.end();

            if (assembleChunks) {
                assembleChunks().then(data => handleFinishUpload(data, config, playbill))
            }
        })
    })
    
    app.options('/upload', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'uploader-chunk-number,uploader-chunks-total,uploader-file-id');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24hrs
        res.writeHead(204, 'No Content');
        res.end();
        return;
    })

}

function handleFinishUpload(data: any, config: Config, playbill: PlayBill) {
    let meta: UploadRequest = data.postParams

    let info: FilmInfo = {
        title: meta.title,
        producer: meta.producer,
        email: meta.email,
        filename: meta.filename,
        length: undefined,
        uploadState: UploadState.Processing,
        approvalState: ApprovalState.Pending
    }

    let id = nanoid(10);
    playbill.films[id] = info;
    playbill.fireUpdateFilm(id);

    console.log(`Recieved film and assigned it id: '${id}'`);
    console.log(info);
}

function initUpload(request: UploadRequest, id: string, config: Config): UploadMeta {
    console.log(`Initializing upload for film: '${id}'.`);

    const uploadFolder = path.resolve(config.data_folder, 'uploading', id);
    fs.mkdirSync(uploadFolder, { recursive: true });

    let size = request.size;
    let chunks = Math.ceil(size / config.upload_chunk_size);

    let uploadInfo: FileUploadInfo = {
        size: size,
        numChunks: chunks,
        hash: request.hash,
        uploadedChunks: 0
    }

    fs.writeFileSync(path.resolve(uploadFolder, 'meta'), JSON.stringify(uploadInfo));
    return {
        id,
        chunkSize: config.upload_chunk_size
    }
}