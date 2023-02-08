# threat-ui-tenet

Threat UI aka Tenet to work with Threat API and render human-friendly results.

This platform supports several threat triage modules and Indicators of Compromise (IOCs).

| Environment   | URL                                     |
| ------------- | --------------------------------------- |
| `DEV-PRIVATE` | None                                    |
| `DEV`         | https://ui.threat.int.dev-gdcorp.tools/ |
| `PROD`        | https://ui.threat.int.gdcorp.tools/     |

## Local Setup And Development

### 1) Add DNS record for local development

next line into your **`/etc/hosts`** file

```
127.0.0.1  local.ui.threat.int.dev-gdcorp.tools
```

### 2) Add credentials to access GoDaddy local NPM artifactory\registry to install dependencies

Create file **`.npmrc`** in home folder (**`~/.npmrc`**)
Copy content of secret https://us-west-2.console.aws.amazon.com/secretsmanager/home?region=us-west-2#/secret?name=npmrc_creds from AWS Secret Manager into this file
Similar file is stored in repo, but without secret, which is appended during CICD
`!!!Important: .npmrc file should have exact format including line breaks to work properly, or it won't be used for private repo`

### 3) Download SSL certificates

Download files from links below (_.crt, _.key) for Local env and save them in **`./app/cert`** folder

Open https://cloud.int.godaddy.com/security/certs/list?filterName=ui.threat.int&filterStatus=ISSUED%2CPENDING_ISSUANCE%2CDENIED and see for most fresh issued certificate (newest expire date)

Multi-subdomain certificate with primary `ui.threat.int.dev-gdcorp.tools` and alternative name `local.ui.threat.int.dev-gdcorp.tools`
`https://cloud.int.godaddy.com/security/certs/5be0a442dbbe0154b8f04a2813961928` should be used for local, dev (and dev-private) environments

`ui.threat.int.gdcorp.tools` - production (not needed for local development)

For local emulation of environement download multi-subdomain cert `ui.threat.int.dev-gdcorp.tools` (_.cert, _.key and intermediate \*.crt) and save in **`./app/cert`** folder

### 4) Install NodeJS + NPM, NPX and Pre-Commit. Recommended version 12.16.1, or up to 14.x.x

**NodeJS + NPM**: Can use one of next sources:

- https://nodejs.org/en/download/
- https://github.com/nvm-sh/nvm

helpful tools to manage NodeJS version: NVM and AVN (https://github.com/wbyoung/avn)

**NPX**:
Run **`npm install -g npx`** to install NPX

**Pre-Commit**: https://pre-commit.com/

### 5) Install dependencies

```
npm install --production=false
cd app && npm install --production=false
```

### 6) Authenticate

Since this is an internal GoDaddy platform intended for use by authorized GoDaddy employees only, you must be connected to the GoDaddy VPN and logged into the relevant Threat Tools AWS account (DEV-PRIVATE, DEV or PROD) via your terminal for running the web server locally.

Download the `aws-cli` and `aws-okta-processor` command-line interface (CLI) tools if they are not already installed and configured on your computer. Configuration and installation instructions can be found [here](https://confluence.godaddy.com/display/ITSecurity/AWS+Tips+and+Tricks) in the `Getting Started` section. You can seek support in the `#aws-onboarding` Slack channel if you run into issues during setup.

Login to the Threat Tools AWS account using aws-okta-processor (use `Dev-Private` for initial setup, local development and testing):

```
eval $(aws-okta-processor authenticate -d 7200 -e -o godaddy.okta.com -u ${USER} -k okta)
```

The above command will generate a session token which expires after a certain point of time, so make sure to log back in after it has expired before attempting to run this web application locally.

After completing the above steps and logging in successfully, you can proceed to the next step.

### 7) Run web server and open application in browser

!!!Auth in AWS Account
Login to the `Threat Tools` AWS `Dev-Private` account if you are running the app locally using VS Code (or any other IDE of your choice) for development and testing. This is required by the `Forensic Storage` Threat UI page.

Make sure to be on VPN (Gateway and Portal should be phx3) else the app will not load.

```
npm run local
```

!!!Gasket `local` environment is no longer supported and locally we run `development` environment. Local env can be separated by special env var `LOCAL_TENET_CONFIG=true`

Troubleshooting tip: If **npm run local** fails, manually install dependencies or peer dependencies which are not downloaded automatically (for example, gasket/plugin-nextjs)
For proper upgrade or npm packages issues it is recommened to use `@godaddy/gasket-upgrade-cli` tool (https://github.secureserver.net/gasket/gasket/blob/master/docs/upgrades.md)

Go to https://local.ui.threat.int.dev-gdcorp.tools:8443 in your favorite browser.

For local debug of back-end side (NodeJS) run:

```
npm run local:debug
```

Go to `chrome://inspect` in Chrome browser and open Chrome Dev Tools for your back-end code

## Code Deployment

Automatic deployments are setup from `main` and `develop`. The CICD pipelines (deployment workflows) can be found in the `.github\workflows` folder in this repository.

### Development

When your branch is merged into the `develop` branch, it will be automatically deployed to `DEV` environment.

### Production

When the `develop` branch is merged into the `main` branch, it will be automatically deployed to the `PROD` environment.

Any updates directly pushed to the `main` branch, will also automatically trigger the `PROD` deployment workflow which will deploy the new code in the environment.

## Additional Project Information

This project uses GoDaddy's internal UI/UX development tool: [UXCore2 with Gasket](https://uxcore.uxp.gdcorp.tools/docs/getting-started/uxcore2/gasket/).

### JavaScript Library

GoDaddy recommends using the `React` JavaScript library for UI/UX projects. This project uses `React`.

### Uxcore2 Components

Prebuilt `uxcore2` components are availbable for use [here](https://github.com/gdcorp-uxp/uxcore2/tree/release-2201/packages/components/). Navigate to the component's directory and then to `examples`, to find examples of the component's code that you can incorporate into this project as-is.

### Uxcore2 Support

In case you run into any issues, seek support in the `#uxcore2-support` Slack channel. Some components may not work as expected, if they are still under development or if you imported an unstable version of the component. A new release of uxcore2 or Gasket may also break your stable project build. If this happens, report it in the `#uxcore2-support` Slack channel as soon as possible.

### Security and Vulnerability Tests

Information on fixing security vulnerability issues using `npm audit` can be found [here](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities).
