export interface UploadMeta {
    /**
     * The ID the film was assigned.
     */
    id: string

    /**
     * The size of the chunks that the file should be sent in, in mebibytes
     */
    chunkSize: number
}

export interface ChunkMeta {
    index: number
    hash: string
}

export interface ChunkResponse {
    /**
     * The chunk the client should send next.
     */
    next: number
}

export interface UploadRequest {
    producer: string,
    title: string,
    email: string,
    filename: string,
    hash: string,
    size: number,
    
}