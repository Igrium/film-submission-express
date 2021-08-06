import { Router } from 'express';
import { JsonDB } from 'node-json-db';
import passport from 'passport';
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from 'passport-local';

interface User {
    id: string
    password: string // MAKE SURE TO HASH
    accessLevel: number
}

function initAuth() {
    const db = new JsonDB('./users', true, true);

    passport.use(new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password"
        },
        function (username, password, done) {
            let user = db.getObject<User>(`/${username}`)
            if (!user) {
                return done(null, false, { message: 'User does not exist.' });
            }

            if (password !== user.password) {
                return done(null, false, { message: 'Invalid password.'});
            }

            return done(null, true);
        }
    ));

    passport.serializeUser((user, done) => {
    });
    passport.deserializeUser(function (user, done) {
        done(null, db.getObject<User>(`/${user}`))
    });

    const router = Router();
    router.post('/login', passport.authenticate('local'), function(req, res) {
        res.json(req.user);
    })
}