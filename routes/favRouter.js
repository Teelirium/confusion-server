//@ts-nocheck
const express = require("express");
const bodyParser = require("body-parser");
const createError = require('http-errors');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favourites = require('../models/favourite');

const favsRouter = express.Router();

favsRouter.use(bodyParser.json());

favsRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, 
(req, res, next) => {
    Favourites.findOne({user: req.user._id})
        .populate('dishes').populate('user')
        .then(async(fav) => {
            if (fav == null) {
                fav = await Favourites.create({user:req.user._id});
            }
            res.json(fav);
        })
        .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,
(req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then((fav) => {
        if (fav == null) {
            fav = new Favourites({user:req.user._id});
        }
        fav.dishes = fav.dishes.concat(req.body);
        let uniqueDishes = fav.dishes.filter((val, i) => fav.dishes.indexOf(val) === i);
        fav.dishes = uniqueDishes;
        fav.save()
        .then(fav => {
            Favourites.findById(fav._id)
            .populate('dishes').populate('user')
            .then(fav => {
                res.json(fav);
            });
        });
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,
(req, res, next) => {
    res.status(403).send('Operation not supported on current route');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,
(req, res, next) => {
    Favourites.findOneAndDelete({user: req.user._id})
    .then(fav => {
        res.json(fav);
    })
    .catch(err => next(err));
})

favsRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, 
(req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then(favs => {
        let doesntExist = !favs || favs.dishes.indexOf(req.params.dishId) < 0;
        return res.json({exists: !doesntExist, favourites: favs});
    })
    .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, 
(req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then(fav => {
        if (fav.dishes.indexOf(req.params.dishId) === -1) {
            fav.dishes.push(req.params.dishId);
        }
        fav.save()
        .then(fav => {
            Favourites.findById(fav._id)
            .populate('dishes').populate('user')
            .then(fav => {
                res.json(fav);
            });
        });
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, 
(req, res, next) => {
    res.status(403).send('Operation not supported on current route');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, 
(req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then(fav => {
        const index = fav.dishes.indexOf(req.params.dishId);
        if (index === -1) {
            let err = createError(404, 'Dish not in favorites');
            return next(err);
        }
        fav.dishes = fav.dishes.filter((val, i) => i !== index);
        fav.save()
        .then(fav => {
            Favourites.findById(fav._id)
            .populate('dishes').populate('user')
            .then(fav => {
                res.json(fav);
            });
        });
    })
    .catch(err => next(err));
})

module.exports = favsRouter;