import { ApprovalState, FilmInfo } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Alert, Button, Container, Modal } from 'react-bootstrap';
import App from '../App';
import SubmissionEditor from '../components/SubmissionEditor';
import SubmissionTable from '../components/SubmissionTable';
import { api } from '../logic/api';

interface IState {
    films: Record<string, FilmInfo>
    selected?: string
    showEditor: boolean
    alert?: AlertState
}

interface AlertState {
    variant: string,
    message: string
}

export default class Submissions extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = { films: {}, showEditor: false}

        this.handleSelect = this.handleSelect.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleApplyEdit = this.handleApplyEdit.bind(this);
    }

    componentDidMount() {
        this.refreshTable();
    }

    refreshTable() {
        api.getFilms().then(films => {
            this.setState({ films, alert: undefined });
        }).catch(error => {
            console.error(error);
            this.setState({ alert: { variant: 'danger', message: `Unable to fetch submissions! ${error}` } });
        })
    }

    handleSelect(id: string) {
        this.setState({ selected: id });
    }

    handleEdit() {
        this.setState({ showEditor: true });
    }

    handleApplyEdit(info: Partial<FilmInfo>) {
        this.setState({ showEditor: false });
        api.postFilm(this.state.selected as string, info).catch(error => {
            console.error(error);
            this.setState({ alert: { variant: 'danger', message: `Unable to POST submission! ${error}` } })
        }).then(() => {
            this.refreshTable();
        });
    }

    render() {
        const { films, selected, showEditor, alert } = this.state;

        return (
            <Container>
                <br />
                <SubmissionTable films={films} selectable caption='All submissions' onSelect={this.handleSelect}/>
                <Button onClick={() => this.refreshTable()} className='mr-1'>
                    <span className='glyphicon glyphicon-refresh' ></span> Refresh
                </Button>
                <Button className='mr-1' disabled={selected === undefined} onClick={this.handleEdit}>
                    Edit
                </Button>
                <Modal size='lg' show={showEditor} onHide={() => this.setState({ showEditor: false })}>
                    <Modal.Header closeButton>
                        <Modal.Title id='edit-submission'>
                            Edit Submission
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SubmissionEditor target={films[selected as string]} id={selected as string} onApply={this.handleApplyEdit} onCancel={() => {
                            this.setState({ showEditor: false });
                        }}/>
                    </Modal.Body>
                </Modal>
                <br />
                { alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null }
            </Container>
        )
    }
}