import { ApprovalState, FilmInfo, UploadState } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Alert, Badge, Button, ButtonGroup, ButtonToolbar, Col, Form, Modal, Row, ToggleButton } from 'react-bootstrap';

interface IProps {
    target: FilmInfo,
    id: string,
    onCancel?: () => void,
    onApply?: (info: Partial<FilmInfo>) => void,
    onDelete?: () => void
}

interface IState {
    title: string,
    producer: string,
    email: string,
    approvalState: ApprovalState,
    showDeleteConfirmation: boolean
}

export default class SubmissionEditor extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        
        const { id, target } = props;

        this.state = {
            title: target.title,
            producer: target.producer,
            email: target.email,
            approvalState: target.approvalState,
            showDeleteConfirmation: false
        }

        this.handleApply = this.handleApply.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
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

    handleDelete() {
        this.setState({ showDeleteConfirmation: false });
        if (this.props.onDelete) this.props.onDelete();
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
                <ButtonToolbar style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant='secondary' className='mr-1' onClick={() => {
                        if (onCancel) onCancel();
                    }}>Cancel</Button>

                    {this.props.onDelete ? <Button variant='danger' className='mr-1' onClick={() => {
                        this.setState({ showDeleteConfirmation: true });
                    }}>Delete</Button> : null}

                    <Button variant='primary' onClick={this.handleApply}>Apply</Button>
                </ButtonToolbar>
                <Modal show={state.showDeleteConfirmation} onHide={() => this.setState({ showDeleteConfirmation: false })}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure you want to delete?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>This cannot be undone, and if it's done in error,
                             the producer will likely be very mad.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => this.setState({ showDeleteConfirmation: false })}>Cancel</Button>
                        <Button variant='danger' onClick={this.handleDelete}>Delete</Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}