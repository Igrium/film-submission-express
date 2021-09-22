import { DownloadState, DownloadStatus, TranscodeStatus } from "fse-shared/dist/meta";

/**
 * Keeps track of global variables in the submission pipeline.
 */
namespace pipeline {
    /**
     * All films that are currently transcoding.
     */
    export const transcodingFilms = {} as Record<string, TranscodeStatus>
    
    /**
     * All films and their status transmitting to the playback client.
     * Films not included in this list are assumed to be `Waiting`.
     */
    export let downloadingFilms = {} as Record<string, DownloadStatus>

    export function getDownloadStatus(id: string): DownloadStatus {
        if (id in downloadingFilms) {
            return downloadingFilms[id];
        } else {
            return { state: DownloadState.Waiting };
        }
    }
}

export default pipeline