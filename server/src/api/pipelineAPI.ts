import { Router } from 'express';
import { Config } from '../config';
import pipeline from '../pipeline';
import PlayBill from '../playbill';

export default function pipelineAPI(config: Config, playbill: PlayBill) {
    const router = Router();

    router.get('/processing', (req, res) => {
        const transcodingFilms = pipeline.transcodingFilms;
        res.json(transcodingFilms);
    })

    return router;
}