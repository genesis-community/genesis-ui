import { Component } from "react";
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteMap from '../../RouteMap';
import Select from 'react-select'

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deploymentList: [],
            selectOptions: [],
        }
    }

    componentDidMount = async () => {
        this.fetchDeployments();
    }

    // componentDidMount() {
    //     const url = "/list";
    //     await fetch(url)
    //     .then(response => response.json())
    //     .then(data => {
    //         this.setState({
    //             deploymentList: data["deploy_list"]
    //         })
    //     })
    //     .catch(error => console.log(error))
    // }

    render() {
        return (
            <div>
                <Row>
                    <h1>{this.state.deploymentList}</h1>
                    <Select options={this.state.selectOptions}></Select>
                </Row>
                <Row className="m-4">
                    <Col xs={9} lg={9}>
                        <Form.Control type="text" placeholder="Search" />
                    </Col>
                    <Col>
                        <Button variant="success" className="w-100" onClick={() => {}}>Search</Button>
                    </Col>
                </Row>
            </div>
        )
    }

    fetchDeployments = async () => {
        const url = "/list";
        await fetch(url)
        .then(response => response.json())
        .then(data => {
            this.setState({
                deploymentList: data["deploy_list"]
            })

            const depList = data["deploy_list"]
            const opt = []
            for(var dep in depList){
                opt.push(
                    {
                        value:dep,
                        label:dep
                    }
                )
            }
            this.setState({
                selectOptions: opt
            })
        })
        .catch(error => console.log(error))
    }

}
export default Dashboard