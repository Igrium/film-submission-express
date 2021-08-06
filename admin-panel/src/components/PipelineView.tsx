import { TranscodeStatus, TranscodeState } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Badge, Col, ListGroup, ListGroupItem, ProgressBar, Row } from 'react-bootstrap';

interface IProps {
    processing: Record<string, TranscodeStatus>
    onOpen?: (id: string) => void
}

export default class PipelineView extends Component<IProps> { 

    render() {
        function renderBadge(state: TranscodeState) {
            if (state === TranscodeState.Queued) {
                return <Badge bg='warning'>Queued</Badge>
            } else if (state === TranscodeState.Transcoding) {
                return <Badge bg='primary'>Transcoding</Badge>
            } else if (state === TranscodeState.Finished) {
                return <Badge bg='success'>Finished</Badge>
            } else if (state === TranscodeState.Error) {
                return <Badge bg='dangerous'>Error</Badge>
            } else {
                return <Badge bg='secondary'>{state}</Badge>
            }
        }
        const { processing } = this.props;
        return(
            <ListGroup>
                {Object.keys(processing).map(id => 
                    <ListGroupItem as={Row} onDoubleClick={() => {
                        if (this.props.onOpen) {
                            this.props.onOpen(id);
                        }
                    }}>
                        <Col xs={4}>{id} {renderBadge(processing[id].state)}</Col>
                        <Col md='auto'><ProgressBar now={processing[id].percent * 100} label={`${(processing[id].percent * 100).toFixed(2)}%`}/></Col>
                    </ListGroupItem>)}
            </ListGroup>
        )
    }
}