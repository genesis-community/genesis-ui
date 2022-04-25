package github

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

var token = os.Getenv("GITHUB_TOKEN")

type Deployments struct {
	DeploymentList []DeploymentInfo `json:"items"`
}

type DeploymentInfo struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

type KitInfo struct {
	Name    string `yaml:"kit_name"`
	Version string `yaml:"kit_version"`
}

type FileContents struct {
	FileInfo string `json:"content"`
}

func GetDeploymentURLS() {
	reqURL := "https://api.github.com/search/code?q=extension:yml+repo:starkandwayne/deployments"
	data := makeRequest(reqURL)
	var deployments Deployments
	json.Unmarshal(data, &deployments)

}

// Fetches deployment with Exodus kit info
func FetchDeploymentsInfo(orgName string, repoName string, directoryPath string) map[string]KitInfo {
	reqURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/%s", orgName, repoName, directoryPath)
	kits := make(map[string]KitInfo)
	deployments := getDeployments(reqURL)
	for _, deployment := range deployments {
		kits[strings.Trim(deployment.Name, ".yml")] = getYamlContents(reqURL + deployment.Name)
	}
	return kits
}

// Gets all deployments in directory
func getDeployments(apiURL string) []DeploymentInfo {
	body := makeRequest(apiURL)
	var DeploymentsList []DeploymentInfo
	err := json.Unmarshal(body, &DeploymentsList)
	if err != nil {
		fmt.Fprintf(os.Stderr, "could not parse deployments: %v", err)
	}
	return DeploymentsList
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

// Makes API request to Github
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
