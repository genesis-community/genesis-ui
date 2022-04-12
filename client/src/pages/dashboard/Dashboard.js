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
            deploymentData: [],
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
        const old_dep_data = [];

        for (const dep of this.state.selectedDeployments) {
            await fetch(`list/${dep.value}`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    old_dep_data.push([dep.value, data])
                })
                .catch(error => console.log(error))
        }
        this.setState({ deploymentData: [...this.state.deploymentData, ...old_dep_data], loading: false });
    }


    addSelect = (option) => {
        this.setState({ selectedDeployments: option })

        // Remove those deployment data which are not selected anymore
        const checkList = option.map(x => x.value);

        for (let i = 0; i < this.state.deploymentData.length; i++) {
            const d = this.state.deploymentData[i][0]
            if (checkList.indexOf(d) === -1) {
                const backup = this.state.deploymentData;
                backup.splice(i, 1);
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