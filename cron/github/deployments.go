package github

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
)

var token = os.Getenv("GITHUB_TOKEN")

type Deployments struct {
	DeploymentList []DeploymentPath `json:"tree"`
}

type DeploymentPath struct {
	Path string `json:"path"`
}

type KitInfo struct {
	Name       string `yaml:"kit_name"`
	Version    string `yaml:"kit_version"`
	Deployer   string `yaml:"deployer"`
	Features   string `yaml:"features"`
	Kit_Is_Dev string `yaml:"kit_is_dev"`
	Dated      string `yaml:"dated"`
}

type FileContents struct {
	FileInfo string `json:"content"`
}

func FetchAllKitInfo() map[string][]map[string]string {
	// example structure for kits
	// {
	// 	buffalo-lab/:{
	// 	dated:"2021-11-17 03:31:14 +0000",
	// 	deployer:"xiujiao",
	// 	features:"vsphere,proto,vault-credhub-proxy",
	// 	kit_is_dev:0,
	// 	kit_name:"bosh",
	// 	kit_version:"2.2.1"
	// 	}
	// }
	deployments := getDeploymentURLS()
	kits := getKitInfo(deployments)
	return kits
}

// Gets all GitHub paths for .yml files
func getDeploymentURLS() Deployments {
	reqURL := "https://api.github.com/repos/starkandwayne/deployments/git/trees/master?recursive=1"
	data := makeRequest(reqURL)
	var deployments Deployments
	json.Unmarshal(data, &deployments)
	deployments.DeploymentList = filterDeployments(deployments)
	return deployments
}

func getKitInfo(deployments Deployments) map[string][]map[string]string {
	// example structure for kits
	// {
	// 	buffalo-lab/:{
	// 	dated:"2021-11-17 03:31:14 +0000",
	// 	deployer:"xiujiao",
	// 	features:"vsphere,proto,vault-credhub-proxy",
	// 	kit_is_dev:0,
	// 	kit_name:"bosh",
	// 	kit_version:"2.2.1"
	// 	}
	// }
	kits := make(map[string][]map[string]string)
	for _, deployment := range deployments.DeploymentList {
		kitName := getName(deployment.Path)
		var exodus_data KitInfo
		exodus_data = getYamlContents("https://api.github.com/repos/starkandwayne/deployments/contents/" + deployment.Path)
		kit_details := make(map[string]string)
		kit_details["deployment_name"] = kitName + "/"
		kit_details["kit_name"] = exodus_data.Name
		kit_details["kit_version"] = exodus_data.Version
		kit_details["deployer"] = exodus_data.Deployer
		kit_details["features"] = exodus_data.Features
		kit_details["kit_is_dev"] = exodus_data.Kit_Is_Dev
		kit_details["dated"] = exodus_data.Dated
		kits[kitName] = append(kits[kitName], kit_details)
	}
	return kits
}

// Filters out irrelevant deployment paths
func filterDeployments(deployments Deployments) []DeploymentPath {
	var filteredDeployments []DeploymentPath
	// Regex that checks if the path contains a .genesis/manifests subdirectory and the .yml file extension
	reg, _ := regexp.Compile("^.*(\\.genesis\\/manifests\\/).*\\.(yml)$")
	for _, deployment := range deployments.DeploymentList {
		if reg.MatchString(deployment.Path) {
			filteredDeployments = append(filteredDeployments, deployment)
		}
	}
	return filteredDeployments
}

// Parses yml file for exodus kit name and version
func getYamlContents(apiURL string) KitInfo {
	body := makeRequest(apiURL)
	var fileContents FileContents
	json.Unmarshal(body, &fileContents)
	fileString, _ := base64.StdEncoding.DecodeString(fileContents.FileInfo)
	data := make(map[string]KitInfo)
	yaml.Unmarshal(fileString, &data)
	return data["exodus"]
}

// Makes API request to GitHub
func makeRequest(url string) []byte {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("Authorization", "token "+token)
	httpClient := http.Client{}
	if err != nil {
		fmt.Fprintf(os.Stderr, "could not create HTTP request: %v", err)
	}
	res, err := httpClient.Do(req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "could not send HTTP request: %v", err)
	}
	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)
	return body
}

// Trims .yml file name to get deployment name
func getName(name string) string {
	splits := strings.Split(name, "/")
	return strings.Trim(splits[len(splits)-1], ".yml")
}
