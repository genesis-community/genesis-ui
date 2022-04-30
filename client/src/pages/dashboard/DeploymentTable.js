import { Component } from "react";
import { Table, Row, Col, Alert, Badge } from "react-bootstrap";
import ShowMore from "./ShowMore";
// import { Navigate } from 'react-router-dom';
import {Link, Redirect} from "react-router-dom";
import Settings from "../../Settings";
import RouteMap from "../../RouteMap";

class DeploymentTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sorting: {
                deployment_name: true,
                kit_name: true,
                dated: true,
                kit_version: true,
                showComponent: false,

            }
        }

    }




    renderTable = () => {
        const tableData = [];
        for (const data of this.props.deployments) {
                tableData.push(
                    <tr>
                        <td>{data.deployment_name}</td>
                        <td>{data.kit_name ?? "-"}</td>
                        <td>{data.dated ?? "-"}</td>
                        <td>{data.kit_version ?? "-"}  {data.kit_is_dev === "1" ? <Badge pill bg="dark" className="mx-2">Dev</Badge> : ""}</td>
                        <td>
                            <Link to={RouteMap.ShowMore+"?deployment="+data.deployment_name+"&index="+this.props.deployments.indexOf(data)} className="btn btn-primary">Show More</Link>
                        </td>

                    </tr>
                )
        }
        return tableData;
    }

    sortData = (key) => {
        const backup = this.state.sorting;
        backup[key] = !backup[key];
        this.props.sortData(key, backup[key]);
        this.setState({sorting: this.state.sorting});
    }

    render() {
        return (
            <div>
                <Row className={"m-4"}>
                    <Col>
                        {Object.keys(this.props.deployments).length ?
                            <Table responsive striped bordered hover>
                                <thead>
                                    <tr>
                                        <th onClick={() => this.sortData("deployment_name")}>Deployment name&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.deployment_name ? "Ascending" : "Decending"}</Badge></th>
                                        <th onClick={() => this.sortData("kit_name")}>Kit name&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.kit_name ? "Ascending" : "Decending"}</Badge></th>
                                        <th onClick={() => this.sortData("dated")}>Deployment date&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.dated ? "Ascending" : "Decending"}</Badge></th>
                                        <th onClick={() => this.sortData("kit_version")}>Kit version&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.kit_version ? "Ascending" : "Decending"}</Badge></th>
                                        <th>Show More</th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {this.renderTable()}
                                </tbody>
                            </Table>
                            :
                            <Alert variant="warning">
                                Please select deployment(s) from above to see their details.
                            </Alert>
                        }
                    </Col>
                </Row>
            </div >
        )
    }
}

export default DeploymentTable