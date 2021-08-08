import React, { Component } from 'react'
import { Alert, Col, Container, Form, Row, Button } from 'react-bootstrap'
import ProfileEditor from '../components/ProfileEditor'
import { FSEContext } from '../Context'
import api from '../logic/api'
import { AlertState } from '../util'

interface IProps {
    username: string
}

interface IState {
    alert?: AlertState,
    selfAdmin: boolean,
    selfName: string
    initial?: api.User
}

export default class Profile extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
    
        this.state = {
            selfAdmin: false,
            selfName: ''
        }
    }
    
    componentDidMount() {
        api.getUserByName(this.props.username)
            .then(user => this.setState({
                alert: undefined,
                initial: user
            }))
            .catch(error => {
                console.error(error);
                this.setState({ alert: { variant: 'danger', message: `Failed to get user details: ${error}` } });
            })

        this.setState({ selfAdmin: this.context.admin, selfName: this.context.username });
    }

    save = (user: Partial<api.User>) => {
        api.modifyUser(this.props.username, user.email, user.admin).then(() => {
            this.setState({ alert: { variant: 'success', message: "Updated user profile." } });
        }).catch(error => {
            this.setState({ alert: { variant: 'danger', message: `Failed to update user: ${error}` } });
        })
    }

    static contextType = FSEContext;

    render() {
        const { alert, selfAdmin, selfName, initial } = this.state;
        const { username } = this.props;
        return (
            <Container className='mt-4'>
                <h3>{this.props.username}</h3>
                { initial ? <ProfileEditor initial={initial}
                    allowAdminChange={username !== selfName && selfAdmin} onSave={this.save} /> : null }
                {
                    alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null
                }
            </Container>
        )
    }
}
