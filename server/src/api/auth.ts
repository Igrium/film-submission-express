import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response, Router } from 'express';
import session from 'express-session';
import { JsonDB } from 'node-json-db';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { SimpleUser, UserWithPassword } from 'fse-shared/dist/users'

namespace auth {
    /**
     * Represends a user with a hashed password.
     */
    export interface User extends SimpleUser {
        password: string // MAKE SURE TO HASH
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
            let { username, password, email, admin } = req?.body as Partial<UserWithPassword>;
            if (!username || !password || !email || typeof username !== 'string' || typeof password !== 'string' || typeof email !== 'string') {
                res.status(400).json({ message: "Improper values." });
                return;
            }
            if (typeof admin !== 'boolean') {
                admin = false;
            }

            if (database.exists(`/users/${username}`)) {
                return res.status(409).json({ message: 'User already exists by that name.' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const user: User = {
                username,
                password: hashedPassword,
                admin,
                email
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

        router.get('/me', (req, res) => {
            res.send(req.user);
        })

        router.get('/user/:name', checkCurator, (req, res) => {
            const me = req.user as User;
            if (!me.admin && req.params.name !== me.username) {
                res.status(403).json({ message: "Only admins can view other people's accounts." });
                return;
            }
            let path = `/users/${req.params.name}`;
            if (!database.exists(path)) {
                res.status(404).json({ message: "User not found." });
                return;
            }

            const user = database.getObject<User>(`/users/${req.params.name}`);
            // We don't want to send the password.
            const simpleUser: SimpleUser = { username: user.username, admin: user.admin, email: user.email };
            res.json(simpleUser);
        })

        router.post('/user/:name', checkCurator, (req, res) => {
            const me = req.user as User;
            if (!me.admin && req.params.name !== me.username) {
                res.status(403).json({ message: "Only admins can modify other people's accounts." });
                return;
            }
            const updated = req.body as Partial<UserWithPassword>
            const path = `/users/${req.params.name}`;
            if (!database.exists(path)) {
                return res.status(404).json({ message: "User not found." });
            }
            const old = database.getObject<User>(path);

            if ('admin' in updated && updated.admin != old.admin) {
                if (!me.admin) {
                    return res.status(403).json({ message: "Only admins can modify user admin states." });
                }
                if (me.username === req.params.name) {
                    return res.status(405).json({ message: "Cannot modify your own admin state." });
                }
            }

            let newPassword = undefined;
            if (updated.password) {

            }

            const n = {
                admin: updated.admin,
                email: updated.email,
                password: updated.password ? bcrypt.hashSync(updated.password, 10) : undefined 
            };

            database.push(path, mergeObject(old, n));
            res.json({ message: 'Success' });
            console.log(`Updated user: ${old.username}`);
        })

        return router;
    }
    
    const mergeObject = (a: any, b: any) => {
        let res = {} as any;
        Object.keys({...a, ...b}).map(key => {
            res[key] = b[key] || a[key];
        })
        return res;
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
            res.status(403).json({ message: "This action is only available to admins."});
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