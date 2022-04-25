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
	Name    string `yaml:"kit_name"`
	Version string `yaml:"kit_version"`
}

type FileContents struct {
	FileInfo string `json:"content"`
}

func FetchAllKitInfo() map[string][]KitInfo {
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

func getKitInfo(deployments Deployments) map[string][]KitInfo {
	kits := make(map[string][]KitInfo)
	for _, deployment := range deployments.DeploymentList {
		kitName := getName(deployment.Path)
		kits[kitName] = append(kits[kitName],
			getYamlContents("https://api.github.com/repos/starkandwayne/deployments/contents/"+deployment.Path))
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
	req.Header.Set("Authorization", token)
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
