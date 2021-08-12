import React, { Component } from 'react'
import { Button, Col, FormControl, Row } from 'react-bootstrap'
import { CaretLeftFill, CaretRightFill, SkipEndBtn, SkipEndFill, SkipStartFill } from 'react-bootstrap-icons'

interface IProps {
    disabled?: boolean,
    time?: number,
    duration?: number
}

export default class PlaybackControls extends Component<IProps> {
    render() {
        const { disabled, time, duration } = this.props;

        return (
            <Row noGutters className='mt-3 align-items-center'>
                <Col md='auto'><Button size='sm' disabled={disabled}><SkipStartFill /></Button></Col>
                <Col style={{height: 24}}><FormControl type='range' value={time} disabled={disabled}
                 className={`playback-slider ${disabled ? 'disabled' : ''}`} max={duration} /></Col>
                <Col md='auto'><Button size='sm' disabled={disabled}><SkipEndFill /></Button></Col>
            </Row>
        )
    }
}
