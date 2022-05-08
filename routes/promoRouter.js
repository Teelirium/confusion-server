const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require('../authenticate');

const Promos = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req, res, next) =>{
    Promos.find({})
    .then((promos) => {
        res.status(200).json(promos);
    })
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Promos.create(req.body)
    .then((promo) => {
        console.log(`Promo created: ${promo}`);
        res.status(200).json(promo);
    })
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('PUT operation not supported on /promotions');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Promos.remove({})
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => next(err));
});

promoRouter.route('/:promoId')
.get(authenticate.verifyUser, (req, res, next) =>{
    Promos.findById(req.params.promoId)
    .then((promo) => {
        res.status(200).json(promo);
    })
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /promotions/'+req.params.promoId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Promos.findByIdAndUpdate(req.params.promoId, {
        $set: req.body,
    }, {new: true})
    .then((promo) => {
        res.status(200).json(promo);
    })
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Promos.findByIdAndRemove(req.params.promoId)
    .then((promo) => {
        res.status(200).json(promo);
    })
    .catch((err) => next(err)); ;
});

module.exports = promoRouter;