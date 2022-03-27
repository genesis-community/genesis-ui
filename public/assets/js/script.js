// structure of vault data:
// {"deploy_list": []}
    // each environment eg: buffalo-lab, inside this is {"bosh": {}, "concourse":{} }


// onload function-> loads dropdown menu for environments
function generateDropdown(){
    const ul = document.getElementById('deploy');
    const url = '/list';

    fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
        //console.log(data)
        data_key = 'deploy_list'
        dep = document.getElementById("dropdown")
        dep.hidden = false
        for(env of data[data_key]){
            // console.log(env)
            let option = document.createElement("option")
            let minusSlash = env.slice(0,-1); //'buffalo-lab'
            option.innerHTML = minusSlash
            // console.log(minusSlash)
            option.value = env; // 'buffalo-lab/'
            dep.options.add(option);
        }
    })
    .catch(function(error) {
        console.log(error);
    });
}

// loads deployments and the table structure for each
function showDeploymentInfo(env){
    m = document.getElementById("deployments")
    m.hidden = true
    r = document.getElementById("deploymentDetails")
    r.hidden = true
    const url = '/list/' + env; // '/list/buffalo-lab/'
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
        // { "bosh" : {}, "concourse":{} }
        envDict = data
        depDiv = document.getElementById("depButtons")
        depDiv.innerHTML = ""
        for(kitname of Object.keys(envDict)){ // bosh, concourse, etc in buffalo-lab
            // console.log(kitname)
            m = document.getElementById("deployments")
            m.hidden = false
            let btn = document.createElement("button");
            btn.innerHTML = kitname;
            depDiv.appendChild(btn)
            btn.onclick = function displayTable()
            { // deployment bosh selected
                dictDep = envDict[kitname] // access "bosh" deployment dict
                // {bosh_name: "buffalo-lab", deploy_date: "2020-Nov-14 00:56:33 UTC", deployer_name: "xiujiao", kit_name: "bosh", kit_version: "2.0.1"}
                // console.log(dictDep)
                r = document.getElementById("deploymentDetails")
                r.hidden = false
                r.innerHTML = ""
                h = document.createElement("h3")
                h.innerHTML = " Selected deployment's details: "
                r.appendChild(h)
                table = document.createElement("table")
                table.innerHTML = ""
                if(dictDep != null){
                    // create table headings!
                    let tablerow = document.createElement("tr")
                    for(header of Object.keys(dictDep))
                    {
                        let tableheading = document.createElement("th")
                        tableheading.innerHTML = header;
                        tableheading.style.font = 10;
                        tablerow.append(tableheading)
                    }
                    table.appendChild(tablerow)
                    // table headings done!

                    details = document.createElement("tr")
                    for(dictKey of Object.keys(dictDep)){ 
                        // accesses each value in the dict to add as a row:
                        //console.log(dictKey)
                        r.appendChild(table);
                        d = document.createElement("td")
                        d.innerHTML = (`${dictDep[dictKey]}`);
                        details.appendChild(d) 
                    }
                    table.appendChild(details)
                }
            }
        }
    })
    .catch(function(error) {
        console.log(error);
    });
}