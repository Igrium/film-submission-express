import { FilmInfo } from 'fse-shared/dist/meta';
import { Component } from 'react';
import { Alert, Button, Container, Modal } from 'react-bootstrap';
import { useLocation, withRouter } from 'react-router-dom';
import SubmissionEditor from '../components/SubmissionEditor';
import SubmissionTable from '../components/SubmissionTable';
import { api } from '../logic/api';
import { AlertState } from '../util';

interface IState {
    films: Record<string, FilmInfo>
    selected?: string
    showEditor: boolean
    alert?: AlertState
}

class Submissions extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = { films: {}, showEditor: false}

        this.handleSelect = this.handleSelect.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleApplyEdit = this.handleApplyEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        this.refreshTable();
        let select = this.useQuery().get('select');
        if (select) {
            this.setState({ selected: select });
        }
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
        api.postFilm(this.state.selected as string, info).then(() => {
            this.refreshTable();
        }).catch(error => {
            console.error(error);
            this.setState({ alert: { variant: 'danger', message: `Unable to POST submission! ${error}` } });
        });
    }

    handleDelete() {
        this.setState({ showEditor: false });
        api.deleteFilm(this.state.selected as string).catch(error => {
            console.error(error);
            this.setState({ alert: { variant: 'danger', message: `Unable to DELETE submission! ${error}` } });
        }).then(() => {
            this.refreshTable();
        })
    }

    /**
     * Parse query string
     */
    useQuery() {
        return new URLSearchParams(this.props.location.search);
    }

    render() {
        const { films, selected, showEditor, alert } = this.state;
        return (
            <Container>
                <SubmissionTable films={films} selectable caption='All submissions' onSelect={this.handleSelect}
                selection={selected} />
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
                        <SubmissionEditor target={films[selected as string]} id={selected as string}
                        onApply={this.handleApplyEdit} onCancel={() => {this.setState({ showEditor: false });}}
                        onDelete={this.handleDelete}/>
                    </Modal.Body>
                </Modal>
                <br />
                { alert ? <Alert variant={alert.variant}>{alert.message}</Alert> : null }
            </Container>
        )
    }
}

export default withRouter(Submissions);