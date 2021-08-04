import './css/bootstrap.css'
import React, { useState } from 'react';
import FileUploadComponent from './components/FileUploadComponent';
import { upload } from './logic/uploader';
import logo from './logo.svg';

function App() {
    const [progress, setProgress] = useState(0);

    return (
        <div className="App">
            <FileUploadComponent onSubmit={(file, request) => {
                upload(file, request, (progress) => {
                    setProgress(progress);
                });
            }}/>
            <progress value={progress}></progress>
        </div>
    );
}

export default App;
