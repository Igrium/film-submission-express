import { DownloadState, DownloadStatus, FilmInfo } from 'fse-shared/dist/meta'
import React, { Component } from 'react'
import { Alert, Button, Card, Col, Container, Form, FormControl, ListGroup, Row } from 'react-bootstrap'
import { List } from 'react-bootstrap-icons'
import { NowPlaying, ReplicationModel } from '../../util'
import backendInterface from '../backend_interface'
import PlaylistView from '../components/PlaylistView'
import PlaybackControls from '../components/PlaybackControls'
import { AlertState } from '../reactUtils'
import { LitePlaylist } from '../../api/Playlist'

interface IState {
    mediaTime: number,
    mediaDuration: number,
    playing: boolean,
    nowPlaying: NowPlaying | null,
    playlists: Record<string, LitePlaylist>,
    downloadStatus: Record<string, DownloadStatus>,
    downloadQueue: string[],
    alert?: AlertState
}

export default class Controls extends Component<{}, IState> {
    constructor(props: {}) {
        super(props)
    
        this.state = {
            mediaTime: 0,
            mediaDuration: 1,
            playing: false,
            nowPlaying: null,
            downloadStatus: {},
            downloadQueue: [],
            playlists: {}
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

        backendInterface.onUpdatePlaylist((id, value) => {
            let playlists: Record<string, LitePlaylist> = {};
            playlists[id] = value;
            this.setState({
                playlists: { ...this.state.playlists, ...playlists }
            })
        })

        backendInterface.getPlaylists().then(playlists => {
            this.setState({ playlists });
        })
    }

    private updateState(data: Partial<ReplicationModel>) {
        if (data.mediaDuration) this.setState({ mediaDuration: data.mediaDuration });
        if (data.mediaTime) this.setState({ mediaTime: data.mediaTime });
        if (data.isPlaying != null) this.setState({ playing: data.isPlaying });
        if (data.nowPlaying !== undefined) {
            this.setState({ nowPlaying: data.nowPlaying });
        }
        if (data.downloadStatus) this.setState({ downloadStatus: data.downloadStatus });
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
        const { mediaTime, mediaDuration, playing, playlists, alert, downloadStatus, downloadQueue } = this.state;
        console.log(downloadQueue) // TESTING ONLY
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
                    backendInterface.startPlaylist('playbill')
                }}>Media Test</Button>
                {
                    Object.keys(playlists).map(title => <PlaylistCard title={title} playlist={playlists[title]} downloadStatus={downloadStatus} />)
                }
                <span className="mt-3">Downloads</span>
                <ListGroup variant='flush'>
                    {downloadQueue.map(id => {
                        let title;
                        if (id in backendInterface.replicator.data.titles) {
                            title = backendInterface.replicator.data.titles[id];
                        } else {
                            title = null;
                        }
                        return (
                            <ListGroup.Item key={id}>
                                <b>{title}</b> ({id})
                            </ListGroup.Item>
                        )
                    })}
                </ListGroup>
                {
                    alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null
                }
            </Container>
        )
    }
    
}

function PlaylistCard(props: {title: string, playlist: LitePlaylist, downloadStatus: Record<string, DownloadStatus>}) {

    let progressFunction: ((id: string) => number) | undefined;
    if (props.title === 'playbill') {
        progressFunction = (id) => {
            if (id in props.downloadStatus) {
                let status = props.downloadStatus[id];
                if (status.state == DownloadState.Ready) return 1;
                return status.percent ? status.percent : 0;
            } else {
                return 0;
            }
        }
    }

    return (
        <Card className='mb-3'>
            <Card.Header>{props.title}</Card.Header>
            <Card.Body>
                <PlaylistView playlist={props.playlist} progressFunction={progressFunction} />
            </Card.Body>
        </Card>
    )
}