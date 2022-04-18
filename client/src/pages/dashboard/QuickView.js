import { Component } from "react";
import { Row, Col, Badge, Card, CardGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";

class QuickView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            quickViewDeployments: null
        }
    }

    componentDidMount = () => {
        if (localStorage.getItem("quickview")) {
            this.setState({ quickViewDeployments: JSON.parse(localStorage.getItem("quickview")) })
        }
    }

    removeQuickView = (key) => {
        const backup = this.state.quickViewDeployments;
        delete backup[key];
        this.setState({ quickViewDeployments: backup })
        if (!Object.keys(backup).length) {
            localStorage.removeItem("quickview");
        }
        else {
            localStorage.setItem("quickview", JSON.stringify(backup));
        }
    }

    renderQuickView = () => {
        if (this.state.quickViewDeployments) {
            return (
                Object.entries(this.state.quickViewDeployments).map(([key, value]) => (
                    <Row className="w-50">
                        <Col>
                            <Card className="shadow p-3 mb-5 bg-white rounded m-3" role="button">
                                <Card.Body>
                                    <h6 className="text-center">{key}</h6>
                                    <hr />
                                    {value.map(x => (
                                        <Badge bg="primary" key={`dep-${x}`} className={"mx-2"}>{x}</Badge>
                                    ))}
                                    <hr />
                                    <Row>
                                        <Col className="d-flex flex-row-reverse">
                                            <FontAwesomeIcon icon={faTrash} className="mx-2 text-danger" onClick={() => this.removeQuickView(key)} />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                ))
            )
        }
    }

    clearAll = () => {
        if (localStorage.getItem("quickview")) {
            localStorage.removeItem("quickview");
            this.setState({ quickViewDeployments: null });
        }
    }

    render() {
        return (
            <div>
                <h4 className="text-center m-4">
                    Quickly access your favourite set of deployments here...
                </h4>

                <Row>
                    <Col className="d-flex flex-row-reverse">
                        <Button variant="secondary" size={"sm"} className="mx-4" onClick={this.clearAll}>Delete All</Button>
                    </Col>
                </Row>

                <CardGroup>
                    {this.renderQuickView()}
                </CardGroup>
            </div>
        )
    }
}

export default QuickView;