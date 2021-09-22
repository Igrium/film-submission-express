import { FilmInfo } from 'fse-shared/dist/meta'
import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { Film } from 'react-bootstrap-icons'
import Playlist, { LitePlaylist } from '../../api/Playlist';

interface IProps {
    playlist: LitePlaylist
}

export default function PlaylistView(props: IProps) {
    console.log(props);
    return (
        <ListGroup variant='flush'>
            {props.playlist.list.map(id => {
                let title = id;
                if (id in props.playlist.titles) {
                    title = props.playlist.titles[id]
                }
                return <FilmEntry id={id} title={title} />
            })}
        </ListGroup>
    )
}

function FilmEntry(props: {id: string, title: string}) {
    return (
        <ListGroup.Item id={props.id}><b>{props.title}</b> ({props.id})</ListGroup.Item>
    )
}
