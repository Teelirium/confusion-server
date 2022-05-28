const express = require("express");
const bodyParser = require("body-parser");
const createError = require('http-errors');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Comments = require('../models/comments');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Comments.find(req.query)
        .populate('author')
        .then((comments) => {
            res.json(comments);
        })
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body == null) {
        let err = createError(404, 'Comment not found in request body');
        return next(err);
    }
    //@ts-ignore
    req.body.author = req.user._id;
    Comments.create(req.body)
        .then(comment => {
            Comments.findById(comment._id)
            .populate('author')
            .then(comment => {
                return res.json(comment);
            })
        })
        .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,
(req, res, next) => {
    res.status(403)
    .send(`PUT operation not supported on /comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,
(req, res, next) => {
    Comments.remove({})
    .then(resp => res.json(resp))
    .catch(err => next(err));
});

commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId)
        .populate('comments.author')
        .then((comment) => {
            return res.json(comment);
        })
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403)
    .send(`POST operation not supported on 
        /comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
        .then((comment) => {
            if (!comment) {
                let err = createError(404, `Comment ${req.params.commentId} not found`);
                return next(err);
            }
            //@ts-ignore
            if (!comment.author.equals(req.user._id)) {
                let err = createError(403, 'You are not authorized to perform this operation');
                return next(err);
            }
            //@ts-ignore
            req.body.author = req.user._id;
            Comments.findByIdAndUpdate(req.params.commentId, {$set: req.body}, {new: true})
            .then((comment) => {
                Comments.findById(comment._id)
                    .populate('author')
                    .then(comment => res.json(comment));
            });
        })
        .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
        .then((comment) => {
            if (!comment) {
                let err = createError(404, `Comment ${req.params.commentId} not found`);
                return next(err);
            }
            //@ts-ignore
            if (!comment.author.equals(req.user._id)) {
                let err = createError(403, 'You are not authorized to perform this operation');
                return next(err);
            }
            Comments.findByIdAndRemove(req.params.commentId)
                .then(resp => {
                    return res.json(resp);
                })
                .catch(err => next(err));
        })
        .catch((err) => next(err));
});

module.exports = commentRouter;