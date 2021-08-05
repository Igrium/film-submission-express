import { Config } from "../config.js";
import PlayBill from "../playbill.js";
import { json, Request, Response, Router } from "express";
import { initUploadAPI } from "../upload.js";
import { FilmInfo, UploadState } from "../../../shared/dist/meta.js";
import path from "path";
import fs from "fs";

/**
 * Init an express app with a playbill.
 * @param config Server configuration.
 * @param playbill Active playbill.
 * @param app Express app.
 */
export function initAPI(config: Config, playbill: PlayBill, app: Router) {
    app.use(json());

    app.get('/api/films/:id', (req, res) => {
        const id = req.params.id;
        if (!(id in playbill.films)) {
            res.status(404).json({message: `Film '${id}' not found.`});
            return;
        }
        res.json(playbill.films.id);
    })

    app.get('/api/films', (req, res) => {
        if ('id' in req.query) {
            let id = req.query.id;

            if (!(typeof id === 'string') || !(id in playbill.films)) {
                res.status(404).json({message: `Film '${id}' not found.`});
                return;
            } else {
                res.json(playbill.films.id);
            }
        } else {
            res.json(playbill.films);
        }
    })

    app.post('/api/films/:id', (req, res) => {
        const id = req.params.id;
        if (!(id in playbill.films)) {
            res.status(404).json({message: `Film '${id}' not found. (Submitting new films may only be done from the submission portal.)`});
            return;
        }
        const info = req.body as Partial<FilmInfo>
        if (!info) {
            res.status(400).json({message: "Reqest has no body!"});
            return;
        }

        if ('filename' in info || 'length' in info || 'uploadState' in info) {
            res.status(405).json({message: "Only the 'title', 'producer', 'email', and 'approvalState' fields may be modified."});
            return;
        }

        console.log(`Recieved update to film '${id}': ${JSON.stringify(req.body)}.`)
        if (info.title) playbill.database.push(`/films/${id}/title`, info.title);
        if (info.producer) playbill.database.push(`/films/${id}/producer`, info.producer);
        if (info.email) playbill.database.push(`/films/${id}/email`, info.email);
        if (info.approvalState !== undefined) playbill.database.push(`/films/${id}/approvalState`, info.approvalState);

        res.end();
    })

    app.get('/api/media', (req, res) => {
        const id = req.query.id as string;
        if ((typeof id) != 'string') {
            res.status(400).json({message: 'id query param must be a string.'});
            return;
        }
        const film = playbill.films[id];
        if (!film) {
            res.status(404).json({message: `Unknown film ID: '${id}'`});
            return;
        }
        if (film.uploadState === UploadState.Uploading || film.uploadState === UploadState.Processing) {
            res.status(409).json({message: "Film hasn't finished processing!"});
            return;
        }
        let file = path.resolve(config.data_folder, 'media', id+'.mp4');
        if (!fs.existsSync(file)) {
            res.status(500).json({message: "The server was unable to find the video file."});
        }
        res.sendFile(file);

    })

    initUploadAPI(config, playbill, app);
}