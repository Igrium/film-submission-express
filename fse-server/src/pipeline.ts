import { DownloadState, DownloadStatus, TranscodeStatus } from "fse-shared/dist/meta";

/**
 * Keeps track of global variables in the submission pipeline.
 */
namespace pipeline {
    /**
     * All films that are currently transcoding.
     */
    export const transcodingFilms = {} as Record<string, TranscodeStatus>
}

export default pipeline