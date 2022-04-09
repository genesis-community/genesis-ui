import { Component } from "react";
import AuthNavBar from "../../components/AuthNavBar";
import {Card, Button, Row, Col, Form, Table} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteMap from '../../RouteMap';
import ShowTable from "./ShowTable.js"


class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            envs: ["buffalo-lab/","genesis-lab/"]

        };

    }

    componentDidMount() {
        this.ListDeployments()
        this.DeploymentsInfo("buffalo-lab");

    }

    ListDeployments = () =>{
        const url = "/list";
        fetch(url)
            .then((resp) => {
                console.log(resp.json())
            })
            .catch(function(error) {
                console.log(error);
            });
    }
     DeploymentsInfo(env) {
        const url = '/list/' + env;
         fetch(url)
            .then((resp) => {

                resp = resp.json();
                resp = resp.then()
                // resp = resp.clone().json();
                // console.log(resp["bosh.dated"]);
                console.log(resp);
            // this.setState({
            //     deploymentInformation:resp[]
            // })
            })
            .catch(function(error) {
                console.log(error);
            });
    }




    render() {
        return (
            <div>
                <AuthNavBar />
                <Row className="m-4">
                    <Col xs={9} lg={9}>
                        <Form.Control type="text" placeholder="Search" />
                    </Col>
                    <Col>
                        <Button variant="success" className="w-100" onClick={() => {}}>Search</Button>
                    </Col>
                    {/*<ShowTable env = {this.state.envs} />*/}
                    <ShowTable env = {["buffalo-lab/"]} />
                    <ShowTable env = {["genesis-lab/"]} />
                    <ShowTable env = {["snw-ahartpence-lab/"]} />

                </Row>
            </div>
        )
    }
}

export default Dashboard
