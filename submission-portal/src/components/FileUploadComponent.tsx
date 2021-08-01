import React, { Component, useState } from "react";

interface IProps {
    onSubmit: (file: File) => void
}

interface IState {
    selectedFile: File | undefined
}

export default class FileUploadComponent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
    
        this.state = {
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
                this.props.onSubmit(this.state.selectedFile);
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