# threat-ui-tenet

Threat UI aka Tenet to work with GD Threat API and render human-friendly results

## Local Setup And Development

### 1) Add DNS record for local development

next line into your **`/etc/hosts`** file

```
127.0.0.1  local.ui.threat.int.dev-gdcorp.tools
```

### 2) Add credentials to access GoDaddy local NPM artifactory\registry to install dependencies

Create file **`.npmrc`** in home folder (**`~/.npmrc`**)
Copy content of secret https://us-west-2.console.aws.amazon.com/secretsmanager/home?region=us-west-2#/secret?name=npmrc_creds from AWS Secret Manager into this file

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

### 6) Run web server and open application in browser

!!!Auth in AWS Account

```
npm run local
```
!!!Gasket `local` environment is no longer supported and locally we run `development` environment. Local env can be separated by special env var `LOCAL_TENET_CONFIG=true`

Troubleshooting tip: If **npm run local** fails, manually install dependencies or peer dependencies which are not downloaded automatically (for example, gasket/plugin-nextjs)
For proper upgrade or npm packages issues it is recommened to use `@godaddy/gasket-upgrade-cli` tool (https://github.secureserver.net/gasket/gasket/blob/master/docs/upgrades.md)

Go to https://local.ui.threat.int.dev-gdcorp.tools:8443 in favorite browser.
It supports live reload and code update at least for client-side code (no need to restart server)

For local debug of back-end side (NodeJS) run

```
npm run local:debug
```

Go to `chrome://inspect` in Chrome browser and open Chrome Dev Tools for your back-end code

## Deploy in different env

Automatic deployments are setup from `main` and `develop`

For development

If code pushed to `develop` branch, it will be automatically deployed to `DEV` env

For production

If code pushed to `main` branch, it will be automatically deployed to `PROD` env

Fixing security vulnerability issues - https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities
