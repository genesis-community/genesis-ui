import { Component } from "react";
import { Table, Row, Col, Alert, Badge, Button } from "react-bootstrap";
import ShowMore from "./ShowMore";
// import { Navigate } from 'react-router-dom';
import {Link, Redirect} from "react-router-dom";
import Settings from "../../Settings";
import RouteMap from "../../RouteMap";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

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
            },
            kit_names: [],
            animatedComponents: makeAnimated(),
            fCountKitName: 0,
            fCountKitVersion: 0,
            fCountDate: 0,
            
        }
    }

    getKits = () => {
        var filtercounter= this.state.fCountDate + this.state.fCountKitVersion
        const kits = [];
        if(filtercounter == 0){
            for(const data of this.props.initialKits) {
                if(!kits.find(obj => obj.value === data.kit_name)) {
                    kits.push({
                        value: data.kit_name,
                        label: data.kit_name
                    })
                }
            }
        }
        else{
            for(const data of this.props.deployments) {
                if(!kits.find(obj => obj.value === data.kit_name)) {
                    kits.push({
                        value: data.kit_name,
                        label: data.kit_name
                    })
                }
            }
        }
        return(
            <Select
                options = {kits}
                placeholder={"Select Kit Name"}
                isClearable
                isMulti
                onChange={this.filterKits}
            />
        )
    }

    filterKits = (option) => {
        let newData = []
        var filtercounter= this.state.fCountDate + this.state.fCountKitVersion
        if(option.length == 0 && filtercounter == 0){
            newData = this.props.initialKits
        }
        else if(option.length == 0 && filtercounter != 0){
            newData = this.props.deployments
        }
        else if(option.length != 0 && filtercounter != 0){
            for(var i=0; i < option.length; i++) {
                for(var j=0; j < this.props.deployments.length; j++) {
                    if(option[i].value === this.props.deployments[j].kit_name) {
                        newData.push(this.props.deployments[j])
                    }
                }
            }
        }
        else if(option.length != 0 && filtercounter == 0){
            for(var i=0; i < option.length; i++) {
                for(var j=0; j < this.props.initialKits.length; j++) {
                    if(option[i].value === this.props.initialKits[j].kit_name) {
                        newData.push(this.props.initialKits[j])
                    }
                }
            }
        }
        this.state.fCountKitName = option.length
        this.props.filterData(newData)
    }

    getKitsVersions = () => {
        var filtercounter= this.state.fCountDate + this.state.fCountKitName 
        const kitsVer = [];
        const operators = [
            {value: ">=", label: ">="},
            {value: ">", label: ">"},
            {value: "<=", label: "<="},
            {value: "<", label: "<"},
            {value: "=", label: "="},
        ];
        if(filtercounter == 0){
            for(const data of this.props.initialKits) {
                if(!kitsVer.find(obj => obj.value === data.kit_version)) {
                    kitsVer.push({
                        value: data.kit_version,
                        label: data.kit_version
                    })
                }
            }
        }
        else{
            for(const data of this.props.deployments) {
                if(!kitsVer.find(obj => obj.value === data.kit_version)) {
                    kitsVer.push({
                        value: data.kit_version,
                        label: data.kit_version
                    })
                }
            }
        }
        return(
            <div>
                <Select
                    options = {kitsVer}
                    placeholder={"Select Kit Version"}
                    isClearable
                    onChange={this.filterKitsVersion}
                />
                <Select
                    options = {operators}
                    placeholder={"Select Operator"}
                    isClearable
                    //onChange={this.}
                />
            </div>
        )
    }

    filterKitsVersion = (option) => {
        let newData = []
        var filtercounter = this.state.fCountDate + this.state.fCountKitName
        if(option.length == 0 && filtercounter == 0){
            newData = this.props.initialKits
        }
        else if(option.length == 0 && filtercounter != 0){
            newData = this.props.deployments
        }
        else if(option.length != 0 && filtercounter != 0){
            for(var j=0; j < this.props.deployments.length; j++) {
                if(option.value === this.props.deployments[j].kit_version) {
                    newData.push(this.props.deployments[j])
                }
            }       
        }
        else if(option.length != 0 && filtercounter == 0){     
            for(var j=0; j < this.props.initialKits.length; j++) {
                if(option.value === this.props.initialKits[j].kit_version) {
                    newData.push(this.props.initialKits[j])
                }
            }
        }
        this.state.fCountKitVersion = option.length
        this.props.filterData(newData)
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
                            <Button as={Link} to={RouteMap.ShowMore+"?deployment="+data.deployment_name+"&index="+this.props.deployments.indexOf(data)} size={"sm"} variant="warning">Show More</Button>
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
                                        <th></th>
                                        <th>
                                            {this.getKits()}
                                        </th>
                                        <th></th>
                                        <th>{this.getKitsVersions()}</th>
                                    </tr>
                                    <tr>
                                        <th onClick={() => this.sortData("deployment_name")}>Environment&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.deployment_name ? "Ascending" : "Decending"}</Badge></th>
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
                                Please select environment(s) from above to see their details.
                            </Alert>
                        }
                    </Col>
                </Row>
            </div >
        )
    }
}

export default DeploymentTable