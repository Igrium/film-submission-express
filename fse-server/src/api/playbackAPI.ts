import { Router } from "express";
import { playbackServer } from "../app";
import auth from "./auth";

export default function playbackAPI() {
    const router = Router();

    router.get('/', auth.checkCurator, (req, res) => {
        const connection = playbackServer.connection;
        if (!connection) {
            res.json({ connected: false });
            return;
        }

        const ip = connection.handshake.address
        const time = connection.handshake.time;
        const issued = connection.handshake.issued;
        res.json({
            connected: true,
            ip,
            time,
            issued
        });
    });

    router.get('/head', (req, res) => {
        res.json({ head: playbackServer.head });
    })

    router.get('/downloadQueue', (req, res) => {
        if (playbackServer.connection == null) {
            res.status(500).json({message: "No playback client connected."});
        }
        res.json(playbackServer.downloadQueue);
    })

    return router;
}