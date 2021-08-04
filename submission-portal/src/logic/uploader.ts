import { UploadRequest } from 'fse-shared/src/upload';
import HugeUploader from 'huge-uploader'

export function upload(file: File, request: UploadRequest, onProgress?: (percent: number) => void) {
    console.log(`Submitting file: ${file}, ${typeof file}`);

    const uploader = new HugeUploader({
        endpoint: '/upload',
        file: file,
        postParams: request
    })

    // subscribe to events
    uploader.on('error', (err: any) => {
        console.error('Something bad happened', err.detail);
    });

    uploader.on('progress', (progress: any) => {
        console.log(`The upload is at ${progress.detail}%`);
        if (onProgress) {
            onProgress(progress.detail / 100);
        }
    });

    uploader.on('finish', (body: any) => {
        console.log('yeahhh - last response body:', body);
    });
    
}