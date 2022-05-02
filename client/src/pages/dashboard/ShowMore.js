import React, { Component } from "react";
import { Table, Row, Col, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

class ShowMore extends Component {
    //
    constructor(props) {
        super(props);
        this.state = {
            deploymentData: [],

        }
        const urlSearchParams = new URLSearchParams(window.location.search);

    }

    async componentDidMount() {
        await this.getDeployment();
    }

    getDeployment = async () => {
        const urlSearchParams = new URLSearchParams(window.location.search);

        const old_dep_data = this.state.deploymentData;
        // http://localhost:3000/list/genesis-lab/
        await fetch(`http://localhost:3000/list/${urlSearchParams.get("deployment")}`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                Object.keys(data).forEach(x => {
                    // data[x].deployment_name = dep.value
                    old_dep_data.push(data[x])
                })


            })
            .catch(error => console.log(error))

        this.setState({ deploymentData: this.state.deploymentData[new URLSearchParams(window.location.search).get("index")], loading: false });

    }


    render() {
        // console.log(this.state.deploymentData);

        // let deployment = this.state.deploymentData[new URLSearchParams(window.location.search).get("index")];
        console.log(this.state.deploymentData);

        return (
            <div>
                <center>
                    <h1>{new URLSearchParams(window.location.search).get("deployment") + " Details"}</h1>
                    <br />
                    <br />
                    <h2>
                        <ul>

                            {"Deployment Dated: " + this.state.deploymentData.dated}
                            <br />
                            <br />
                            {"Deployment Deployer: " + this.state.deploymentData.deployer}
                            <br />
                            <br />
                            {"Deployment Features: " + this.state.deploymentData.features}
                            <br />
                            <br />
                            {"Deployment Kit Dev: " + this.state.deploymentData.kit_is_dev}
                            <br />
                            <br />
                            {"Deployment Kit Name: " + this.state.deploymentData.kit_name}
                            <br />
                            <br />
                            {"Deployment Kit Version: " + this.state.deploymentData.kit_version}
                        </ul>

                    </h2>
                </center>
            </div>
        )
    }
}

export default ShowMore;

