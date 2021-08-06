import { TranscodeStatus, TranscodeState } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Badge, Col, ListGroup, ListGroupItem, ProgressBar, Row } from 'react-bootstrap';

interface IProps {
    processing: Record<string, TranscodeStatus>
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
                    <ListGroupItem as={Row}>
                        <Col xs={4}>{id} {renderBadge(processing[id].state)}</Col>
                        <Col xs={8}><ProgressBar now={processing[id].percent * 100} label={`${processing[id].percent * 100}%`}/></Col>
                        {processing[id].eta !== undefined ? `Time Remaining: ${processing[id].eta}` : null}
                    </ListGroupItem>)}
            </ListGroup>
        )
    }
}