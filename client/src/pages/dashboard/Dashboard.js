import { Component } from "react";
import { Card, Button, Row, Col, Alert } from 'react-bootstrap';
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
        }
    }


    componentDidMount = async () => {
        if (localStorage.getItem("quickview")) {
            this.setState({ quickViewDeployments: JSON.parse(localStorage.getItem("quickview")) })
        }
        else {
            this.setState({ quickViewDeployments: [] })
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
        this.setState({ deploymentData: backup });
    }

    existInList = (selected) => {
        for (let item of this.state.quickViewDeployments) {
            let same = true;
            for (let s of selected) {
                if (!item.includes(s)) {
                    same = false;
                    break;
                }
            }
            if (same) {
                return true;
            }
        }
        return false;
    }

    addQuickView = () => {
        // Set to localstorage or send to server (in future)
        const selected = this.state.selectedDeployments.map(x => x.value);
        if (!(this.existInList(selected))) {
            const backup = this.state.quickViewDeployments;
            backup.push(selected);
            this.setState({ quickViewDeployments: backup })
            localStorage.setItem("quickview", JSON.stringify(backup));
        }
    }

    removeQuickView = () => {
        const selected = this.state.selectedDeployments.map(x => x.value);
        console.log(this.state.quickViewDeployments)

        for (let i = 0; i < this.state.quickViewDeployments.length; i++) {
            const item = this.state.quickViewDeployments[i];
            let same = true;
            for (let s of selected) {
                if (!item.includes(s)) {
                    same = false;
                    break;
                }
            }
            if (same) {
                console.log("same found")
                const backup = this.state.quickViewDeployments;
                backup.splice(i, 1);
                this.setState({ quickViewDeployments: backup })
                if(!backup.length){
                    localStorage.removeItem("quickview");
                }
                else{
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
                        <Alert variant={"danger"} onClick={this.removeQuickView}>
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
                        <Alert variant={"info"} onClick={this.addQuickView}>
                            <FontAwesomeIcon icon={faStar} className="mx-2" />
                            Add to Quick-View
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