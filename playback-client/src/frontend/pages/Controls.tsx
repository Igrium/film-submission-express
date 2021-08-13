import React, { Component } from 'react'
import { Button, Col, Container, Form, FormControl, Row } from 'react-bootstrap'
import backendInterface from '../backend_interface'
import PlaybackControls from '../components/PlaybackControls'

interface IState {
    mediaTime: number,
    mediaDuration: number,
    playing: boolean
}

export default class Controls extends Component<{}, IState> {
    constructor(props: {}) {
        super(props)
    
        this.state = {
            mediaTime: 0,
            mediaDuration: 1,
            playing: false
        }
    }
    
    componentDidMount() {
        backendInterface.onMediaTimeUpdate((time) => {
            this.setState({ mediaTime: time });
        });

        backendInterface.onMediaDurationChange((duration) => {
            this.setState({ mediaDuration: duration });
        });

        backendInterface.onSetIsPlaying(playing => {
            this.setState({ playing });
        })
    }

    render() {
        const { mediaTime, mediaDuration, playing } = this.state;

        return (
            <Container>
                <PlaybackControls
                    time={mediaTime}
                    duration={mediaDuration}
                    playing={playing}
                    onPlayPause={() => {
                        backendInterface.togglePlayback();
                    }} />
                <Button onClick={() => {
                    backendInterface.loadVideoFile('file:///F:/Documents/Programming/film-submission-express/server/data/media/AtVsyaDfhr.mp4')
                }}>Media Test</Button>
            </Container>
        )
    }
}
