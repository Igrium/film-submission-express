import React, { Component } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Creds } from '../../util';
import backendInterface from '../backend_interface';
import { AlertState } from '../reactUtils';

interface IProps {
    onLoggedIn?: (creds: Creds) => void
}

interface IState {
    address: string,
    username: string,
    password: string,
    validated: boolean,
    alert?: AlertState
}

export default class Login extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props)
    
        this.state = {
            address: 'https://',
            username: '',
            password: '',
            validated: false
        }
    }
    
    tryLogin(creds: Creds) {
        backendInterface.login(creds).then(() => {
            this.setState({ alert: { varient: 'success', message: "Authenticated." } });
            if (this.props.onLoggedIn) this.props.onLoggedIn(creds);
        }).catch((error) => {
            this.setState({ alert: { varient: 'danger', message: error.toString() } });
        });
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { 
        const form = event.currentTarget;
        event.preventDefault();
        const { address, username, password } = this.state;
        if (form.checkValidity()) {
            this.setState({ validated: false, alert: { varient: 'primary', message: "Attempting login..." } });
            this.tryLogin({ address, username, password });
        } else {
            event.stopPropagation();
            this.setState({ validated: true });
        }

    }

    render() {
        const { address, username, password, validated, alert } = this.state;

        return (
            <Container fluid className='login-container'>
                <Card style={{ width: '40em' }}>
                    <Card.Header>Login</Card.Header>
                    <Card.Body>
                        <Form noValidate validated={validated} onSubmit={this.handleSubmit}>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Server</Form.Label>
                                <Col sm={7}>
                                    <Form.Control required type='text' placeholder='server address' value={address} onChange={(event) => {
                                        this.setState({ address: event.target.value });
                                    }} />
                                </Col>
                                <Form.Control.Feedback>Please enter a server address.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Username</Form.Label>
                                <Col sm={7}>
                                    <Form.Control required type='text' placeholder='username' value={username} onChange={(event) => {
                                            this.setState({ username: event.target.value });
                                        }} />
                                </Col>
                                <Form.Control.Feedback>Please enter a username.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Password</Form.Label>
                                <Col sm={7}>
                                    <Form.Control required type='password' placeholder='password' value={password} onChange={(event) => {
                                            this.setState({ password: event.target.value });
                                        }} />
                                </Col>
                                <Form.Control.Feedback>Please enter a password.</Form.Control.Feedback>
                            </Form.Group>
                            <Button variant='primary' type='submit'>Submit</Button>
                        </Form>
                    </Card.Body>
                    {alert ? <Alert variant={alert.varient} className='mt-2 mx-2'>{alert.message}</Alert> : null}
                </Card>
            </Container>
        )
    }
}
