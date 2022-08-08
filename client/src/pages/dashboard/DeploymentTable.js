import { Component } from "react";
import { Table, Row, Col, Alert, Badge, Button } from "react-bootstrap";
import ShowMore from "./ShowMore";
import { Navigate } from 'react-router-dom';
import {Link, Redirect} from "react-router-dom";
import Settings from "../../Settings";
import RouteMap from "../../RouteMap";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import semver from "semver";
import { compareAsc, format } from 'date-fns'


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
            animatedComponents: makeAnimated(),
            fCountKitName: 0,
            fCountKitVersion: 0,
            fCountDate: 0,
            deployedWithOutKitName: [],
            deployedWithOutKitVersion: [],
            deployedWithOutDate: [],
            kitVersionValue: null,
            kitOperatorValue: null,
            kitNamesValue: null,
            nosDay: null,
            dateVal: null,
        }
    }
  
    getKits = () => {
        var filtercounter= this.state.fCountDate + this.state.fCountKitVersion
        const kits = [];

        /* Logics for 4 possible conditions Kitname has filter and there are other filters
                                            Kitname has no filter and no there are other filters
                                            Kitname has filter and no there are other filters
                                            Kitname has no filter and there are other filters */
        if(filtercounter == 0 && (this.state.fCountKitName == 0 || this.state.fCountKitName != 0)){
            if(this.state.fCountKitName == 0){
                this.state.deployedWithOutKitName= []
            }
            else{
                this.state.deployedWithOutKitName = this.state.deployedWithOutKitName
            }

            for(const data of this.props.initialKits) {
                if(!kits.find(obj => obj.value == data.kit_name)) {
                    kits.push({
                        value: data.kit_name,
                        label: data.kit_name
                    })
                }
            }
        }
        else if(filtercounter != 0 && this.state.fCountKitName == 0){
            this.state.deployedWithOutKitName = this.props.deployments
            for(const data of this.state.deployedWithOutKitName) {
                if(!kits.find(obj => obj.value === data.kit_name)) {
                    kits.push({
                        value: data.kit_name,
                        label: data.kit_name
                    })
                }
            }
        }
        else if(filtercounter != 0 && this.state.fCountKitName != 0){
            for(const data of this.state.deployedWithOutKitName) {
                if(!kits.find(obj => obj.value === data.kit_name)) {
                    kits.push({
                        value: data.kit_name,
                        label: data.kit_name
                    })
                }
            }
        }
        if(this.state.fCountKitVersion == 0){
            return(
                <Select
                    options = {kits}
                    placeholder={"Select Kit Name"}
                    isClearable
                    isMulti
                    onChange={this.setKitName}
                />
            )
        }
    }

    setKitName = (option) => {
        // We do this inorder to store the values selected in a state variable because we need it late
        this.state.kitNamesValue = option
        this.filterKits()
    }

    filterKits = () => {
        let newData = []
        var filtercounter= this.state.fCountDate + this.state.fCountKitVersion
        
        /* Logics for 4 possible conditions Kitname has filter and there are other filters
                                            Kitname has no filter and no there are other filters
                                            Kitname has filter and no there are other filters
                                            Kitname has no filter and there are other filters */
        if(this.state.kitNamesValue.length == 0 && filtercounter == 0){
            newData = this.props.initialKits
            this.state.fCountDate = 0
            this.state.fCountKitName = 0
            this.state.fCountKitVersion = 0
        }
        else if(this.state.kitNamesValue.length == 0 && filtercounter != 0){
            // If there is no Kitname Filter and there is a Date filter => We filter data based of Dates
            if(this.state.nosDay != null && this.state.dateVal != null){
                if(this.state.nosDay.value == 60){
                    let dateOption = new Date(this.state.dateVal.value);
                    let dateLast = new Date(this.state.dateVal.value);
                    dateLast.setDate(dateLast.getDate() - 60)
                    for(let data of this.props.initialKits){
                        let kitsDate = new Date(data.dated.substring(0,10))
                        console.log(kitsDate.toString())
                        if(kitsDate >= dateLast && kitsDate <= dateOption){
                            newData.push(data)
                        }
                    }
                }
                else if(this.state.nosDay.value == 30){
                    let dateOption = new Date(this.state.dateVal.value);
                    let dateLast = new Date(this.state.dateVal.value);
                    dateLast.setDate(dateLast.getDate() - 30)
                    for(let data of this.props.initialKits){
                        let kitsDate = new Date(data.dated.substring(0,10))
                        console.log(kitsDate.toString())
                        if(kitsDate >= dateLast && kitsDate <= dateOption){
                            newData.push(data)
                        }
                    }
                }
                else if(this.state.nosDay.value == 15){
                    let dateOption = new Date(this.state.dateVal.value);
                    let dateLast = new Date(this.state.dateVal.value);
                    dateLast.setDate(dateLast.getDate() - 15)
                    for(let data of this.props.initialKits){
                        let kitsDate = new Date(data.dated.substring(0,10))
                        console.log(kitsDate.toString())
                        if(kitsDate >= dateLast && kitsDate <= dateOption){
                            newData.push(data)
                        }
                    }
                }
            }
            else if(this.state.nosDay == null && this.state.dateVal != null){
                for(var j=0; j < this.props.initialKits.length; j++) {
                    if(this.state.dateVal.value == this.props.initialKits[j].dated.substring(0,10)) {
                        newData.push(this.props.initialKits[j])
                    }
                }
            }
        }
        else if(this.state.kitNamesValue.length != 0 && filtercounter != 0){
            for(var i=0; i < this.state.kitNamesValue.length; i++) {
                //Filtering data based of the data which has already been filtered by other filters this.state.deployedWithOutKitName stores deployments when Kitname filter is not activated
                for(var j=0; j < this.state.deployedWithOutKitName.length; j++) {
                    if(this.state.kitNamesValue[i].value == this.state.deployedWithOutKitName[j].kit_name) {
                        newData.push(this.state.deployedWithOutKitName[j])
                    }
                }
            }
        }
        else if(this.state.kitNamesValue.length != 0 && filtercounter == 0){
            for(var i=0; i < this.state.kitNamesValue.length; i++) {
                //this.props.initialKits stores data from the initial deployments
                for(var j=0; j < this.props.initialKits.length; j++) {
                    if(this.state.kitNamesValue[i].value == this.props.initialKits[j].kit_name) {
                        newData.push(this.props.initialKits[j])
                    }
                }
            }
        }
        this.state.fCountKitName = this.state.kitNamesValue.length
        
        if(newData.length == 0){
            this.setState({fCountKitName: 0,
                fCountKitVersion: 0,
                fCountDate: 0,
                deployedWithOutKitName: [],
                deployedWithOutKitVersion: [],
                deployedWithOutDate: [],
                kitVersionValue: null,
                kitOperatorValue: null,
                kitNamesValue: null,
                nosDay: null,
                dateVal: null});
                alert("No Deploments to be shown")
        }
        this.props.filterData(newData)
    }

    getDates = () => { 
        // Helps in getting the Kitnames in the Dropdown Box and Also has the react front End
        var filtercounter= this.state.fCountKitName + this.state.fCountKitVersion
        const kits = [];
        const inLast = [
            {value: 60, label: "60 Days"},
            {value: 30, label: "30 Days"},
            {value: 15, label: "15 Days"},
        ];
         /* Logics for 4 possible conditions Dates has filter and there are other filters
                                            Dates has no filter and no there are other filters
                                            Dates has filter and no there are other filters
                                            Dates has no filter and there are other filters */
        if(filtercounter == 0 && (this.state.fCountDate == 0 || this.state.fCountDate != 0)){
            if(this.state.fCountDate != 0){
                this.state.deployedWithOutDate = this.state.deployedWithOutDate
            }
            else{
                this.state.deployedWithOutDate = [];
            }
            
            for(const data of this.props.initialKits) {
                if(!kits.find(obj => obj.value === data.dated)) {
                    kits.push({
                        value: (data.dated.substring(0,10)),
                        label: (data.dated.substring(0,10))
                    })
                }
            }
        }
        else if(filtercounter != 0 && this.state.fCountDate == 0){
            this.state.deployedWithOutDate = this.props.deployments
            for(const data of this.state.deployedWithOutDate) {
                if(!kits.find(obj => obj.value === (data.dated.substring(0,10)))) {
                    kits.push({
                        value: (data.dated.substring(0,10)),
                        label: (data.dated.substring(0,10))
                    })
                }
            }
        }
        else if(filtercounter != 0 && this.state.fCountDate != 0){
            for(const data of this.state.deployedWithOutDate) {
                if(!kits.find(obj => obj.value === (data.dated.substring(0,10)))) {
                    kits.push({
                        value: (data.dated.substring(0,10)),
                        label: (data.dated.substring(0,10))
                    })
                }
            }
        }
        if(this.state.fCountKitVersion == 0){
            return(
                <div>
                    <Select
                        options = {kits}
                        placeholder={"Select Dates"}
                        isClearable
                        onChange={this.setDate}
                    />
                    <Select
                        options = {inLast}
                        placeholder={"In the Last"}
                        isClearable
                        onChange={this.setDays}
                    />
                </div>
            )
        }
    }

    setDate = (option) => {
        this.state.dateVal = option
        //Only Call filterDates when there is a option selected in both dropdowns
        if(option != null && this.state.nosDay != null){
            this.state.fCountDate = 1
            this.filterDates()
        }
        else if(option != null && this.state.nosDay == null){
            this.filterDates1Date()
            this.state.fCountDate = 1
        }
        else{
            let newData = []
            this.state.fCountDate = 0
            if(this.state.fCountKitName != 0){
                for(var i=0; i < this.state.kitNamesValue.length; i++) {
                    for(var j=0; j < this.props.initialKits.length; j++) {
                        if(this.state.kitNamesValue[i].value == this.props.initialKits[j].kit_name) {
                            newData.push(this.props.initialKits[j])
                        }
                    }
                }
                this.props.filterData(newData)
            }
            else{
                this.props.filterData(this.props.initialKits)
            }
        }
    }

    filterDates1Date = () => {
        let newData = []
        let newDa = []
        var filtercounter = this.state.fCountKitName + this.state.fCountKitVersion
        if(this.state.dateVal == null && filtercounter == 0){
            newData = this.props.initialKits
            this.state.fCountDate = 0
            this.state.fCountKitName = 0
            this.state.fCountKitVersion = 0
        }
        else if(this.state.dateVal == null && filtercounter != 0){
            for(var i=0; i < this.state.kitNamesValue.length; i++) {
                for(var j=0; j < this.props.initialKits.length; j++) {
                    if(this.state.kitNamesValue[i].value == this.props.initialKits[j].kit_name) {
                        newData.push(this.props.initialKits[j])
                    }
                }
            }
        }
        else if(this.state.dateVal != null && filtercounter != 0){
            //Filtering data based of the data which has already been filtered by other filters this.state.deployedWithOutKitName stores deployments when Kitname filter is not activated
                for(var i of this.state.kitNamesValue){
                    for(var j of this.props.initialKits){
                        if(i.value == j.kit_name){
                            newDa.push(j)
                        }
                    }
                }
                for(var i of newDa){
                    if(this.state.dateVal.value == i.dated.substring(0,10)) {
                        newData.push(i)
                }
            }
        }
        else if(this.state.dateVal != null && filtercounter == 0){
                //this.props.initialKits stores data from the initial deployments
                for(var j=0; j < this.props.initialKits.length; j++) {
                    if(this.state.dateVal.value == this.props.initialKits[j].dated.substring(0,10)) {
                        newData.push(this.props.initialKits[j])
                    }
                }
             }
    
        if(newData.length == 0){
            this.setState({fCountKitName: 0,
                fCountKitVersion: 0,
                fCountDate: 0,
                deployedWithOutKitName: [],
                deployedWithOutKitVersion: [],
                deployedWithOutDate: [],
                kitVersionValue: null,
                kitOperatorValue: null,
                kitNamesValue: null,
                nosDay: null,
                dateVal: null});
        }
        this.props.filterData(newData)
    }
    

    setDays = (option) => {
        this.state.nosDay = option
         //Only Call filterDates when there is a option selected in both dropdowns

        if(option != null && this.state.dateVal != null){
            this.state.fCountDate = 1
            console.log("reached")
            this.filterDates()
        }
        else if(option == null && this.state.dateVal != null){
            this.filterDates1Date()
            this.state.fCountDate = 1
        }
        else{
            let newData = []
            this.state.fCountDate = 0
            if(this.state.fCountKitName != 0){
                for(var i=0; i < this.state.kitNamesValue.length; i++) {
                    for(var j=0; j < this.props.initialKits.length; j++) {
                        if(this.state.kitNamesValue[i].value == this.props.initialKits[j].kit_name) {
                            newData.push(this.props.initialKits[j])
                        }
                    }
                }
                this.props.filterData(newData)
            }
            else{
                this.props.filterData(this.props.initialKits)
            }
        }
    }

    filterDates = () => {
        let newData = []
        let newDa = []
        var filtercounter = this.state.fCountKitName + this.state.fCountKitVersion
        /* Logics for 4 possible conditions Dates has filter and there are other filters
                                            Dates has no filter and no there are other filters
                                            Dates has filter and no there are other filters
                                            Dates has no filter and there are other filters */

        if(this.state.fCountDate == 0 && filtercounter == 0){
            newData = this.props.initialKits
            this.state.fCountDate = 0
            this.state.fCountKitName = 0
            this.state.fCountKitVersion = 0
        }
        else if(this.state.fCountDate == 0 && filtercounter != 0){
            for(var i=0; i < this.state.kitNamesValue.length; i++) {
                for(var j=0; j < this.props.initialKits.length; j++) {
                    if(this.state.kitNamesValue[i].value == this.props.initialKits[j].kit_name) {
                        newData.push(this.props.initialKits[j])
                    }
                }
            }
        }
        else if(this.state.fCountDate == 1 && filtercounter == 0){
            if(this.state.nosDay.value == 60){
                let dateOption = new Date(this.state.dateVal.value);
                let dateLast = new Date(this.state.dateVal.value);
                dateLast.setDate(dateLast.getDate() - 60)
                for(let data of this.props.initialKits){
                    let kitsDate = new Date(data.dated.substring(0,10))
                    console.log(kitsDate.toString())
                    if(kitsDate >= dateLast && kitsDate <= dateOption){
                        newData.push(data)
                    }
                }
            }
            else if(this.state.nosDay.value == 30){
                let dateOption = new Date(this.state.dateVal.value);
                let dateLast = new Date(this.state.dateVal.value);
                dateLast.setDate(dateLast.getDate() - 30)
                for(let data of this.props.initialKits){
                    let kitsDate = new Date(data.dated.substring(0,10))
                    console.log(kitsDate.toString())
                    if(kitsDate >= dateLast && kitsDate <= dateOption){
                        newData.push(data)
                    }
                }
            }
            else if(this.state.nosDay.value == 15){
                let dateOption = new Date(this.state.dateVal.value);
                let dateLast = new Date(this.state.dateVal.value);
                dateLast.setDate(dateLast.getDate() - 15)
                for(let data of this.props.initialKits){
                    let kitsDate = new Date(data.dated.substring(0,10))
                    console.log(kitsDate.toString())
                    if(kitsDate >= dateLast && kitsDate <= dateOption){
                        newData.push(data)
                    }
                }
            }
        }
        else if(this.state.fCountDate == 1 && filtercounter != 0){
            for(var i of this.state.kitNamesValue){
                for(var j of this.props.initialKits){
                    if(i.value == j.kit_name){
                        newDa.push(j)
                    }
                }
            }
            if(this.state.nosDay.value == 60){
                let dateOption = new Date(this.state.dateVal.value);
                let dateLast = new Date(this.state.dateVal.value);
                dateLast.setDate(dateLast.getDate() - 60)
                for(let data of newDa){
                    let kitsDate = new Date(data.dated.substring(0,10))
                    console.log(kitsDate.toString())
                    if(kitsDate >= dateLast && kitsDate <= dateOption){
                        newData.push(data)
                    }
                }
            }
            else if(this.state.nosDay.value == 30){
                let dateOption = new Date(this.state.dateVal.value);
                let dateLast = new Date(this.state.dateVal.value);
                dateLast.setDate(dateLast.getDate() - 30)
                for(let data of newDa){
                    let kitsDate = new Date(data.dated.substring(0,10))
                    if(kitsDate >= dateLast && kitsDate <= dateOption){
                        newData.push(data)
                    }
                }
            }
            else if(this.state.nosDay.value == 15){
                let dateOption = new Date(this.state.dateVal.value);
                let dateLast = new Date(this.state.dateVal.value);
                dateLast.setDate(dateLast.getDate() - 15)
                for(let data of newDa){
                    let kitsDate = new Date(data.dated.substring(0,10))
                    if(kitsDate >= dateLast && kitsDate <= dateOption){
                        newData.push(data)
                    }
                }
            }
        }
        if(newData.length == 0){
            this.setState({fCountKitName: 0,
                fCountKitVersion: 0,
                fCountDate: 0,
                deployedWithOutKitName: [],
                deployedWithOutKitVersion: [],
                deployedWithOutDate: [],
                kitVersionValue: null,
                kitOperatorValue: null,
                kitNamesValue: null,
                nosDay: null,
                dateVal: null});
            alert("No Deploments to be shown")
        }

        this.props.filterData(newData)
    }
    
    getKitsVersions = () => {
        if(this.state.fCountKitName == 0 && this.state.fCountDate == 0){
            var filtercounter = this.state.fCountDate + this.state.fCountKitName 
            const kitsVer = [];
            const operators = [
                {value: ">=", label: ">="},
                {value: ">", label: ">"},
                {value: "<=", label: "<="},
                {value: "<", label: "<"},
                {value: "=", label: "="},
            ];
            
            for(const data of this.props.initialKits) {
                if(!kitsVer.find(obj => obj.label == data.kit_name.concat(": ",data.kit_version))) {
                    kitsVer.push({
                        value: data.kit_version,
                        label: data.kit_name.concat(": ",data.kit_version)
                    })
                }
            }
        
            return(
                <div>
                    <Select
                        options = {kitsVer}
                        placeholder={"Select Kit Version"}
                        isClearable
                        onChange={this.setKitVersionValue}
                    />
                    <Select
                        options = {operators}
                        placeholder={"Select Operator"}
                        isClearable
                        onChange={this.setKitVersionOperator}
                    />
                </div>
            )
        }
    }

    setKitVersionValue = (option) => {
        this.state.kitVersionValue = option;
        //Only Call filterDates when there is a option selected in both dropdowns
        if(this.state.kitOperatorValue != null && option != null){
            this.state.fCountDate = 0
            this.state.fCountKitName = 0
            this.state.fCountKitVersion = 1
            this.filterKitsVersion()
        }

        else if(option == null || this.state.kitOperatorValue == null){
            this.state.fCountDate = 0
            this.state.fCountKitName = 0
            this.state.fCountKitVersion = 0
            this.props.filterData(this.props.initialKits)
            if(option == null){
                this.state.kitVersionValue = null;
            }
        }
    }

    setKitVersionOperator = (option) => {
        this.state.kitOperatorValue = option;
        if(option != null && this.state.kitVersionValue != null){
            this.state.fCountDate = 0
            this.state.fCountKitName = 0
            this.state.fCountKitVersion = 1 
            this.filterKitsVersion()
        }
        else if(option == null || this.state.kitVersionValue == null){
            this.state.fCountDate = 0
            this.state.fCountKitName = 0
            this.state.fCountKitVersion = 0
            this.props.filterData(this.props.initialKits)
            if(option == null){
                this.state.kitOperatorValue = null;
            }
        }
    }

    filterKitsVersion = () => {
        var newData = []    
        var kitname = this.state.kitVersionValue.label.substring(0,(this.state.kitVersionValue.label.indexOf(':')))     
        for(var data of this.props.initialKits) {
            if(kitname == data.kit_name) {
                if(this.comparator(data) == 1){
                    newData.push(data)
                }                    
            }
        }

        if(newData.length == 0){
            this.setState({fCountKitName: 0,
                fCountKitVersion: 0,
                fCountDate: 0,
                deployedWithOutKitName: [],
                deployedWithOutKitVersion: [],
                deployedWithOutDate: [],
                kitVersionValue: null,
                kitOperatorValue: null,
                kitNamesOption: null,
                nosDay: null,
                dateVal: null});
                alert("No Deploments to be shown")
        }
        this.props.filterData(newData)
    }

    comparator = (data) => {
        const semver = require('semver')
        const semverGt = require('semver/functions/gt')
        const semverLt = require('semver/functions/lt')
        const semverEq = require('semver/functions/eq')
        const semverGte = require('semver/functions/gte')
        const semverLte = require('semver/functions/lte')

        if (data.kit_version ===  "latest" && this.state.kitVersionValue.value !=  "latest"){
            if(this.state.kitOperatorValue.value == ">"){
                return semverGt("10000000.100000000.100000",this.state.kitVersionValue.value)
            }
            else if(this.state.kitOperatorValue.value == ">="){
                return semverGte("10000000.100000000.100000",this.state.kitVersionValue.value)
            } 
            else if(this.state.kitOperatorValue.value == "<"){
                return semverLt("10000000.100000000.100000",this.state.kitVersionValue.value)
            } 
            else if(this.state.kitOperatorValue.value == "<="){
                return semverLte("10000000.100000000.100000",this.state.kitVersionValue.value)
            } 
            else if(this.state.kitOperatorValue.value == "="){
                return semverEq("10000000.100000000.100000",this.state.kitVersionValue.value)
            }
        }
        else if(data.kit_version !=  "latest" && this.state.kitVersionValue.value ===  "latest"){
            if(this.state.kitOperatorValue.value == ">"){
                return semverGt(data.kit_version,"10000000.100000000.100000")
            }
            else if(this.state.kitOperatorValue.value == ">="){
                return semverGte(data.kit_version,"10000000.100000000.100000")
            } 
            else if(this.state.kitOperatorValue.value == "<"){
                return semverLt(data.kit_version,"10000000.100000000.100000")
            } 
            else if(this.state.kitOperatorValue.value == "<="){
                return semverLte(data.kit_version,"10000000.100000000.100000")
            } 
            else if(this.state.kitOperatorValue.value == "="){
                return semverEq(data.kit_version,"10000000.100000000.100000")
            }
        }
        else if(data.kit_version ===  "latest" && this.state.kitVersionValue.value ===  "latest"){
            if(this.state.kitOperatorValue.value == ">"){
                return semverGt("10000000.100000000.100000","10000000.100000000.100000")
            }
            else if(this.state.kitOperatorValue.value == ">="){
                return semverGte("10000000.100000000.100000","10000000.100000000.100000")
            } 
            else if(this.state.kitOperatorValue.value == "<"){
                return semverLt("10000000.100000000.100000","10000000.100000000.100000")
            } 
            else if(this.state.kitOperatorValue.value == "<="){
                return semverLte("10000000.100000000.100000","10000000.100000000.100000")
            } 
            else if(this.state.kitOperatorValue.value == "="){
                return semverEq("10000000.100000000.100000","10000000.100000000.100000")
            }
        }
        else if(data.kit_version !=  "latest" && this.state.kitVersionValue.value !=  "latest"){
            if(this.state.kitOperatorValue.value == ">"){
                return semverGt(data.kit_version,this.state.kitVersionValue.value)
            }
            else if(this.state.kitOperatorValue.value == ">="){
                return semverGte(data.kit_version,this.state.kitVersionValue.value)
            } 
            else if(this.state.kitOperatorValue.value == "<"){
                return semverLt(data.kit_version,this.state.kitVersionValue.value)
            } 
            else if(this.state.kitOperatorValue.value == "<="){
                return semverLte(data.kit_version,this.state.kitVersionValue.value)
            } 
            else if(this.state.kitOperatorValue.value == "="){
                return semverEq(data.kit_version,this.state.kitVersionValue.value)
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
                        <td>{data.kit_version ?? "-"}  {data.kit_is_dev === "01" ? <Badge pill bg="dark" className="mx-2">Dev</Badge> : ""}</td>
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
                                        <th>{this.getDates()}</th>
                                        <th>{this.getKitsVersions()}</th>
                                    </tr>
                                    <tr>
                                        <th onClick={() => this.sortData("deployment_name")}>Environment&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.deployment_name ? "Ascending" : "Decending"}</Badge></th>
                                        <th onClick={() => this.sortData("kit_name")}>Kit name&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.kit_name ? "Ascending" : "Decending"}</Badge></th>
                                        <th onClick={() => this.sortData("dated")}>Deployment date&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.dated ? "Ascending" : "Decending"}</Badge></th>
                                        <th onClick={() => this.sortData("kit_name")}>Kit version&nbsp;&nbsp;<Badge pill bg="secondary" className="mx-2">{this.state.sorting.kit_version ? "Ascending" : "Decending"}</Badge></th>
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