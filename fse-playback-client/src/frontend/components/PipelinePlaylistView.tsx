import { FilmInfo } from 'fse-shared/dist/meta'
import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { Film } from 'react-bootstrap-icons'

interface IProps {
    order: string[],
    films: Record<string, FilmInfo>
}

export default function PipelinePlaylistView(props: IProps) {
    console.log(props);
    return (
        <ListGroup variant='flush'>
            {props.order.map(id => {
                let info = props.films[id];
                if (!info) return null;
                return <FilmEntry id={id} info={props.films[id]} />
            })}
        </ListGroup>
    )
}

function FilmEntry(props: {id: string, info: FilmInfo}) {
    return (
        <ListGroup.Item id={props.id}><b>{props.info.title}</b> ({props.id})</ListGroup.Item>
    )
}
