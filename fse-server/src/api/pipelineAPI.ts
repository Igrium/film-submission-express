import { Router } from 'express';
import { playbackServer } from '../app';
import { Config } from '../config';
import pipeline from '../pipeline';
import PlayBill from '../playbill';
import auth from './auth';

export default function pipelineAPI(config: Config, playbill: PlayBill) {
    const router = Router();

    router.get('/processing', (req, res) => {
        const transcodingFilms = pipeline.transcodingFilms;
        res.json(transcodingFilms);
    })

    router.get('/downloading', (req, res) => {
        const downloadFilms = pipeline.downloadingFilms;
        res.json(downloadFilms);
    })

    router.get('/downloading/:id', (req, res) => {
        let id = req.params.id;
        if (!(id in playbill.films)) {
            res.status(404).json({ message: 'Film not found.' });
            return;
        }
        res.json(pipeline.getDownloadStatus(id));
    })

    return router;
}