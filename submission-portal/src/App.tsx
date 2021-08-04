import './css/bootstrap.css'
import React from 'react';
import FileUploadComponent from './components/FileUploadComponent';
import { upload } from './logic/uploader';
import logo from './logo.svg';

function App() {
    return (
        <div className="App">
            <FileUploadComponent onSubmit={(file, request) => {
                upload(file, request);
            }}/>
        </div>
    );
}

export default App;
