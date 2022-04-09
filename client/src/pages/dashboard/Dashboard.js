import { Component } from "react";
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteMap from '../../RouteMap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deploymentList: [],
            selectedOptions: [],
            animatedComponents: makeAnimated(),
        }
    }

    componentDidMount = async () => {
        await this.fetchDeployments();
    }

    fetchDeployments = async () => {
        await fetch("list", {
            headers: {
                Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
            },
        })
            .then(response => response.json())
            .then(response => {
                const options = response["deploy_list"].map(deployment => ({
                    value: deployment,
                    label: deployment
                }))

                this.setState({
                    deploymentList: options
                })
            })
            .catch(error => console.log(error))
    }

    addSelect = (option) => {
        this.setState({ selectedOptions: option })
    }

    render() {
        return (
            <div>
                <Row className="m-4">
                    <Col xs={9} lg={9}>
                        <Select
                            options={this.state.deploymentList}
                            placeholder={"Select Deployments"}
                            closeMenuOnSelect={false}
                            components={this.state.animatedComponents}
                            isClearable
                            isMulti
                            onChange={this.addSelect} />
                    </Col>
                    <Col>
                        <Button variant="success" className="w-100">Show Deployments</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Dashboard