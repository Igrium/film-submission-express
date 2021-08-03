import React, { Component, useState } from "react";
import { UploadRequest } from 'fse-shared/src/upload'

interface IProps {
    onSubmit: (file: File, request: UploadRequest) => void
}

interface IState {
    producer: string
    title: string
    email: string
    selectedFile: File | undefined
}

export default class FileUploadComponent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
    
        this.state = {
            producer: '',
            title: '',
            email: '',
            selectedFile: undefined
        }
    }
    
    
    render() {
        const handleSubmit = (e: React.SyntheticEvent) => {
            e.preventDefault();
            const target = e.target as typeof e.target & {
                file: { value: File };
            };

            if (this.state.selectedFile) {
                const file = this.state.selectedFile;
                let request: UploadRequest = {
                    title: this.state.title,
                    producer: this.state.producer,
                    email: this.state.email,
                    filename: file.name,
                    size: 0,
                    hash: ''
                }

                this.props.onSubmit(this.state.selectedFile, request);
            }
        }

        const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            let fileList = e.target.files
            if (fileList === null) {
                this.setState({ selectedFile: undefined });
            } else {
                this.setState({ selectedFile: fileList[0] });
            }
        }


        return (
            <div className='container'>
                <div className='row'>
                    <form onSubmit={handleSubmit}>
                        <h3>Upload Film</h3>
                        <div className='form-group'>
                            <input type='text' name='title' placeholder='Title' onChange={e => {
                                this.setState({ title: e.target.value });
                            }} />
                            <br/>
                            <input type='text' name='producer' placeholder='Producer Name' onChange={e => {
                                this.setState({ producer: e.target.value });
                            }} />
                            <br/>
                            <input type='email' name='email' placeholder='Email' onChange={e => {
                                this.setState({ email: e.target.value });
                            }} />
                            <br />
                            <input type='file' name='file' onChange={handleSelect}/>
                        </div>
                        <div className='form-group'>
                            <button className='btn btn-primary' type='submit'>Upload</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
    
}