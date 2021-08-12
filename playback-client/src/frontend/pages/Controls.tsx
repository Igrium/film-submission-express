import React, { Component } from 'react'
import { Button, Col, Container, Form, FormControl, Row } from 'react-bootstrap'
import backendInterface from '../backend_interface'
import PlaybackControls from '../components/PlaybackControls'

interface IState {
    mediaTime: number,
    mediaDuration: number
}

export default class Controls extends Component<{}, IState> {
    constructor(props: {}) {
        super(props)
    
        this.state = {
            mediaTime: 0,
            mediaDuration: 1
        }
    }
    
    componentDidMount() {
        backendInterface.onMediaTimeUpdate((time) => {
            this.setState({ mediaTime: time });
        });

        backendInterface.onMediaDurationChange((duration) => {
            this.setState({ mediaDuration: duration });
        });
    }

    render() {
        const { mediaTime, mediaDuration } = this.state;

        return (
            <Container>
                <PlaybackControls time={mediaTime} duration={mediaDuration} />
                <Button onClick={() => {
                    backendInterface.loadVideoFile('file:///F:/Documents/Programming/film-submission-express/server/data/media/AtVsyaDfhr.mp4')
                }}>Media Test</Button>
            </Container>
        )
    }
}
