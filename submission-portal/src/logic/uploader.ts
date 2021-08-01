import HugeUploader from 'huge-uploader'

export function upload(file: File) {
    console.log(`Submitting file: ${file}, ${typeof file}`);

    const uploader = new HugeUploader({ endpoint: 'http://localhost:5000/upload/', file: file })

    // subscribe to events
    uploader.on('error', (err: any) => {
        console.error('Something bad happened', err.detail);
    });

    uploader.on('progress', (progress: any) => {
        console.log(`The upload is at ${progress.detail}%`);
    });

    uploader.on('finish', (body: any) => {
        console.log('yeahhh - last response body:', body);
    });

    uploader.togglePause();
}