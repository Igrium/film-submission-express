import { FilmInfo } from 'fse-shared/dist/meta'
import React, { Component } from 'react'
import { Alert, Button, Card, Col, Container, Form, FormControl, ListGroup, Row } from 'react-bootstrap'
import { List } from 'react-bootstrap-icons'
import { NowPlaying, ReplicationModel } from '../../util'
import backendInterface from '../backend_interface'
import PipelinePlaylistView from '../components/PipelinePlaylistView'
import PlaybackControls from '../components/PlaybackControls'
import { AlertState } from '../reactUtils'

interface IState {
    mediaTime: number,
    mediaDuration: number,
    playing: boolean,
    pipelineOrder: string[],
    pipelineFilms: Record<string, FilmInfo>,
    nowPlaying: NowPlaying | null,
    alert?: AlertState
}

export default class Controls extends Component<{}, IState> {
    constructor(props: {}) {
        super(props)
    
        this.state = {
            mediaTime: 0,
            mediaDuration: 1,
            playing: false,
            pipelineOrder: [],
            pipelineFilms: {},
            nowPlaying: null
        }
    }
    
    componentDidMount() {
        backendInterface.onUpdateReplicationData(data => this.updateState(data));
        this.updateState(backendInterface.replicator.data);
        backendInterface.onMediaError((message, error) => {
            this.setState({ alert: {
                variant: 'danger',
                message: `Error in media player: ${message} See console for details.`
            } });
            console.error(error);
        });
    }

    private updateState(data: Partial<ReplicationModel>) {
        if (data.mediaDuration) this.setState({ mediaDuration: data.mediaDuration });
        if (data.mediaTime) this.setState({ mediaTime: data.mediaTime });
        if (data.isPlaying != null) this.setState({ playing: data.isPlaying });
        if (data.pipelineOrder) this.setState({ pipelineOrder: data.pipelineOrder });
        if (data.pipelineFilms) this.setState({ pipelineFilms: data.pipelineFilms });
        if (data.nowPlaying !== undefined) {
            this.setState({ nowPlaying: data.nowPlaying });
        }
    }

    private generateNowPlaying() {
        const { nowPlaying } = this.state;
        if (nowPlaying) {
            return `Now Playing: ${nowPlaying.id ? nowPlaying.id : nowPlaying.url}`
        } else {
            return "Nothing playing."
        }
    }

    render() {
        const { mediaTime, mediaDuration, playing, pipelineOrder, pipelineFilms, alert } = this.state;

        return (
            <Container>
                <Row className='mt-3 align-items-center'>
                    <Col md='auto'>
                        <small>{this.generateNowPlaying()}</small>
                    </Col>
                </Row>
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
                {
                    alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null
                }
            </Container>
        )
    }
}
