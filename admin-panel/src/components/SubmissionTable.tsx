import { Component } from 'react';
import { ApprovalState, FilmInfo, UploadState } from 'fse-shared/dist/meta'
import { Table } from 'react-bootstrap';
import { approvalStateMap, uploadStateMap } from '../util';

interface ListingProps {
    id: string,
    film: FilmInfo,
    selected?: boolean,
    onClick?: () => void
}

interface TableProps {
    films: Record<string, FilmInfo>
    caption?: string
    filter?: (film: FilmInfo) => boolean,
    selectable?: boolean,
    onSelect?: (id: string) => void
}

interface TableState {
    selection?: string
}

export default class SubmissionTable extends Component<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props);

        this.state = {};
    }

    render() {
        const { films, caption, filter, selectable, onSelect } = this.props;
        const { selection } = this.state;

        let keys: string[];
        if (filter) {
            keys = Object.keys(films).filter(key => filter(films[key]));
        } else {
            keys = Object.keys(films);
        }

        return (
            <Table size='sm' hover={selectable}>
                {caption ? <caption>{caption}</caption> : null}
                <thead>
                    <tr>
                        <th scope='col'>Title</th>
                        <th scope='col'>ID</th>
                        <th scope='col'>Producer</th>
                        <th scope='col'>Upload State</th>
                        <th scope='col'>Approval State</th>
                    </tr>
                </thead>
                <tbody>
                    {keys.map(id => <SubmissionListing id={id} film={films[id]} selected={id === selection} onClick={() => {
                        if (!selectable) return;
                        this.setState({ selection: id });
                        if (onSelect) onSelect(id);
                    }} />)}
                </tbody>
            </Table>
        )
    }
}

export class SubmissionListing extends Component<ListingProps> {
    render() {
        const { id, film, selected, onClick } = this.props;
        let uploadClass = '';
        if (film.uploadState === UploadState.Uploading) {
            uploadClass = 'table-danger';
        } else if (film.uploadState === UploadState.Processing) {
            uploadClass = 'table-warning';
        } else if (film.uploadState === UploadState.Ready) {
            uploadClass = 'table-success';
        }

        let approvalClass = '';
        if (film.approvalState === ApprovalState.Pending) {
            approvalClass = 'table-warning';
        } else if (film.approvalState === ApprovalState.Approved) {
            approvalClass = 'table-success';
        } else if (film.approvalState === ApprovalState.Rejected) {
            approvalClass = 'table-danger';
        }

        const handleClick = () => {
            if (onClick) {
                onClick();
            }
        }

        return (
            <tr className={selected ? 'table-active' : ''}>
                <th scope='row' onClick={handleClick}>{film.title}</th>
                <td onClick={handleClick}>{id}</td>
                <td onClick={handleClick}>{film.producer}</td>
                <td className={uploadClass} onClick={handleClick}>{uploadStateMap[film.uploadState]}</td>
                <td className={approvalClass} onClick={handleClick}>{approvalStateMap[film.approvalState]}</td>
            </tr>
        )
    }
}