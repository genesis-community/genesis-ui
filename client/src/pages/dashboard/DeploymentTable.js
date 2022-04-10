import { Component } from "react";
import { Table, Row, Col, Alert, Badge } from "react-bootstrap";

class DeploymentTable extends Component {
    constructor(props) {
        super(props);
    }

    renderTable = () => {
        const tableData = [];
        for (const deploymentName in this.props.deployments) {
            for (const subDeployments in this.props.deployments[deploymentName]) {
                tableData.push(
                    <tr>
                        <td>{deploymentName}</td>
                        <td>{this.props.deployments[deploymentName][subDeployments].kit_name ?? "-"}</td>
                        <td>{this.props.deployments[deploymentName][subDeployments].dated ?? "-"}</td>
                        <td>{this.props.deployments[deploymentName][subDeployments].kit_version ?? "-"}  {this.props.deployments[deploymentName][subDeployments].kit_is_dev === "1" ? <Badge pill bg="dark" className="mx-2">Dev</Badge> : ""}</td>
                    </tr>
                )
            }
        }
        return tableData
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
                                        <th>Deployment name</th>
                                        <th>Kit name</th>
                                        <th>Deployment date</th>
                                        <th>Kit version</th>
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