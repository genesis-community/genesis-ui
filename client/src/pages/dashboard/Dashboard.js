import { Component } from "react";
import { Button, Row, Col, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteMap from '../../RouteMap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import DeploymentTable from "./DeploymentTable";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faStar, faTrash } from "@fortawesome/free-solid-svg-icons";

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deploymentList: [],
            selectedDeployments: [],
            animatedComponents: makeAnimated(),
            deploymentData: [],
            loading: false,
            quickViewDeployments: null,
            quickviewName: null,
        }
    }


    componentDidMount = async () => {
        if (localStorage.getItem("quickview")) {
            this.setState({ quickViewDeployments: JSON.parse(localStorage.getItem("quickview")) })
        }
        else {
            this.setState({ quickViewDeployments: {} })
        }
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
        this.setState({ deploymentData: [], loading: true });
        const old_dep_data = this.state.deploymentData;

        for (const dep of this.state.selectedDeployments) {
            await fetch(`list/${dep.value}`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    Object.keys(data).forEach(x => {
                        data[x].deployment_name = dep.value
                        old_dep_data.push(data[x])
                    })
                })
                .catch(error => console.log(error))
        }
        this.setState({ deploymentData: old_dep_data, loading: false });
    }

    sortData = (key, sort_by) => {
        const backup = this.state.deploymentData.sort((a, b) => sort_by ? (a[key].localeCompare(b[key])) : (b[key].localeCompare(a[key])))
        this.setState({ deploymentData: backup })
    }


    addSelect = (option) => {
        this.setState({ selectedDeployments: option })

        // Remove those deployment data which are not selected anymore
        const checkList = option.map(x => x.value);
        const backup = this.state.deploymentData.filter(x => checkList.indexOf(x.deployment_name) !== -1)
        this.setState({ deploymentData: backup, quickviewName: null });
    }

    existInList = (selected) => {
        const deployments = Object.values(this.state.quickViewDeployments);
        for (let item of deployments) {
            let same = true;
            for (let s of selected) {
                if (!item.includes(s)) {
                    same = false;
                    break;
                }
            }
            if (same && selected.length === item.length) {
                return true
            }
        }
        return false;
    }

    addQuickView = () => {
        // Set to localstorage or send to server (in future)
        const selected = this.state.selectedDeployments.map(x => x.value);
        if (!(this.existInList(selected))) {
            const backup = this.state.quickViewDeployments;
            backup[this.state.quickviewName] = selected
            this.setState({ quickViewDeployments: backup, quickviewName: null })
            localStorage.setItem("quickview", JSON.stringify(backup));
        }
    }

    removeQuickView = () => {
        const selected = this.state.selectedDeployments.map(x => x.value);

        for (let key in this.state.quickViewDeployments) {
            const item = this.state.quickViewDeployments[key];
            let same = true;
            for (let s of selected) {
                if (!item.includes(s)) {
                    same = false;
                    break;
                }
            }
            if (same && selected.length === item.length) {
                const backup = this.state.quickViewDeployments;
                delete backup[key];
                this.setState({ quickViewDeployments: backup })
                if (!Object.keys(backup).length) {
                    localStorage.removeItem("quickview");
                }
                else {
                    localStorage.setItem("quickview", JSON.stringify(backup));
                }
                return;
            }
        }
    }

    renderQuickView = () => {
        if (this.state.quickViewDeployments && (this.existInList(this.state.selectedDeployments.map(x => x.value)))) {
            return (
                <Row className="mx-4">
                    <Col>
                        <Alert variant={"danger"} onClick={this.removeQuickView} role="button">
                            <FontAwesomeIcon icon={faTrash} className="mx-2" />
                            Delete from Quick-View
                        </Alert>
                    </Col>
                </Row>
            )
        }
        else {
            return (
                <Row className="mx-4">
                    <Col>
                        <Alert variant={"info"} className={"mx-4"}>
                            <h6 className="text-center">Add to Quick-View</h6>
                            <Row className="text-center">
                                <Col xs={9} lg={9}>
                                    <Form.Control type="text" placeholder="Give a cute name to these of deployments..." onChange={(event) => this.setState({ quickviewName: event.target.value })} />
                                </Col>
                                <Col>
                                    <Button variant="dark" className="w-100" onClick={this.addQuickView}>Add</Button>
                                </Col>
                            </Row>
                        </Alert>
                    </Col>
                </Row>
            )
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

                {this.state.deploymentData && this.state.deploymentData.length ?
                    this.renderQuickView()
                    :
                    ""
                }

                <Row>
                    <Col className="text-center">
                        <DeploymentTable deployments={this.state.deploymentData} sortData={this.sortData} />

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