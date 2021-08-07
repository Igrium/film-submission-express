import React, { Component } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { FSEContext } from '../Context'
import api from '../logic/api';

interface Alert {
    variant: string,
    message: string
}

interface IState {
    username: string,
    password: string,
    alert?: Alert
}

class Login extends Component<any, IState> {
    constructor(props: any) {
        super(props)
    
        this.state = {
            username: '',
            password: ''
        }
    }
    

    componentDidMount() {
        api.getUser().then(user => {
            if (user) this.props.history.push('/');
        })
    }

    handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const { username, password } = this.state;
        if (await api.login(username, password)) {
            window.location.reload();
        } else {
            this.setState({ alert: { variant: 'danger', message: "Unable to authenticate." } });
        }
    }
    

    render() {
        const { username, password, alert } = this.state;
        return (
            <Container fluid className='login-container'>
                <Card style={{ width: '40em' }}>
                    <Card.Header>Login</Card.Header>
                    <Card.Body>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Username</Form.Label>
                                <Col sm={5}><Form.Control type='text' placeholder='username' value={username} onChange={(event) => {
                                    this.setState({ username: event.target.value });
                                }} /></Col>
                            </Form.Group>
                            <Form.Group as={Row} className='mb-3'>
                                <Form.Label column sm={2}>Password</Form.Label>
                                <Col sm={5}><Form.Control type='password' placeholder='password' value={password} onChange={(event) => {
                                    this.setState({ password: event.target.value });
                                }} /></Col>
                            </Form.Group>
                            <Button variant='primary' type='submit'>Submit</Button>
                        </Form>
                        { alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null }
                    </Card.Body>
                </Card>
            </Container>
        )
    }
}

export default withRouter(Login);
