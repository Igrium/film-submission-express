import { ApprovalState, FilmInfo, UploadState } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Alert, Badge, Button, ButtonGroup, ButtonToolbar, Col, Form, Row, ToggleButton } from 'react-bootstrap';

interface IProps {
    target: FilmInfo,
    id: string,
    onCancel?: () => void,
    onApply?: (info: Partial<FilmInfo>) => void
}

interface IState {
    title: string,
    producer: string,
    email: string,
    approvalState: ApprovalState
}

export default class SubmissionEditor extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        
        const { id, target } = props;

        this.state = {
            title: target.title,
            producer: target.producer,
            email: target.email,
            approvalState: target.approvalState
        }

        this.handleApply = this.handleApply.bind(this);
    }
    
    changeStateAlert() {
        return (
            <Alert variant='warning'>
                Changes to a films approval state may modify the film lineup.
            </Alert>
        )
    }

    formatLength(length?: number) {
        return length !== undefined ? length.toString() : '[unknown]'
    }

    handleApply() {
        const state = this.state;
        const { onApply } = this.props;
        const newVal: Partial<FilmInfo> = {
            producer: state.producer,
            title: state.title,
            email: state.email,
            approvalState: state.approvalState
        }

        if (onApply) onApply(newVal);
    }

    formatUploadState(uploadState: UploadState) {
        if (uploadState === UploadState.Uploading) {
            return <Badge bg='danger'>Uploading</Badge>
        } else if (uploadState === UploadState.Processing) {
            return <Badge bg='warning'>Processing</Badge>
        } else if (uploadState === UploadState.ProcessingPreview) {
            return <Badge bg='info'>Processing Preview</Badge>
        } else if (uploadState === UploadState.Ready) {
            return <Badge bg='success'>Ready</Badge>
        } else {
            throw new Error(`Unknown upload state: ${uploadState}`);
        }
    }

    render() {
        const { id, target, onCancel, onApply } = this.props;
        const state = this.state;
        return (
            <>
                <Form>
                    <Form.Group as={Row} className='mb-3' controlId='formID'>
                        <Form.Label column sm='2'>ID</Form.Label>
                        <Form.Label column sm='10'>{id}</Form.Label>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3' controlId='formTitle'>
                        <Form.Label column sm={2}>Title</Form.Label>
                        <Col sm='10'><Form.Control type='text' defaultValue={state.title} onChange={event => {
                            this.setState({ title: event.target.value });
                        }} /></Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3' controlId='formProducer'>
                        <Form.Label column sm={2}>Producer</Form.Label>
                        <Col sm='10'><Form.Control type='text' defaultValue={state.producer} onChange={event => {
                            this.setState({ producer: event.target.value })
                        }}/></Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3' controlId='formEmail'>
                        <Form.Label column sm={2}>Email</Form.Label>
                        <Col sm='10'><Form.Control type='email' defaultValue={state.email} onChange={event => {
                            this.setState({ email: event.target.value })
                        }}/></Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3' controlId='formApprove'>
                        <Form.Label column sm={2}>Approval State</Form.Label>
                        <ButtonGroup>
                            <ToggleButton
                                key='0'
                                id='approval-0'
                                type='radio'
                                variant='outline-warning'
                                name='radio'
                                value={ApprovalState.Pending}
                                checked={state.approvalState === ApprovalState.Pending}
                                onChange={e => this.setState({ approvalState: ApprovalState.Pending })}
                            >Pending</ToggleButton>
                            <ToggleButton
                                key='1'
                                id='approval-1'
                                type='radio'
                                variant='outline-success'
                                name='radio'
                                value={ApprovalState.Approved}
                                checked={state.approvalState === ApprovalState.Approved}
                                onChange={e => this.setState({ approvalState: ApprovalState.Approved })}
                            >Approved</ToggleButton>
                            <ToggleButton
                                key='2'
                                id='approval-2'
                                type='radio'
                                variant='outline-danger'
                                name='radio'
                                value={ApprovalState.Rejected}
                                checked={state.approvalState === ApprovalState.Rejected}
                                onChange={e => this.setState({ approvalState: ApprovalState.Rejected })}
                            >Rejected</ToggleButton>
                        </ButtonGroup>
                    </Form.Group>
                    {state.approvalState !== target.approvalState ? this.changeStateAlert() : null}
                    <hr/>
                    <Form.Group as={Row} className='mb-3' controlId='formFileName'>
                        <Form.Label column sm={2}>File Name</Form.Label>
                        <Form.Label column sm={10}>{target.filename}</Form.Label>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3' controlId='formLength'>
                        <Form.Label column sm={2}>Length</Form.Label>
                        <Form.Label column sm={10}>{this.formatLength(target.length)}</Form.Label>
                    </Form.Group>
                    <Form.Label column sm={2}>Upload State</Form.Label>
                    {this.formatUploadState(target.uploadState)}
                </Form>
                <ButtonToolbar>
                    <Button variant='secondary' className='mr-1' onClick={() => {
                        if (onCancel) onCancel();
                    }}>Cancel</Button>
                    <Button variant='primary' onClick={this.handleApply}>Apply</Button>
                </ButtonToolbar>
            </>
        )
    }
}