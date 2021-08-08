import express, { json } from "express";
import { FilmInfo } from "fse-shared/dist/meta";
import { Config } from "../config";
import PlayBill from "../playbill";
import auth from './auth';

export function initFilmAPI(config: Config, playbill: PlayBill) {
    const router = express.Router();

    router.use(json());
    
    router.get('/:id', (req, res) => {
        const id = req.params.id;
        if (!(id in playbill.films)) {
            res.status(404).json({message: `Film '${id}' not found.`});
            return;
        }
        res.json(playbill.films.id);
    })
    
    router.get('/', (req, res) => {
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
    
    router.post('/:id', auth.checkCurator, (req, res) => {
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

    router.delete('/:id', auth.checkCurator, (req, res) => {
        const id = req.params.id;
        if (!(id in playbill.films)) {
            res.status(404).json({message: `Film ${id} not found.`});
            return;
        }

        playbill.database.delete(`/films/${id}`);
        res.end();
        console.log(`Deleted film '${id}'.`);
    })

    return router;
}

