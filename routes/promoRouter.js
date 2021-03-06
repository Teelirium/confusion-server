const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require('../authenticate');
const cors = require('./cors');

const Promos = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) =>{
    Promos.find(req.query)
    .then((promos) => {
        res.json(promos);
    })
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
(req, res, next) => {
    Promos.create(req.body)
    .then((promo) => {
        console.log(`Promo created: ${promo}`);
        res.status(200).json(promo);
    })
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
(req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
(req, res, next) => {
    Promos.remove({})
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => next(err));
});

promoRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) =>{
    Promos.findById(req.params.promoId)
    .then((promo) => {
        res.status(200).json(promo);
    })
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
(req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /promotions/'+req.params.promoId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
(req, res, next) => {
    Promos.findByIdAndUpdate(req.params.promoId, {
        $set: req.body,
    }, {new: true})
    .then((promo) => {
        res.status(200).json(promo);
    })
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
(req, res, next) => {
    Promos.findByIdAndRemove(req.params.promoId)
    .then((promo) => {
        res.status(200).json(promo);
    })
    .catch((err) => next(err)); ;
});

module.exports = promoRouter;