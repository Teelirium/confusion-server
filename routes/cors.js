// cross-origin resource sharing
const express = require("express");
const cors = require('cors');
const app = express();

const whitelist = [
    'http://localhost:3001', 
    'https://localhost:3444', 
    'http://localhost:3000',
]
const corsOptionsDelegate = (req, cb) => {
    let corsOptions = {};
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {origin: true};
    }
    else {
        corsOptions = {origin:false};
    }
    cb(null, corsOptions);
}

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);