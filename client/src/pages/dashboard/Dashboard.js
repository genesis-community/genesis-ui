import { Component } from "react";
import { Button, Row, Col, Alert, Form } from 'react-bootstrap';
import RouteMap from '../../RouteMap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import DeploymentTable from "./DeploymentTable";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faStar, faTrash } from "@fortawesome/free-solid-svg-icons";


class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deploymentList: [],
            selectedDeployments: [],
            animatedComponents: makeAnimated(),
            deploymentData: [],
            initialKits: [],
            loading: false,
            quickViewDeployments: null,
            quickviewName: null,
        }
    }
    componentDidMount = async () => {
        if (localStorage.getItem("quickview")) {
            this.setState({ quickViewDeployments: JSON.parse(localStorage.getItem("quickview")) })
        }
        else {
            this.setState({ quickViewDeployments: {} })
        }

        await this.fetchDeployments();

        if (localStorage.getItem("selected")){
            this.setState({selectedDeployments: JSON.parse(localStorage.getItem("selected"))})
        }
        else {
            this.setState({selectedDeployments: {} })
        }

        if(this.defaultSelections && this.defaultSelections.length){
            this.setState({selectedDeployments: this.defaultSelections})
            this.getDeploymentData()
        }
        else{
            this.setState({selectedDeployments:{}})
        }
    }

    params = new URLSearchParams(window.location.search)

    defaultSelections = (this.params.has('quickviewDeployments') && this.params.get('quickviewDeployments') !== null && this.params.get('quickviewDeployments') !== "null" && this.params.get('quickviewDeployments') !== "") ? JSON.parse(this.params.get('quickviewDeployments')).map(deployment => ({
        value: deployment,
        label: deployment
    }))
       :JSON.parse(sessionStorage.getItem("selectedDeployments"))


    fetchDeployments = async () => {
        await fetch("/list", {
            headers: {
                Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
            },
        })
            .then(response => response.json())
            .then(response => {
                const options = response["deploy_list"].map(deployment => ({
                    value: deployment,
                    label: deployment
                }))

                this.setState({
                    deploymentList: options
                })
                console.log("this is deployement list")
                console.log(this.state.deploymentList)
            })
            .catch(error => console.log(error))
    }
    
    getDeploymentData = async () => {
        this.setState({ deploymentData: [], loading: true });
        const old_dep_data = this.state.deploymentData;

        for (const dep of this.state.selectedDeployments) {
            await fetch(`/list/${dep.value}`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    Object.keys(data).forEach(x => {
                        data[x].deployment_name = dep.value
                        old_dep_data.push(data[x])
                    })
                })
                .catch(error => console.log(error))
        }
        this.setState({ deploymentData: old_dep_data, loading: false, initialKits: old_dep_data});
    }

    sortData = (key, sort_by) => {
        const backup = this.state.deploymentData.sort((a, b) => sort_by ? (a[key].localeCompare(b[key])) : (b[key].localeCompare(a[key])))
        const backup1 = this.state.initialKits.sort((a, b) => sort_by ? (a[key].localeCompare(b[key])) : (b[key].localeCompare(a[key])))
        var sortedNameVer = []
        var sortedNameVer1 = []
        if(key == "kit_name"){
            var nameData = {}
            for(var data of backup){
                if(nameData[data.kit_name] != undefined){
                    nameData[data.kit_name].push(data)
                }
                else{
                    nameData[data.kit_name] = [data]
                }
            }
            for(var i in nameData){
                sortedNameVer = sortedNameVer.concat(this.quickSort(nameData[i]))
            }
            var nameData1 = {}
            for(var data of backup1){
                if(nameData1[data.kit_name] != undefined){
                    nameData1[data.kit_name].push(data)
                }
                else{
                    nameData1[data.kit_name] = [data]
                }
            }
            for(var i in nameData1){
                sortedNameVer1 = sortedNameVer1.concat(this.quickSort(nameData1[i]))
            }
            this.setState({deploymentData : sortedNameVer, initialKits : sortedNameVer1})
        }
        
        else{
            this.setState({deploymentData : backup, initialKits : backup1})
        };
    }

    quickSort = (arr) => {
        const a = [...arr];
        if (a.length < 2) return a;
        const pivotIndex = Math.floor(arr.length / 2);
        const pivot = a[pivotIndex];
        const [lo, hi] = a.reduce(
          (acc, val, i) => {
            if (this.comparator(val.kit_version,pivot.kit_version,">") || (this.comparator(val.kit_version,pivot.kit_version,"=") && i != pivotIndex)) {
              acc[0].push(val);
            } else if (this.comparator(val.kit_version,pivot.kit_version,"<")) {
              acc[1].push(val);
            }
            return acc;
          },
          [[], []]
        );
        return [...this.quickSort(lo), pivot, ...this.quickSort(hi)];
    };
    
    comparator = (data1,data2,operator) => {
        const semver = require('semver')
        const semverGt = require('semver/functions/gt')
        const semverLt = require('semver/functions/lt')
        const semverEq = require('semver/functions/eq')
        const semverGte = require('semver/functions/gte')
        const semverLte = require('semver/functions/lte')
       
        if (data1 ===  "latest" && data2 !=  "latest"){
            if(operator == ">"){
                return semverGt("10000000.100000000.100000",data2)
            }
            else if(operator == ">="){
                return semverGte("10000000.100000000.100000",data2)
            } 
            else if(operator == "<"){
                return semverLt("10000000.100000000.100000",data2)
            } 
            else if(operator == "<="){
                return semverLte("10000000.100000000.100000",data2)
            } 
            else if(operator == "="){
                return semverEq("10000000.100000000.100000",data2)
            }
        }
        else if(data1 !=  "latest" && data2 ===  "latest"){
            if(operator == ">"){
                return semverGt(data1,"10000000.100000000.100000")
            }
            else if(operator == ">="){
                return semverGte(data1,"10000000.100000000.100000")
            } 
            else if(operator == "<"){
                return semverLt(data1,"10000000.100000000.100000")
            } 
            else if(operator == "<="){
                return semverLte(data1,"10000000.100000000.100000")
            } 
            else if(operator == "="){
                return semverEq(data1,"10000000.100000000.100000")
            }
        }
        else if(data1 ===  "latest" && data2 ===  "latest"){
            if(operator == ">"){
                return semverGt("10000000.100000000.100000","10000000.100000000.100000")
            }
            else if(operator == ">="){
                return semverGte("10000000.100000000.100000","10000000.100000000.100000")
            } 
            else if(operator == "<"){
                return semverLt("10000000.100000000.100000","10000000.100000000.100000")
            } 
            else if(operator == "<="){
                return semverLte("10000000.100000000.100000","10000000.100000000.100000")
            } 
            else if(operator == "="){
                return semverEq("10000000.100000000.100000","10000000.100000000.100000")
            }
        }
        else if(data1 !=  "latest" && data2 !=  "latest"){
            if(operator == ">"){
                return semverGt(data1,data2)
            }
            else if(operator == ">="){
                return semverGte(data1,data2)
            } 
            else if(operator == "<"){
                return semverLt(data1,data2)
            } 
            else if(operator == "<="){
                return semverLte(data1,data2)
            } 
            else if(operator == "="){
                return semverEq(data1,data2)
            }
        }
    }

    filterData = (newData) => {   
         this.setState({deploymentData: newData})
    }

    addSelect = (option) => {
        this.setState({selectedDeployments: option})
        //store the selectedDeployments into sessionstorage 
        sessionStorage.setItem("selectedDeployments", JSON.stringify(option));
        // Remove those deployment data which are not selected anymore
        //console.log(option)
        const checkList = option.map(x => x.value);
        //console.log(checkList)
        const backup = this.state.initialKits.filter(x => checkList.indexOf(x.deployment_name) !== -1)
        const backup1 = this.state.deploymentData.filter(x => checkList.indexOf(x.deployment_name) !== -1)
        this.setState({ deploymentData: backup1, quickviewName: null, initialKits: backup});
        localStorage.setItem("selected", JSON.stringify(backup));
    }

    existInList = (selected) => {
        const deployments = Object.values(this.state.quickViewDeployments);
        for (let item of deployments) {
            let same = true;
            for (let s of selected) {
                if (!item.includes(s)) {
                    same = false;
                    break;
                }
            }
            if (same && selected.length === item.length) {
                return true
            }
        }
        return false;
    }

    addQuickView = () => {
        // Set to localstorage or send to server (in future)
        const selected = this.state.selectedDeployments.map(x => x.value);
        if (!(this.existInList(selected))) {
            const backup = this.state.quickViewDeployments;
            backup[this.state.quickviewName] = selected
            this.setState({ quickViewDeployments: backup, quickviewName: null })
            localStorage.setItem("quickview", JSON.stringify(backup));
        }
    }

    removeQuickView = () => {
        const selected = this.state.selectedDeployments.map(x => x.value);
        for (let key in this.state.quickViewDeployments) {
            const item = this.state.quickViewDeployments[key];
            let same = true;
            for (let s of selected) {
                if (!item.includes(s)) {
                    same = false;
                    break;
                }
            }
            if (same && selected.length === item.length) {
                const backup = this.state.quickViewDeployments;
                delete backup[key];
                this.setState({ quickViewDeployments: backup })
                if (!Object.keys(backup).length) {
                    localStorage.removeItem("quickview");
                }
                else {
                    localStorage.setItem("quickview", JSON.stringify(backup));
                }
                return;
            }
        }
    }

    renderQuickView = () => {
        if (this.state.quickViewDeployments && (this.existInList(this.state.selectedDeployments.map(x => x.value)))) {
            return "";
            // COMMENT OUT BELOW IF YOU WANT A "REMOVE FROM QUICKVIEW" on Dashboard.
            // return (
            //     <Row className="mx-4">
            //         <Col>
            //             <Alert variant={"light"} onClick={this.removeQuickView} role="button">
            //                 <FontAwesomeIcon icon={faTrash} className="mx-2" />
            //                 Delete from Quick-View
            //             </Alert>
            //         </Col>
            //     </Row>
            // )
        }
        else {
            return (
                <Row className="mx-4">
                    <Col>
                        <Alert variant={"info"} className={"mx-4"}>
                            <h6 className="text-center">Add to Quick-View</h6>
                            <Row className="text-center">
                                <Col xs={9} lg={9}>
                                    <Form.Control type="text" placeholder="Give a cute name to these deployments..." onChange={(event) => this.setState({ quickviewName: event.target.value })} />
                                </Col>
                                <Col>
                                    <Button variant="dark" className="w-100" onClick={this.addQuickView}>Add</Button>
                                </Col>
                            </Row>
                        </Alert>
                    </Col>
                </Row>
            )
        }
    }
    render() {
        return (
            <div>
                <Row className="m-4">
                    <Col xs={9} lg={9}>
                        <Select
                            options={this.state.deploymentList}
                            defaultValue={this.defaultSelections}
                            placeholder={"Select Deployments"}
                            closeMenuOnSelect={false}
                            components={this.state.animatedComponents}
                            // defaultValue={this.defaultSelections}
                            isClearable
                            isMulti
                            onChange={this.addSelect}
                        />
                    </Col>
                    <Col>
                        <Button variant="success" className="w-100" onClick={this.getDeploymentData}>Show Deployments</Button>
                    </Col>
                </Row>
                {this.state.deploymentData && this.state.deploymentData.length ?
                    this.renderQuickView()
                    :
                    ""
                }

                <Row>
                    <Col className="text-center">
                        <DeploymentTable filterData = {this.filterData} deployments={this.state.deploymentData} sortData={this.sortData} initialKits={this.state.initialKits}/>
                        {this.state.loading ?
                            <div><FontAwesomeIcon icon={faSpinner} spin /> &nbsp;&nbsp;Loading...</div>
                            :
                            ""
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Dashboard