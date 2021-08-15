import { FilmInfo } from 'fse-shared/dist/meta'
import React, { Component } from 'react'
import { Button, Card, Col, Container, Form, FormControl, ListGroup, Row } from 'react-bootstrap'
import { List } from 'react-bootstrap-icons'
import { ReplicationModel } from '../../util'
import backendInterface from '../backend_interface'
import PipelinePlaylistView from '../components/PipelinePlaylistView'
import PlaybackControls from '../components/PlaybackControls'

interface IState {
    mediaTime: number,
    mediaDuration: number,
    playing: boolean,
    pipelineOrder: string[],
    pipelineFilms: Record<string, FilmInfo>
}

export default class Controls extends Component<{}, IState> {
    constructor(props: {}) {
        super(props)
    
        this.state = {
            mediaTime: 0,
            mediaDuration: 1,
            playing: false,
            pipelineOrder: [],
            pipelineFilms: {}
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
        if (data.pipelineFilms) this.setState({ pipelineFilms: data.pipelineFilms });
    }

    render() {
        const { mediaTime, mediaDuration, playing, pipelineOrder, pipelineFilms } = this.state;

        return (
            <Container>
                <PlaybackControls
                    time={mediaTime}
                    duration={mediaDuration}
                    playing={playing}
                    onPlayPause={() => {
                        backendInterface.togglePlayback();
                    }} />
                <Button className='mb-3' onClick={() => {
                    backendInterface.loadVideoFile('file:///F:/Documents/Programming/film-submission-express/fse-server/data/media/AtVsyaDfhr.mp4')
                }}>Media Test</Button>
                <Card>
                    <Card.Header>Pipeline Film Playlist</Card.Header>
                    <Card.Body>
                        <PipelinePlaylistView order={pipelineOrder} films={pipelineFilms} />
                    </Card.Body>
                </Card>
                
            </Container>
        )
    }
}
