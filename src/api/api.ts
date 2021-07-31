import { Config } from "../config.js";
import PlayBill from "../playbill.js";
import { Router } from "express";

/**
 * Init an express app with a playbill.
 * @param config Server configuration.
 * @param playbill Active playbill.
 * @param app Express app.
 */
export function initAPI(config: Config, playbill: PlayBill, app: Router) {
    app.get('/films', (req, res) => {
        if ('id' in req.query) {
            let id = req.query.id;

            if (!(typeof id === 'string') || !(id in playbill.films)) {
                res.status(404).json({message: `Film '${id}' not found.`});
            } else {
                res.json(playbill.films.id);
            }
        } else {
            res.json(playbill.films);
        }
    })
}