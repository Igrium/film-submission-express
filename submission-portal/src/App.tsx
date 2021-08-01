import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react';
import FileUploadComponent from './components/FileUploadComponent';
import { upload } from './logic/uploader';
import logo from './logo.svg';

function App() {
    return (
        <div className="App">
            <FileUploadComponent onSubmit={handleUpload}/>
        </div>
    );
}

function handleUpload(file: File) {
    upload(file);
}

export default App;
