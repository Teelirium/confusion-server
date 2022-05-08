var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
const createError = require('http-errors');
const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
    User.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                let err = createError(403, `User ${req.body.username} already exists`);
                return next(err);
            }
            else {
                return User.create({
                    username: req.body.username,
                    password: req.body.password
                });
            }
        })
        .then(user => {
            res.status(200).json({ status: 'Registration Successful', user });
        })
        .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
    if (!req.session.user) {
        let authHeader = req.headers.authorization;

        if (!authHeader) {
            res.setHeader('WWW-Authenticate', 'Basic');
            let err = createError(401, 'You are not signed in');
            return next(err);
        }

        let auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        let [username, password] = auth;

        User.findOne({ username })
            .then(user => {
                if (!user) {
                    let err = createError(403, `User ${username} does not exist`);
                    return next(err);
                }
                else if (user.password !== password) {
                    let err = createError(403, `Wrong password`);
                    return next(err);
                }
                else if (username === username && password === password) {
                    req.session.user = 'authenticated';
                    res.status(200).send('You are logged in');
                }
            })
            .catch(err => next(err));
    }
    else {
        res.status(200).send('You are already logged in');
    }
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('sesh');
        res.redirect('/');
    }
    else {
        let err = createError(403, "You are not logged in");
        return next(err);
    }
});

module.exports = router;
