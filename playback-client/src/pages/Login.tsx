import React, { Component } from 'react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';

export interface Creds {
    address: string,
    username: string,
    password: string
}

interface IProps {
    onLoggedIn?: (creds: Creds) => void
}

interface IState {
    address: string,
    username: string,
    password: string
}

export default class Login extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props)
    
        this.state = {
            address: 'https://',
            username: '',
            password: ''
        }
    }
    
    tryLogin(creds: Creds) {
        
    }

    handleSubmit = () => {

    }

    render() {
        const { address, username, password } = this.state;

        return (
            <Container fluid className='login-container'>
                <Card style={{ width: '40em' }}>
                    <Card.Header>Login</Card.Header>
                    <Card.Body>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Server</Form.Label>
                                <Col sm={7}>
                                    <Form.Control type='text' placeholder='server address' value={address} onChange={(event) => {
                                        this.setState({ address: event.target.value });
                                    }} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Username</Form.Label>
                                <Col sm={7}>
                                    <Form.Control type='text' placeholder='username' value={username} onChange={(event) => {
                                            this.setState({ username: event.target.value });
                                        }} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Password</Form.Label>
                                <Col sm={7}>
                                    <Form.Control type='password' placeholder='password' value={password} onChange={(event) => {
                                            this.setState({ password: event.target.value });
                                        }} />
                                </Col>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        )
    }
}
