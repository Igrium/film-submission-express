import { TranscodeStatus } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Alert, Card, Container } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PipelineView from '../components/PipelineView';
import api from '../logic/api';
import { AlertState } from '../util';

interface IState {
    processing: Record<string, TranscodeStatus>
    alert?: AlertState
}

const REFRESH_RATE = 2000;

class Dashboard extends Component<any, IState> {
    interval?: NodeJS.Timeout;

    constructor(props: any) {
        super(props)
    
        this.state = {
            processing: {}
        }

        this.reloadPipelineView = this.reloadPipelineView.bind(this);
        this.handlePipelineOpen = this.handlePipelineOpen.bind(this);
    }

    componentDidMount() {
        this.reloadPipelineView();
        this.interval = setInterval(this.reloadPipelineView, REFRESH_RATE);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    reloadPipelineView() {
        api.getProcessingFilms().then(processing => {
            this.setState({ processing, alert: undefined })
        }).catch(err => {
            this.setState({ alert: { variant: 'danger', message: `Error retrieving pipeline state: ${err}`} })
        });
    }

    handlePipelineOpen(id: string) {
        this.props.history.push(`/submissions?select=${id}`);
    }
    
    render() {
        const { processing, alert } = this.state;

        return (
            <Container>
                <Card>
                    <Card.Header>Pipeline</Card.Header>
                    <Card.Body>
                        <PipelineView processing={processing} onOpen={this.handlePipelineOpen} />
                    </Card.Body>
                </Card>
                {alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null}
            </Container>
        )
    }
}

export default withRouter(Dashboard);