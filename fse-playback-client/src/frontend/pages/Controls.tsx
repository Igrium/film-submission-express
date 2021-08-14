import React, { Component } from 'react'
import { Button, Col, Container, Form, FormControl, ListGroup, Row } from 'react-bootstrap'
import { List } from 'react-bootstrap-icons'
import { ReplicationModel } from '../../util'
import backendInterface from '../backend_interface'
import PlaybackControls from '../components/PlaybackControls'

interface IState {
    mediaTime: number,
    mediaDuration: number,
    playing: boolean,
    pipelineOrder: string[]
}

export default class Controls extends Component<{}, IState> {
    constructor(props: {}) {
        super(props)
    
        this.state = {
            mediaTime: 0,
            mediaDuration: 1,
            playing: false,
            pipelineOrder: []
        }
    }
    
    componentDidMount() {
        backendInterface.onUpdateReplicationData(data => this.updateState(data));
        this.updateState(backendInterface.replicator.data);
    }

    private updateState(data: Partial<ReplicationModel>) {
        if (data.mediaDuration) this.setState({ mediaDuration: data.mediaDuration });
        if (data.mediaTime) this.setState({ mediaTime: data.mediaTime });
        if (data.isPlaying !== undefined) this.setState({ playing: data.isPlaying });
        if (data.pipelineOrder) this.setState({ pipelineOrder: data.pipelineOrder });
    }

    render() {
        const { mediaTime, mediaDuration, playing, pipelineOrder } = this.state;

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
                    backendInterface.loadVideoFile('file:///F:/Documents/Programming/film-submission-express/fse-server/data/media/AtVsyaDfhr.mp4')
                }}>Media Test</Button>
                <ListGroup>
                    {pipelineOrder.map(value => <ListGroup.Item id={value}>{value}</ListGroup.Item>)}
                </ListGroup>
            </Container>
        )
    }
}
