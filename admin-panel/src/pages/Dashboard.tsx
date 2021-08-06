import { TranscodeStatus } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Alert, Container } from 'react-bootstrap';
import PipelineView from '../components/PipelineView';
import api from '../logic/api';

interface AlertState {
    variant: string,
    message: string
}

interface IState {
    processing: Record<string, TranscodeStatus>
    alert?: AlertState
}

const REFRESH_RATE = 2000;

export default class Dashboard extends Component<any, IState> {
    interval?: NodeJS.Timeout;

    constructor(props: any) {
        super(props)
    
        this.state = {
            processing: {}
        }

        this.reloadPipelineView = this.reloadPipelineView.bind(this);
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
    
    render() {
        const { processing, alert } = this.state;

        return (
            <Container>
                <br />
                <h3>Pipeline</h3>
                <PipelineView processing={processing} />
                {alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null}
            </Container>
        )
    }
}