import { Component } from 'react';
import { ApprovalState, FilmInfo, UploadState } from 'fse-shared/dist/meta'
import { Table } from 'react-bootstrap';
import { approvalStateMap, uploadStateMap } from '../util';

interface ListingProps {
    id: string,
    film: FilmInfo
}

interface TableProps {
    films: Record<string, FilmInfo>
    caption?: string
    filter?: (film: FilmInfo) => boolean
}

export default class SubmissionTable extends Component<TableProps> {
    render() {
        const { films, caption, filter } = this.props;

        let keys: string[];
        if (filter) {
            keys = Object.keys(films).filter(key => filter(films[key]));
        } else {
            keys = Object.keys(films);
        }

        return (
            <Table className='table-sm'>
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
                    {keys.map(id => <SubmissionListing id={id} film={films[id]} />)}
                </tbody>
            </Table>
        )
    }
}

export class SubmissionListing extends Component<ListingProps> {
    render() {
        const { id, film } = this.props;
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

        return (
            <tr>
                <th scope='row'>{film.title}</th>
                <td>{id}</td>
                <td>{film.producer}</td>
                <td className={uploadClass}>{uploadStateMap[film.uploadState]}</td>
                <td className={approvalClass}>{approvalStateMap[film.approvalState]}</td>
            </tr>
        )
    }
}