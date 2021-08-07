import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response, Router } from 'express';
import session from 'express-session';
import { JsonDB } from 'node-json-db';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

namespace auth {
    export interface User {
        username: string
        password: string // MAKE SURE TO HASH
        admin: boolean
    }

    /**
     * Initialize authorization API.
     * @param database User database.
     * @param router Router to init on.
     */
    export function initAuth(database: JsonDB, router: Router) {
        router.use(
            session({
                secret: 'secretcode',
                resave: true,
                saveUninitialized: true
            })
        )
        router.use(cookieParser());
        router.use(passport.initialize());
        router.use(passport.session());

        // Passport
        passport.use(new LocalStrategy((username, password, done) => {
            let user = database.getObject<User>(`/users/${username}`);
            if (!user) return done(null, false);
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) return done(err);
                if (result) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
        }))

        passport.serializeUser((user: any, cb) => {
            cb(null, user.username);
        })

        passport.deserializeUser((id: string, cb) => {
            let user = database.getObject<User>(`/users/${id}`);
            if (!user) return cb(new Error("Unable to find user in database."));
            cb(null, user);
        })
    }

    export function authAPI(database: JsonDB) {
        let router = Router();

        router.post('/register', (req, res) => {
            const { username, password } = req?.body;
            if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
                res.status(400).json({ message: "Improper values." });
                return;
            }

            if (database.exists(`/users/${username}`)) {
                return res.status(409).json({ message: 'User already exists by that name.' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const user: User = {
                username,
                password: hashedPassword,
                admin: false
            }

            database.push(`/users/${username}`, user);
            res.json({ message: 'success' });
        })

        router.post('/login', passport.authenticate('local'), (req, res) => {
            res.json({ message: 'authenticated' });
        })

        router.post('/logout', (req, res) => {
            req.logout();
            res.json({ message: 'success' });
        })

        return router;
    }

    /**
     * Middleware function to ensure user is an admin.
     */
    export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as User;
        if (!user) {
            res.status(401).json({ message: "You're not logged in."});
            return;
        }

        if (user.admin) {
            next();
        } else {
            res.status(401).json({ message: "This action is only available to admins."});
        }
    }
    
    /**
     * Middleware function to ensure user is a curator.
     */
    export const checkCurator = (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as User;
        if (user) {
            next();
        } else {
            res.status(401).json({ message: "You're not logged in." });
        }
    }
}

export default auth;

// function initAuth() {
//     const db = new JsonDB('./users', true, true);

//     passport.use(new LocalStrategy(
//         {
//             usernameField: "username",
//             passwordField: "password"
//         },
//         function (username, password, done) {
//             let user = db.getObject<User>(`/${username}`)
//             if (!user) {
//                 return done(null, false, { message: 'User does not exist.' });
//             }

//             if (password !== user.password) {
//                 return done(null, false, { message: 'Invalid password.'});
//             }

//             return done(null, true);
//         }
//     ));

//     passport.serializeUser((user, done) => {
//     });
//     passport.deserializeUser(function (user, done) {
//         done(null, db.getObject<User>(`/${user}`))
//     });

//     const router = Router();
//     router.post('/login', passport.authenticate('local'), function(req, res) {
//         res.json(req.user);
//     })
// }