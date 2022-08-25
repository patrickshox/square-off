const express = require("express");
var cors = require("cors");
var cookieParser = require("cookie-parser"); // see if needed
import "reflect-metadata";
const passport = require("passport");
// const { sessionMiddleware } = require("./middlewares/authentication");
import { Request, Response } from "express-session"
import { useSocketServer } from "socket-controllers";
const GoogleStrategy = require("passport-google-oauth20").Strategy
var dotenv = require('dotenv')
var session = require("express-session");
dotenv.config();

// configure session (used in both app and socket)
let sessionMiddleware = session({ 
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    httpOnly: false, // key
    maxAge: null,
    path: "/",
    secure: true,
    sameSite: 'none'
})

// configure passport with Google Oauth
passport.serializeUser((user, done) => {
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user);
})


passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: "/auth/google/callback"
},
function (_: any, __: any, profile: any, cb: any) {
    cb(null, profile)
}));


// express app 
const app = express()
.set("trust proxy", 1)
.use(cors({ origin: "https://www.square-off.live/", credentials: true }))
.use(cookieParser())
.use(sessionMiddleware)
.use(passport.initialize())
.use(passport.session())
.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))
.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/login'}), (req, res) => {
    req.session.authenticated = true;
    res.redirect('https://www.square-off.live/#/play/');
})
.get("/getuser", (req: Request, res: Response) => {
    res.header("Access-Control-Allow-Origin", "https://www.square-off.live");
    res.send(req.user);
})

// create server
var http = require("http").Server(app);
http.listen(process.env.PORT)

// socket.io
var io = require("socket.io")(http,  {
    cors: {
        origin: "https://www.square-off.live/",
        credentials: true
    },
});
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    console.log("🐰", socket.request)
    console.log("🛸", socket.request.user)
    console.log("🌊", socket.request.session)
    if (socket.request.user) {
        console.log("authed")
        next();
    } else {
        console.log("unauthed")
        next();
    }
});

useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });