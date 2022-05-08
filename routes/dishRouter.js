const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const createError = require('http-errors');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req, res, next) =>{
    Dishes.find({})
    .then((dishes) => {
        res.status(200).json(dishes);
    })
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Dishes.create(req.body)
    .then((dish) => {
        console.log(`Dish created: ${dish}`);
        res.status(200).json(dish);
    })
    .catch((err) => next(err));    
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send('PUT operation not supported on /dishes');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.status(200).json(resp);
    })
    .catch((err) => next(err));   
});

dishRouter.route('/:dishId')
.get((req, res, next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        res.status(200).json(dish);
    })
    .catch((err) => next(err));    
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send('POST operation not supported on /dishes/'+req.params.dishId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body,
    }, {new: true})
    .then((dish) => {
        res.status(200).json(dish);
    })
    .catch((err) => next(err));  
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((dish) => {
        res.status(200).json(dish);
    })
    .catch((err) => next(err)); 
});

dishRouter.route('/:dishId/comments')
.get((req, res, next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish) {
            res.status(200).json(dish.comments);
        }
        else {
            let err = createError(404, `Dish ${req.params.dishId} not found`);
            return next(err);
        }
    })
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish) {
            dish.comments = req.body;
            dish.save()
            .then((dish) => {
                res.status(200).json(dish.comments);
            });
        }
        else {
            let err = createError(404, `Dish ${req.params.dishId} not found`);
            return next(err);
        }
    })
    .catch((err) => next(err));    
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send(`PUT operation not supported on 
    /dishes/${req.params.dishId}'/comments`);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish) {
            for (let i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.status(200).json(dish.comments);
            });
        }
        else {
            let err = createError(404, `Dish ${req.params.dishId} not found`);
            return next(err);
        }
    })
    .catch((err) => next(err));   
});

dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
            res.status(200).json(dish.comments.id(req.params.commentId));
        }
        else if (!dish) {
            let err = createError(404, `Dish ${req.params.dishId} not found`);
            return next(err);
        }
        else {
            let err = createError(404, `Comment ${req.params.commentId} not found`);
            return next(err);
        }
    })
    .catch((err) => next(err));    
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send(`POST operation not supported on 
    /dishes/${req.params.dishId}/comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save()
            .then((dish) => {
                res.status(200).json(dish.comments.id(req.params.commentId));
            });
        }
        else if (!dish) {
            let err = createError(404, `Dish ${req.params.dishId} not found`);
            return next(err);
        }
        else {
            let err = createError(404, `Comment ${req.params.commentId} not found`);
            return next(err);
        }
    })
    .catch((err) => next(err)); 
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                res.status(200).json(dish.comments);
            });
        }
        else if (!dish) {
            let err = createError(404, `Dish ${req.params.dishId} not found`);
            return next(err);
        }
        else {
            let err = createError(404, `Comment ${req.params.commentId} not found`);
            return next(err);
        }
    })
    .catch((err) => next(err)); 
});

module.exports = dishRouter;