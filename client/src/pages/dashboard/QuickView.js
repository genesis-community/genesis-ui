import { Component } from "react";
import { Row, Col, Badge, Card, CardGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';
import RouteMap from "../../RouteMap";

class QuickView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            quickViewDeployments:  null
        }
    }

    componentDidMount = async () =>{
        await this.fetchQuickviews();
        // if (localStorage.getItem("quickview")) {
        //     this.setState({ quickViewDeployments: JSON.parse(localStorage.getItem("quickview")) })
        //     console.log(this.state.quickViewDeployments)
        // }
    }

    removeQuickView = (key) => {
        if (localStorage.getItem("token")){
        const backup = this.state.quickViewDeployments;
        delete backup[key];
        this.setState({ quickViewDeployments: backup })
        const localStorage_token = localStorage.getItem("token");

            // localStorage.removeItem("quickview");
            fetch(`deleteQuickview?token=${localStorage_token}`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                    
                },
                body: JSON.stringify({
                    name:key,
                })
            })
                .then(response => response.json())
                .then(response => {
                  console.log(response)
                    })
                .catch(error => console.log(error))

    }else{
        const backup = this.state.quickViewDeployments;
        delete backup[key];
        this.setState({ quickViewDeployments: backup })
        const sessionStorage_token = sessionStorage.getItem("token");

            fetch(`deleteQuickview?token=${sessionStorage_token}`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                    
                },
                body: JSON.stringify({
                    name:key,
                })
            })
                .then(response => response.json())
                .then(response => {
                  console.log(response)
                    })
                .catch(error => console.log(error))
    }
}
    fetchQuickviews = async () => {
        if (localStorage.getItem("token")){
        const localStorage_token = localStorage.getItem("token");
        await fetch(`quickviews?token=${localStorage_token}`, {
            method: "GET",
            headers: {
                Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                
            },
        })
            .then(response => response.json())
            .then(response => {
              console.log(response)
                
              var data = response["quickviews"] //break up JSON response into smaller bits inorder to access nested levels

            //   console.log(data["meeting"]) uncomment these to see how the data looks and different ways to access it
            //   console.log(data.meeting.deployments)
 
              this.setState({
                quickViewDeployments: data
              })

            //   console.log(Object.keys(data))
            //   console.log(this.state.quickViewDeployments)
              
                })
            .catch(error => console.log(error))
    }else if((sessionStorage.getItem)){
        const sessionStorage_token = sessionStorage.getItem("token");
        await fetch(`quickviews?token=${sessionStorage_token}`, {
            method: "GET",
            headers: {
                Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                
            },
        })
            .then(response => response.json())
            .then(response => {
              console.log(response)
                
              var data = response["quickviews"] //break up JSON response into smaller bits inorder to access nested levels

            //   console.log(data["meeting"]) uncomment these to see how the data looks and different ways to access it
            //   console.log(data.meeting.deployments)
 
              this.setState({
                quickViewDeployments: data
              })

            //   console.log(Object.keys(data))
            //   console.log(this.state.quickViewDeployments)
              
                })
            .catch(error => console.log(error))
    }else{
        alert("Something is wrong...  Log out and log back in")
    }
}

    renderQuickView = () => {
        if (this.state.quickViewDeployments) {
            // console.log(Object.entries(this.state.quickViewDeployments)) takes the two below and puts them into a big array
            // console.log(Object.keys(this.state.quickViewDeployments))  returns all the names of the quickviews
            // console.log(Object.values(this.state.quickViewDeployments.meeting.deployments)) returns the deployments and kitname arrays
            // console.log(this.state.quickViewDeployments)
            const data =  Object.keys(this.state.quickViewDeployments)
            return (

            // key = qv names, value = idx
               data.map((key, value) => ( 
                    <Row className="w-50">
                        <Col>
                            <Card key={key} className="shadow p-3 mb-5 bg-white rounded m-3" role="button">
                                <Card.Body>
                                    {/* take all deployments in the array and use them as a link back to displaying them on the dashboard */}
                                    <Row as={Link} to={`${RouteMap.Dashboard}/?quickviewDeployments=${JSON.stringify(this.state.quickViewDeployments[key].deployments).replaceAll(' ',"")}`}>

                                        <Col>
                                            <h6 key={key} className="text-center">{key}</h6>
                                            <hr />
                                        <Row>
                                        <h6 className="text-left">Deployments:</h6>
                                        </Row>
                                        {/* Object.values(this.state...) takes all the information associated with the key(qv names). 
                                        in this case, the deployment array and the kitname array. Doing .deployment or .kitname 
                                        lets the map act on one at a time. Note that maps automatically loop thru arrays.
                                        This is the equivalent of doing nested for-loops */}
                                                {Object.values(this.state.quickViewDeployments[key].deployments).map((x) => (
                                                <Badge bg="primary" key={`dep-${x}`} className={"mx-2"}>{x}</Badge>
                                                 ))}
                                                <hr />
                                        <Row>
                                        <h6 className="text-left">Kit Names:</h6>
                                        </Row>
                                                {Object.values(this.state.quickViewDeployments[key].kitname).map((x) => (
                                                <Badge bg="primary" key={`dep-${x}`} className={"mx-2"}>{x}</Badge>
                                                 ))}
                                                <hr />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="d-flex flex-row-reverse">
                                            <FontAwesomeIcon icon={faTrash} alt={"Trash Can"} className="mx-2 text-danger" onClick={() => this.removeQuickView(key)} />
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
        if (localStorage.getItem("token")){
        const localStorage_token = localStorage.getItem("token");
        let i=0;
        this.setState({ quickViewDeployments: null });
            for(i;i<Object.keys(this.state.quickViewDeployments).length;i++){
                fetch(`deleteQuickview?token=${localStorage_token}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                        
                    },
                    body: JSON.stringify({
                        name:Object.keys(this.state.quickViewDeployments)[i],
                    })
                })
                    .then(response => response.json())
                    .then(response => {
                      console.log(response)
                        })
                    .catch(error => console.log(error))
            }
           
    }else if (sessionStorage.getItem("token")){
        const sessionStorage_token = sessionStorage.getItem("token");
        let i=0;
        this.setState({ quickViewDeployments: null });
            for(i;i<Object.keys(this.state.quickViewDeployments).length;i++){
                fetch(`deleteQuickview?token=${sessionStorage_token}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token") ?? sessionStorage.getItem("token")}`,
                        
                    },
                    body: JSON.stringify({
                        name:Object.keys(this.state.quickViewDeployments)[i],
                    })
                })
                    .then(response => response.json())
                    .then(response => {
                      console.log(response)
                      console.log(this.state.quickViewDeployments)
                        })
                    .catch(error => console.log(error))
            }

    }else{
        alert("Something is wrong...  Log out and log back in")
    }
}
    render() {
        return (
            <div>
                <h4 className="text-center m-4">
                    Quickly access your favourite set of deployments here...
                </h4>

                {this.state.quickViewDeployments && Object.entries(this.state.quickViewDeployments).length ?
                    <Row>
                        <Col className="d-flex flex-row-reverse">
                            <Button variant="secondary" size={"sm"} className="mx-4" onClick={this.clearAll}>Delete All</Button>
                        </Col>
                    </Row>
                    :
                    <h6 className="text-center">No quickviews yet. To add a quickview, go to <Link to={RouteMap.Dashboard}>Dashboard</Link>, select set of deployments, add a name, and add to quickview.</h6>
                }

                <CardGroup>
                    {this.renderQuickView()}
                </CardGroup>
            </div>
        )
    }
}

export default QuickView;