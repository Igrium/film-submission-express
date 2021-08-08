import React, { Component } from 'react'
import { Alert, Col, Container, Form, Row, Button } from 'react-bootstrap'
import { FSEContext } from '../Context'
import api from '../logic/api'
import { AlertState } from '../util'

interface IProps {
    username: string
}

interface IState {
    username: string,
    email: string,
    admin: boolean,
    alert?: AlertState,
    selfAdmin: boolean,
    selfName: string
}

export default class Profile extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
    
        this.state = {
            username: props.username,
            email: '',
            admin: false,
            selfAdmin: false,
            selfName: ''
        }
    }
    
    componentDidMount() {
        api.getUserByName(this.props.username)
            .then(user => this.setState({
                username: user.username,
                email: user.email,
                admin: user.admin,
                alert: undefined 
            }))
            .catch(error => {
                console.error(error);
                this.setState({ alert: { variant: 'danger', message: `Failed to get user details: ${error}` } });
            })

        this.setState({ selfAdmin: this.context.admin, selfName: this.context.username });
    }

    save() {
        const { username, email, admin } = this.state;
        api.modifyUser(username, email, admin).then(() => {
            this.setState({ alert: { variant: 'success', message: "Updated user profile." } });
        }).catch(error => {
            this.setState({ alert: { variant: 'danger', message: `Failed to update user: ${error}` } });
        })
    }

    static contextType = FSEContext;

    render() {
        const { username, email, admin, alert, selfAdmin, selfName } = this.state;

        return (
            <Container className='mt-4'>
                <h3>Profile</h3>
                <Form onSubmit={(event) => {
                    event.preventDefault();
                    this.save();
                }}>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={2}>Username</Form.Label>
                        <Col sm={5}><Form.Control type='text' value={username} disabled={true} /></Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={2}>Email</Form.Label>
                        <Col sm={5}><Form.Control type='email' value={email} onChange={ event => {
                            this.setState({ email: event.target.value })}
                            } /></Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Check type='checkbox' label='Admin' checked={admin} disabled={!selfAdmin || this.props.username === selfName} onChange={event => {
                            this.setState({ admin: event.target.checked });
                        }} />
                    </Form.Group>
                    <Button variant='primary' type='submit'>Save</Button>
                </Form>
                {
                    alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null
                }
            </Container>
        )
    }
}
