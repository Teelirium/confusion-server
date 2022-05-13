var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
const createError = require('http-errors');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

/* GET users listing. */
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
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), 
(req, res) => {
    //@ts-ignore
    const token = authenticate.getToken({_id: req.user._id});
    res.status(200).json({success: true, token, status: 'Successfully logged in'});
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

module.exports = router;
