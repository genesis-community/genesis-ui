import { Component } from "react";
import { Table, Row, Col, Alert, Badge, Dropdown, ButtonGroup } from "react-bootstrap";

class DeploymentTable extends Component {
    constructor(props) {
        super(props);
    }

    renderTable = () => {
        const tableData = [];
        for (const [deployment, data] of this.props.deployments) {
            for (const subDeployments in data) {
                tableData.push(
                    <tr>
                        <td>{deployment}</td>
                        <td>{data[subDeployments].kit_name ?? "-"}</td>
                        <td>{data[subDeployments].dated ?? "-"}</td>
                        <td>{data[subDeployments].kit_version ?? "-"}  {data[subDeployments].kit_is_dev === "1" ? <Badge pill bg="dark" className="mx-2">Dev</Badge> : ""}</td>
                    </tr>
                )
            }
        }
        return tableData;
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