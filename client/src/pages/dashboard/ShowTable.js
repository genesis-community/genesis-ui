import React, {useState,useEffect} from "react";
import {Table} from "react-bootstrap";

function ShowDeploymentInfo(env){
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(()=>{
        async function getInfo(){
            try{
                setLoading(true);
                let json = "";
                var arr = [];
                let dp={"deployment_name" : env[i]};

                if (env.length > 1){

                    for (var i = 0; i<env.length;i++) {
                        console.log(env[i]);
                        const response = await fetch(`/list/` + env[i]);
                        json = await response.json();
                        console.log(json);

                        for (var key in json) {
                            arr.push(json[key]+dp);
                        }
                        (arr.map(item => {
                            // item.append({"deployment_name":env[i]})
                            console.log(item);
                        }));
                    }
                }
                else {
                    const response = await fetch(`/list/` + env);
                    json = await response.json();
                    for (var key in json) {
                        arr.push(json[key]);
                    }

                    // (arr.map(item => {
                    //
                    //     console.log(item);
                    // }));
                }

                setResults(
                    arr.map(item => {
                        return item;
                    })
                );

            }
            finally {
                setLoading(false);
            }

        }

        if (env !== '') {
            getInfo();
        }
    }, [env]);


return [results,loading];
}


export default function ShowTable({env}){
    const [deploymentInfo,setdeploymentInfo] = ShowDeploymentInfo(env);

    return (
        <div>
            <Table responsive>
                <thead>
                <tr>

                    <th>Deployment Name</th>
                    <th>Kit_name</th>
                    <th>Deployment Date</th>
                    <th>Kit_version</th>

                </tr>
                </thead>
                <tbody>
                {deploymentInfo.map((item) => (
                <tr>
                    <td>{env}</td>
                    <td>{item.kit_name}</td>
                    <td>{item.dated}</td>
                    <td>{item.kit_version}</td>
                    </tr>

                    ))}
                </tbody>
            </Table>

        </div>
    );

}