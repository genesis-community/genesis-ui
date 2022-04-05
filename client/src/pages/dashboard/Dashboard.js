import { Component } from "react";
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RouteMap from '../../RouteMap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
// import { colourOptions } from '../data';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deploymentList: [],
            selectedOptions: [],
            animatedComponents: makeAnimated(),
        }
    }

    componentDidMount = async () => {
        await this.fetchDeployments();
    }

    handleChange = function(e) {
        this.setState({
            selectedOptions: e,
        });
        console.log(this.state.selectedOptions);
    }

    render() {
        return (
            <div>
                <Row>
                    <Select
                        options={this.state.deploymentList}
                        closeMenuOnSelect={false}
                        components={this.state.animatedComponents}
                        isClearable
                        // defaultValue={[colourOptions[4], colourOptions[5]]}
                        isMulti
                        onChange={opt => this.handleChange(opt)}
                    ></Select>
                </Row>
            </div>
        )
    }

    fetchDeployments = async () => {
        const url = "/list";
        await fetch(url)
            .then(response => response.json())
            .then(data => {
                const depList = data["deploy_list"]
                const opt = []
                for (const dep of depList) {
                    opt.push(
                        {
                            value: dep,
                            label: dep
                        }
                    )
                }
                this.setState({
                    deploymentList: opt
                })
            })
            .catch(error => console.log(error))
    }
}
export default Dashboard