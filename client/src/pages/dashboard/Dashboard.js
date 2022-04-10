import { Component } from "react";
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteMap from '../../RouteMap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import DeploymentTable from "./DeploymentTable";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deploymentList: [],
            selectedDeployments: [],
            animatedComponents: makeAnimated(),
            deploymentData: {},
            loading: false,
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


    getDeploymentData = async () => {
        this.setState({ loading: true });

        for (const dep of this.state.selectedDeployments) {
            await fetch(`list/${dep.value}`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    const old_dep_data = this.state.deploymentData;
                    old_dep_data[dep.value] = data
                    this.setState({ deploymentData: old_dep_data });
                })
                .catch(error => console.log(error))
        }
        console.log(this.state.deploymentData)
        this.setState({ loading: false });
    }


    addSelect = (option) => {
        this.setState({ selectedDeployments: option })

        // Remove those deployment data which are not selected anymore
        for (const d in this.state.deploymentData) {
            const checkList = option.map(x => x.value);
            console.log(checkList)
            if (checkList.indexOf(d) === -1) {
                const backup = this.state.deploymentData;
                delete backup[d];
                this.setState({ deploymentData: backup });
            }
        }
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
                        <Button variant="success" className="w-100" onClick={this.getDeploymentData}>Show Deployments</Button>
                    </Col>
                </Row>

                <Row>
                    <Col className="text-center">
                        <DeploymentTable deployments={this.state.deploymentData} />

                        {this.state.loading ?
                            <div><FontAwesomeIcon icon={faSpinner} spin /> &nbsp;&nbsp;Loading...</div>
                            :
                            ""
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Dashboard