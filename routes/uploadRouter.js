const express = require("express");
const bodyParser = require("body-parser");
const createError = require('http-errors');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can only upload image files!'), false);
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter: imageFileFilter
});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.post(authenticate.verifyUser, authenticate.verifyAdmin,
upload.single('imageFile'), 
(req, res, next) => {
    res.status(200).json(req.file);
})
.get(authenticate.verifyUser, authenticate.verifyAdmin,
(req, res, next) => {
    res.status(403).send('GET operation not supported');
})
.put(authenticate.verifyUser, authenticate.verifyAdmin,
(req, res, next) => {
    res.status(403).send('PUT operation not supported');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin,
(req, res, next) => {
    res.status(403).send('DELETE operation not supported');
})

module.exports = uploadRouter;