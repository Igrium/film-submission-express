import { SimpleUser } from 'fse-shared/src/users'
import React, { Component } from 'react'
import { Alert, Button, Container, Table } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import api from '../logic/api'
import { AlertState } from '../util'

interface IState {
    users: SimpleUser[],
    selection?: string,
    alert?: AlertState
}

class AccountControl extends Component<any, IState> {
    constructor(props: any) {
        super(props)
    
        this.state = {
            users: []
        }
    }

    componentDidMount() {
        api.getAllUserData().then(users => {
            const data: SimpleUser[] = [];
            Object.keys(users).forEach(name => {
                data.push(users[name]);
            })
            this.setState({ users: data });
        }).catch(error => {
            this.setState({ alert: { variant: 'danger', message: `Unable to load users! ${error}` } });
        })
    }

    handleEdit = () => {
        this.props.history.push(`/profile?username=${this.state.selection}`)
    }

    render() {
        const { users, selection, alert } = this.state;
        return (
            <Container>
                <Table hover={true}>
                    <caption>User Accounts</caption>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => <AccountListing user={user}
                            selected={user.username === selection}
                            onClick={() => {
                                this.setState({ selection: user.username });
                            }} onDoubleClick={this.handleEdit} />)}
                    </tbody>
                </Table>
                <Button disabled={!selection} onClick={this.handleEdit}>Edit</Button>
                { alert ? <Alert className='mt-3' variant={alert.variant}>{alert.message}</Alert> : null}
            </Container>
        )
    }
}

export default withRouter(AccountControl);

export function AccountListing(props: { user: SimpleUser, selected?: boolean, onClick?: () => void, onDoubleClick?: () => void }) {
    return (
        <tr key={props.user.username} className={props.selected ? 'table-active' : ''} onClick={() => {
            if (props.onClick) props.onClick();
        }} onDoubleClick={() => {
            if(props.onDoubleClick) props.onDoubleClick();
        }}>
            <th scope='row' key='username'>{props.user.username}</th>
            <td key='email'>{props.user.email}</td>
            <td key='admin'>{props.user.admin ? 'true' : 'false'}</td>
        </tr>
    )
}
