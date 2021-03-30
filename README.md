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

Download all 6 files from links below (_.crt, _.key and intermediate \*.crt) for DEV and PROD env and save them in **`./app/cert`** folder

- https://cloud.int.godaddy.com/security/certs/5f38c890db3da4d44a21892d13961943
- https://cloud.int.godaddy.com/security/certs/a6b3bdb3dbade458fe6ec170ba9619e5

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
npm install
cd app && npm install
```

### 6) Run web server and open application in browser

```
npm run local
```

Go to https://local.ui.threat.int.dev-gdcorp.tools:8443 in favorite browser.
It supports live reload and code update at least for client-side code (no need to restart server)

For local debug of back-end side (NodeJS) run

```
npm run local:debug
```

Go to `chrome://inspect` in Chrome browser and open Chrome Dev Tools for your back-end code

## Deploy in different env

By default automatci deployments happen in dev env. To deploy manually in production env, we need to update .varenv file

For development

```bash
NODE_ENV=development
GD_ROOT_DOMAIN=dev-gdcorp.tools
```

For production

```bash
NODE_ENV=production
GD_ROOT_DOMAIN=gdcorp.tools
```
