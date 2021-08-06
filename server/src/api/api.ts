import { Config } from "../config.js";
import PlayBill from "../playbill.js";
import { json, Request, Response, Router } from "express";
import { initUploadAPI } from "../upload.js";
import { FilmInfo, UploadState } from "../../../shared/dist/meta.js";
import path from "path";
import fs from "fs";
import { initFilmAPI } from "./films.js";
import session from "express-session";
import passport from "passport";
import pipelineAPI from "./pipelineAPI";

/**
 * Init an express app with a playbill.
 * @param config Server configuration.
 * @param playbill Active playbill.
 */
export function initAPI(config: Config, playbill: PlayBill) {
    const router = Router();

    
    const expressSession = session({
        secret: 'sdjkrfh298a',
    });

    router.use(expressSession);
    router.use(passport.initialize());
    router.use(passport.session());

    router.use(json());
    router.use('/api/films', initFilmAPI(config, playbill));
    router.use('/api/pipeline', pipelineAPI(config, playbill));

    router.get('/api/media', (req, res) => {
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

    initUploadAPI(config, playbill, router);
    return router;
}