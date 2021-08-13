import React, { Component } from 'react'
import { Button, Col, FormControl, Row } from 'react-bootstrap'
import { CaretLeftFill, CaretRightFill, PauseFill, PlayFill, SkipEndBtn, SkipEndFill, SkipStartFill } from 'react-bootstrap-icons'

interface IProps {
    disabled?: boolean,
    time?: number,
    duration?: number
    playing?: boolean
    onPlayPause?: () => void
}

export default class PlaybackControls extends Component<IProps> {
    private handlePlayPause = () => {
        if (this.props.onPlayPause) this.props.onPlayPause();
    }

    render() {
        const { disabled, time, duration, playing } = this.props;

        return (
            <Row className='mt-3 align-items-center'>
                <Col md='auto'><Button size='sm' disabled={disabled}><SkipStartFill /></Button></Col>
                <Col style={{height: 24}}><FormControl readOnly type='range' value={time} disabled={disabled}
                 className={`playback-slider ${disabled ? 'disabled' : ''}`} max={duration} /></Col>
                <Col md='auto'><Button size='sm' disabled={disabled}><SkipEndFill /></Button></Col>
                <Col md='auto'><Button size='sm' disabled={disabled} onClick={this.handlePlayPause}>
                    {playing ? <PauseFill /> : <PlayFill />}
                </Button></Col>
            </Row>
        )
    }
}
