import React, { Component } from "react";
import {Modal, Button} from 'react-bootstrap';
import { Table, Row, Col, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

class ShowMore extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            deploymentData: [],
            show: false,
        }
    }
    //Displaying deployment data using props
    render() {
        return (
            <div key={this.props.index}>
                <Button variant="primary" onClick={() => this.setState({show : true})}>
                        Show more
                </Button>
                <Modal
                    show = {this.state.show}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {this.props.deployment}
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ul>
                            {"Deployment Dated: " + this.props.data.dated}
                            <br />
                            <br />
                            {"Deployment Deployer: " + this.props.data.deployer}
                            <br />
                            <br />
                            {"Deployment Features: " + this.props.data.features}
                            <br />
                            <br />
                            {"Deployment Kit Dev: " + this.props.data.kit_is_dev}
                            <br />
                            <br />
                            {"Deployment Kit Name: " + this.props.data.kit_name}
                            <br />
                            <br />
                            {"Deployment Kit Version: " + this.props.data.kit_version}
                        </ul>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button onClick={() => this.setState({show : false})}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
           
        )
    }
}

export default ShowMore;

