import { FilmInfo } from 'fse-shared/dist/meta'
import React from 'react'
import { ListGroup, ProgressBar } from 'react-bootstrap'
import { Film } from 'react-bootstrap-icons'
import Playlist, { LitePlaylist } from '../../api/Playlist';

interface IProps {
    playlist: LitePlaylist,
    progressFunction?: (id: string) => number
}

export default function PlaylistView(props: IProps) {
    return (
        <ListGroup variant='flush'>
            {props.playlist.list.map(id => {
                let title = id;
                if (id in props.playlist.titles) {
                    title = props.playlist.titles[id]
                }
                return <FilmEntry id={id} title={title} progress={
                    props.progressFunction ? props.progressFunction(id) : undefined
                } />
            })}
        </ListGroup>
    )
}

function FilmEntry(props: { id: string, title: string, progress?: number }) {
    return (
        <ListGroup.Item id={props.id}>
            <b>{props.title}</b> ({props.id})
            {props.progress !== undefined ? <ProgressBar now={props.progress * 100} /> : null}
        </ListGroup.Item>
    )
}
