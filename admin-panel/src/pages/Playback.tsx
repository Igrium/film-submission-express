import { FilmInfo } from 'fse-shared/src/meta'
import React, { Component } from 'react'
import { Alert, Card, Container } from 'react-bootstrap';
import { withRouter } from 'react-router'
import { PlaybackConnectionInfo } from 'fse-shared/src/playback'
import api from '../logic/api';
import { AlertState } from '../util';


interface IState {
    films: Record<string, FilmInfo>,
    connectionInfo?: PlaybackConnectionInfo,
    alert?: AlertState
}
class Playback extends Component<any, IState> {

    constructor(props: any) {
        super(props)
    
        this.state = {
            films: {}
        }
    }

    generateConnectionString() {
        const { connectionInfo } = this.state;
        if (!connectionInfo) return <span />;
        if (!connectionInfo.connected) return <span>No playback client connected.</span>;
        return (
            <span>
                Client IP: {connectionInfo.ip}
                <br />
                Connected: {connectionInfo.time}
            </span>
        )
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        api.getFilms().then(films => {
            this.setState({ films });
        }).catch(reason => {
            console.error(reason);
            this.setState({ alert: {message: `${reason}`, variant: 'danger'} })
        })
        api.getPlaybackClient().then(info => {
            this.setState({ connectionInfo: info });
        }).catch(reason => {
            console.error(reason);
            this.setState({ alert: {
                message: `Unable to fetch connection info. ${reason}`, variant: 'danger'
            } })
        });
    }

    render() {
        const { alert } = this.state;
        return (
            <Container>
                <Card>
                    <Card.Header>
                        Connection Info
                    </Card.Header>
                    <Card.Body>
                        {this.generateConnectionString()}
                    </Card.Body>
                </Card>
                {alert ? <Alert className='mt-3' variant={alert.variant}>
                    {alert.message}
                </Alert> : null}
            </Container>
        )
    }
}

export default withRouter(Playback);