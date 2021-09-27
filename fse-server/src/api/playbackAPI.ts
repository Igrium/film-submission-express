import { Router } from "express";
import { playbackServer } from "../app";
import auth from "./auth";
import { PlaybackConnectionInfo } from 'fse-shared/src/playback'

export default function playbackAPI() {
    const router = Router();

    router.get('/', auth.checkCurator, (req, res) => {
        const connection = playbackServer.connection;
        if (!connection) {
            res.json({ connected: false });
            return;
        }

        const info: PlaybackConnectionInfo = { connected: true };
        info.ip = connection.handshake.address
        info.time = connection.handshake.time;
        info.issued = connection.handshake.issued;
        res.json(info);
    });

    router.get('/head', (req, res) => {
        res.json({ head: playbackServer.head });
    })

    router.get('/downloadQueue', auth.checkCurator, (req, res) => {
        if (playbackServer.connection == null) {
            res.status(500).json({message: "No playback client connected."});
        }
        res.json(playbackServer.downloadQueue);
    })

    return router;
}