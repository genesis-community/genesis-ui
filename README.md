# This is Genesis UI
- Frontend Design Prototype is in [Figma](https://www.figma.com/proto/GDGvVKokVwKynybHWPbjE6/Untitled?node-id=5%3A3&scaling=min-zoom&page-id=0%3A1) and mind chart in [Lucidchart](https://lucid.app/lucidchart/e5da1084-1e8c-41da-809b-eff2d67a8e6f/edit?invitationId=inv_bb2468bf-30ef-4c63-a4b9-b37ea4e4a91d&referringApp=slack&page=0_0#)
- Frontend will be using HTML CSS/SCSS and React
- Backend will be implement using [Golang](https://golang.org/) with [Gin Gonic](https://github.com/gin-gonic/gin) web framework. 
- Login Sequence Flow Chart [here](https://lucid.app/lucidchart/86e2f604-047d-43e8-b982-815ce1863407/edit?invitationId=inv_014524c2-5b7d-4f1a-9b92-9171663edcab&referringApp=slack&page=0_0#)
---
# Phases for The Genesis UI

## Phase 1: Informational Interface.
See below for [Make](#make-commands) Commands
The informational Interface will contains three web pages:
- [x] A login page for developers to login using their S&W credentials.
- [ ] A home page for showing most recent viewed deployment details, a sandwich menu for accessing account information, and a navigation bar for accessing list of deployments with filter categories such as the region(US East / US West) or deployment type(Lab / Products / Others). The home page also contains a youtube tutorial explaining the UI and helping new users to get familiar with GENESIS UI.
- [ ] A Deployment page for hosting all information (company, region, infrastructure and etc) of the selected deployment for detailed information.

### Current focus:
- [ ] Improving prototype based on deployment filters and specifications.
- [x] Getting familiar with Golang and Gin Gonic for backend.
- [ ] Enhancing React Prototype for the login page implementation and functionality.
---
## Phase 2: Compare Deployment.

---
## Phase 3: Functional Interface.

---
## Phase 4: Health Monitoring. 

---
## Make Commands
* `make all` - Run `docker build` to create `genesis-ui` image from [DockerFile](./Dockerfile) and `docker run` to create a `genesis-ui` container based on `genesis-ui` image to hosting Genesis UI.
* `make stop` - Stop `genesis-ui` container from running and then remove container and image.
* `make build` - Build the `genesis-ui` image from [DockerFile](./Dockerfile).
* `make start` - Starts a `genesis-ui` container.
* `make logs` - View Gin Gonic logs.
* `make logs-tail` - View Gin Gonic logs in detail.
---
