export enum ApprovalState {
    Pending,
    Approved,
    Rejected
}

export enum UploadState {
    /**
     * The film is still uploading from the producer's computer.
     */
    Uploading,
    /**
     * The final display version of the film is processing.
     */
    Processing,
    /**
     * The preview version that is streamable in realtime is processing.
     */
    ProcessingPreview,
    /**
     * The film has finished processing and is ready for approval.
     */
    Ready
}

export enum TranscodeState {
    Queued,
    Transcoding,
    Error,
    Finished
}

export interface TranscodeStatus {
    /**
     * Value from 0-1 representing how much of the transcode is complete.
     */
    percent: number
    state: TranscodeState
    eta?: string
}

/**
 * Basic metadata of a film.
 */
export interface FilmInfo {
    /**
     * Producer of the film (name or company).
     */
    producer: string
    /**
     * Title of the film.
     */
    title: string
    /**
     * Contact email of the producer.
     */
    email: string

    /**
     * The original filename of the film.
     */
    filename: string

    /**
     * The number of seconds in the film. 
     * Undefined if the film hasn't been processed.
     */
    length?: number

    /**
     * The upload state of this film.
     */
    uploadState: UploadState

    /**
     * The approval state of this film.
     */
    approvalState: ApprovalState
}

