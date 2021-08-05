import { ApprovalState, FilmInfo } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import App from '../App';
import SubmissionTable from '../components/SubmissionTable';
import { api } from '../logic/api';

interface IState {
    films: Record<string, FilmInfo>
}

export default class Submissions extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = { films: {} }
    }

    componentDidMount() {
        this.refreshTable();
    }

    refreshTable() {
        api.getFilms().then(films => {
            this.setState({ films });
        })
    }

    render() {
        return (
            <Container>
                <br />
                <SubmissionTable films={this.state.films} caption='All submissions'/>
                <Button onClick={() => this.refreshTable()}>
                    <span className='glyphicon glyphicon-refresh' ></span> Refresh
                </Button>
            </Container>
        )
    }
}