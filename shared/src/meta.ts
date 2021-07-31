export enum ApprovalState {
    Pending,
    Approved,
    Rejected
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
     */
    length: number

    /**
     * Whether this 
     */
    processed: boolean

    /**
     * The approval state of this film.
     */
    approvalState: ApprovalState
}

