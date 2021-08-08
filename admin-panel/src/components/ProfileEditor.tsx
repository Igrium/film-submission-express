import { SimpleUser, UserWithPassword } from 'fse-shared/src/users';
import React, { Component } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap';

interface IProps {
    initial?: SimpleUser,
    allowNameChange?: boolean,
    allowAdminChange?: boolean,
    onSave?: (user: Partial<UserWithPassword>) => void
}

interface IState {
    username: string,
    email: string,
    admin: boolean
}

export default class ProfileEditor extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props)
        const { initial } = props;
        console.log(initial)
        this.state = {
            username: initial ? initial.username : '',
            email: initial ? initial.email : '',
            admin: initial ? initial.admin : false
        }
    }

    render() {
        const { username, email, admin } = this.state;
        const { allowNameChange, allowAdminChange, onSave } = this.props;

        return (
            <div>
                <Form onSubmit={(event) => {
                    event.preventDefault();
                    if (onSave) onSave({
                        username,
                        email,
                        admin
                    })
                }}>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={2}>Username</Form.Label>
                        <Col sm={5}><Form.Control type='text' value={username} disabled={!allowNameChange} /></Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Form.Label column sm={2}>Email</Form.Label>
                        <Col sm={5}><Form.Control type='email' value={email} onChange={ event => {
                            this.setState({ email: event.target.value })}
                            } /></Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <Col sm={5}><Form.Check type='checkbox' label='Admin' checked={admin}
                            disabled={!allowAdminChange} onChange={event => {
                            this.setState({ admin: event.target.checked });
                        }} /></Col>   
                    </Form.Group>
                    <Button variant='primary' type='submit'>Save</Button>
                </Form>
            </div>
        )
    }
}
