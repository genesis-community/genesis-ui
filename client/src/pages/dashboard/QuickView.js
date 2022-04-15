import { Component } from "react";
import { Table, Row, Col, Alert, Badge } from "react-bootstrap";

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

    renderQuickView = () => {
        if(this.state.quickViewDeployments && this.state.quickViewDeployments.length){
            return "To be implemented here..."
        }
    }

    render() {
        return (
            <div>
                <h4 className="text-center m-4">
                    Quickly access your favourite set of deployments here...
                </h4>
                {this.renderQuickView()}
            </div>
        )
    }
}

export default QuickView;