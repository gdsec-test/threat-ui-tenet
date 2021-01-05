# threat-ui-tenet

Threat UI aka Tenet to work with GD Threat API and render human-friendly results

## Local Setup

To support https with SSO for local development, first update your hosts file (/etc/hosts)
to include:

```
127.0.0.1  local.gasket.dev-godaddy.com
```

Now start up the app.

```bash\shell

npm install

npx gasket local
```

The app should now be accessible over https on port 8443 at:

```
https://local.gasket.dev-godaddy.com:8443
```
