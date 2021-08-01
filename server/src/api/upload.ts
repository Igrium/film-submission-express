import { Request, Response, Router } from "express";
import { Config } from "../config.js";
import PlayBill from "../playbill.js";
import busboy from "connect-busboy";
import { nanoid } from 'nanoid'
import { ApprovalState, FilmInfo } from 'fse-shared/src/meta';
import fs from "fs";
import path from "path";
import uploader from "huge-uploader-nodejs";

const maxFileSize = 1000;
const maxChunkSize = 10;

export function initUploadAPI(config: Config, playbill: PlayBill, app: Router) {
    app.use(busboy({
        highWaterMark: 2 * 1024^2 // Set 2MiB buffer.
    }))

    app.post('/upload', (req, res) => {
        let query = req.query;
        let info: FilmInfo = {
            producer: typeof query.producer === 'string' ? query.producer : '[unknown]',
            title: typeof query.title === 'string' ? query.title : '[unknown]',
            email: typeof query.email === 'string' ? query.email : '[unknown]',
            filename: typeof query.filename === 'string' ? query.filename : '[unknown]',
            length: undefined,
            processed: false,
            approvalState: ApprovalState.Pending
        }
        let id = nanoid(10)

        res.writeHead(204, 'No Content');
        res.end();
        return;

        upload(req, res, config);

    })

    app.route('/upload1').post((req, res, next) => {
        req.pipe(req.busboy);
        

        req.busboy.on('file', (fieldname, file, filename) => {
            console.log(`Started upload of ${filename}.`)
            let query = req.query;
            let info: FilmInfo = {
                producer: typeof query.producer === 'string' ? query.producer : '[unknown]',
                title: typeof query.title === 'string' ? query.title : '[unknown]',
                email: typeof query.email === 'string' ? query.email : '[unknown]',
                filename: filename,
                length: undefined,
                processed: false,
                approvalState: ApprovalState.Pending
            }
            let id = nanoid(10)
            
            const fstream = fs.createWriteStream(
                path.resolve(config.data_folder, 'unprocessed', id + path.extname(filename)));
            
            file.pipe(fstream);

            playbill.films[id] = info;
            playbill.fireUpdateFilm(id);

            fstream.on('close', () => {
                console.log(`Upload of ${id} finished!`);
                res.json({id: id});
            })
        })
    })
}

async function upload(req: Request, res: Response, config: Config) {
    let assembleChunks
    try {
        assembleChunks = await uploader(req,
            path.resolve(config.data_folder, 'uploading'), maxFileSize, maxChunkSize);
    } catch (err) {
        if (err.message === 'Missing header(s)') {
            res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
            res.end('Missing uploader-* header');
            return;
        }

        if (err.message === 'Missing Content-Type') {
            res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
            res.end('Missing Content-Type');
            return;
        }

        if (err.message.includes('Unsupported content type')) {
            res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
            res.end('Unsupported content type');
            return;
        }

        if (err.message === 'Chunk is out of range') {
            res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
            res.end('Chunk number must be between 0 and total chunks - 1 (0 indexed)');
            return;
        }

        if (err.message === 'File is above size limit') {
            res.writeHead(413, 'Payload Too Large', { 'Content-Type': 'text/plain' });
            res.end(`File is too large. Max fileSize is: ${maxFileSize}MB`);
            return;
        }

        if (err.message === 'Chunk is above size limit') {
            res.writeHead(413, 'Payload Too Large', { 'Content-Type': 'text/plain' });
            res.end(`Chunk is too large. Max chunkSize is: ${maxChunkSize}MB`);
            return;
        }

        // this error is triggered if a chunk with uploader-chunk-number header != 0
        // is sent and there is no corresponding temp dir.
        // It means that the upload dir has been deleted in the meantime.
        // Although uploads should be resumable, you can't keep partial uploads for days on your server
        if (err && err.message === 'Upload has expired') {
            res.writeHead(410, 'Gone', { 'Content-Type': 'text/plain' });
            res.end(err.message);
            return;
        }
    }

    res.writeHead(204, 'No Content');
    res.end;
    if (assembleChunks) {
        try {
            let data = await assembleChunks();
            console.log(data);
        } catch (err) {
            console.error(err);
        }
        
    }
    
}