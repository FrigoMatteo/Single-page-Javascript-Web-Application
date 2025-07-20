"use strict"

const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const base32 = require('thirty-two');
const TotpStrategy = require('passport-totp').Strategy;

function initAuthentication(app, daoUser) {

  passport.use(new LocalStrategy(
    function(username, password, done) {
      daoUser.getUser(username, password).then((user) => {     
        return done(null, user);
      }).catch((x)=>{
          console.log("Error passport password access:",x)
          return done(null, false, { error: x });
      })
    }
  ));

  passport.use(new TotpStrategy(
    function(user, done) {
      return done(null, base32.decode(user.secret), 30); 
    }
  ));

  passport.serializeUser((user, done) => {
      done(null, user.id); // Salva solo l’ID nella sessione
  });
  
  passport.deserializeUser((id, done) => {
    daoUser.getUserById(id)
      .then(user => done(null, user))
      .catch(err => done(err, null));
  });

  app.use(session({
    secret: '5539d00edb8ff725df3e82118a3c1ce7',
    resave: false,
    saveUninitialized: false
  }));

  // Init passport
  app.use(passport.initialize());
  app.use(passport.session());
}

const isLoggedIn = (req, res, next) => {

  if(req.isAuthenticated()){
      if (!req.user)
          return res.status(401).json({error:'Error association user - session'});
      else 
          return next();
  
  }

  return res.status(401).json({error:'Not authenticated'});
}

const commentLogin = (req, res, next) => {

  // we check if it's authenticated or not.
  // If it's not, we push the comment as Anonymous
  if(req.isAuthenticated()){
      if (!req.user){
          return res.status(401).json({error:'Error association user - session'});
      }else{
          req.author=req.user.id
          return next();
      }
  }

  // If it's anonymous:
  req.author=-1

  return next();
}

module.exports = { initAuthentication, isLoggedIn,commentLogin };