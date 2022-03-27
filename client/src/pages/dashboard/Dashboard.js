import { Component } from "react";
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteMap from '../../RouteMap';

class Dashboard extends Component {
    render() {
        return (
            <div>
                <Row className="m-4">
                    <Col xs={9} lg={9}>
                        <Form.Control type="text" placeholder="Search" />
                    </Col>
                    <Col>
                        <Button variant="success" className="w-100" onClick={() => {}}>Search</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Dashboard