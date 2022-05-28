var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
const createError = require('http-errors');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

router.options('*', cors.corsWithOptions, (req, res) => res.sendStatus(200));

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
(req, res, next) => {
    User.find({})
    .then((users) => {
        res.status(200).json(users);
    })
    .catch(err => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
    //@ts-ignore
    User.register(new User({ username: req.body.username }), 
        req.body.password, 
        (err, user) => {
            if (err) {
                res.status(500).json({err});
            }
            else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save((err, user) => {
                    if (err) {
                        res.status(500).json({err});
                        return;
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.status(200).json({success: true, status: 'Registration Successful'});
                    });
                });
            }
        });
});

router.post('/login', cors.corsWithOptions,
(req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                success: false, 
                status: 'Login unsuccessful', 
                err: info
            });
        }
        req.logIn(user, err => {
            if (err) {
                res.status(401).json({
                    success: false, 
                    status: 'Login unsuccessful', 
                    err: 'Could not log in user'
                });    
            }
        });
        //@ts-ignore
        const token = authenticate.getToken({_id: req.user._id});
        res.json({success: true, status: 'Successfully logged in', token});
    })(req, res, next);
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
    if (req.session) {
        req.session.destroy(() => {});
        res.clearCookie('sesh');
        res.redirect('/');
    }
    else {
        let err = createError(403, "You are not logged in");
        return next(err);
    }
});

router.get('/checkJWT', cors.corsWithOptions, (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.status(401).json({status: 'JWT invalid', success: false, err: info});
        }
        return res.json({status: 'JWT valid', success: true, user});
    })
});

module.exports = router;
