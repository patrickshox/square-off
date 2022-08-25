var express = require("express");
var session = require("express-session")
 var passport = require("passport")
var cookieParser = require("cookie-parser");
import * as cors from "cors";
import { Request, Response } from "express-session";
var dotenv = require('dotenv')
const GoogleStrategy = require("passport-google-oauth20").Strategy

let sessionMiddleware = session({ 
  secret: "secretcode",
  resave: true, 
  saveUninitialized: true,
  cookie: {
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24
  }
})

dotenv.config();

const app = express();

app.use(cookieParser());

app.set("trust proxy", 1);

app.use(sessionMiddleware)

// Middleware
app.use(express.json());
app.use(cors({ origin: "https://www.square-off.live/#/login/", credentials: true }))

app.use(passport.initialize());
app.use(passport.session());


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

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/login'}),
function (req, res) {
  req.session.authenticated = true;
  res.redirect('https://www.square-off.live/#/play/');
});


app.get("/", (req, res) => {
  res.send("Chess-off backend!");
})

app.get("/getuser", (req: Request, res: Response) => {
  req.session.user = req.user;
  res.header("Access-Control-Allow-Origin", "https://www.square-off.live");
  res.send(req.user);
})

app.get("/auth/logout", (req, res) => {
  if (req.user) {
    req.logout();
    res.send("done");
  }
})


exports.app = app
exports.sessionMiddleware = sessionMiddleware