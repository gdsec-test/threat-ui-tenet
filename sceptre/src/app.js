const express = require('express');;
const app = express();
const port = 8443;

app.get('/', (req, res) => res.send('Page OK'))
app.get('/healthcheck', (req, res) => res.send('Page OK'))
app.listen(port, () => console.log(`app listening on port ${port}!`))

module.exports = app;
