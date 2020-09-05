/* eslint-disable no-console */
// Imports
const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api/routes');
const cors = require('cors');
const mongoose = require('mongoose');
const { server: config } = require('./api/config');
const { privateKey, certificate, host, port, passphrase } = config;
const key = fs.readFileSync(privateKey);
const cert = fs.readFileSync(certificate);
const options = { key, cert, passphrase };
const { errorHandler } = require('./api/middleware');
const helmet = require('helmet');
require('dotenv').config();

// Instantiate server
const app = express();

// Init Mongoose
const connection = mongoose.connection;

// Body Parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// helmet
app.use(helmet());
// Cors
app.use(cors({credentials: true, origin: 'http://localhost:8100'})); 

// API Configuration
app.use('/api', api);
app.use(errorHandler);
app.use((req, res) => {
    const err = new Error('404 - Not Found !!!!!');
    err.status = 404;
    res.json({ msg : '404 - Not Found !!!!!', err: err});
});

// Mongoose Configuration
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/attila', { useNewUrlParser: true });
connection.on('error', (err) => {
    console.error(`Connection to MongoDB error: ${err.message}`);
});

const herokuPort = process.env.PORT || port;

// Launch server
connection.once('open', () => {
    console.log('Connected to MongoDB');
    https.createServer(options, app).listen(herokuPort, host, () => {
        console.log(`App is running ! Go to https://${host}:${port}`);
    });
});



