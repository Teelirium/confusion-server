const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require('../authenticate');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.get((req, res, next) =>{
    Leaders.find({})
    .then((leaders) => {
        res.status(200).json(leaders);
    })
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Leaders.create(req.body)
    .then((leader) => {
        console.log(`Leader created: ${leader}`);
        res.status(200).json(leader);
    })
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /leaders');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Leaders.remove({})
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => next(err));
});

leaderRouter.route('/:leaderId')
.get((req, res, next) =>{
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        res.status(200).json(leader);
    })
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /leaders/'+req.params.leaderId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body,
    }, {new: true})
    .then((leader) => {
        res.status(200).json(leader);
    })
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((leader) => {
        res.status(200).json(leader);
    })
    .catch((err) => next(err)); ;
});

module.exports = leaderRouter;