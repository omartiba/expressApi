var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require('./users.js').User;
var Entry = require('./entries.js').Entry;
var validPassword = require('./users.js').validPassword;

passport.use(new LocalStrategy(
  function(username, password, done){ 
    //console.log(username)
    //console.log(password)
    User.findOne({email: username }, function(err, user){
      //console.log(user)
      if(err) { return done(err); }
      if(!user) { return done(null, false); }
      if(!validPassword(password, user.salt, user.password)){ return done(null, false); }
      return done(null, user);
    }
   )
 }));

var checkAuthLocal = passport.authenticate('local', { failureRedirect: '/', session: true });

/* GET home page. */
router.get('/', function(req, res, next) {
    var name;
   // console.log(req.user)
  if(req.user){
    var name = req.user.email;
  }
  res.render('index', { title: 'MyJournal - Data Collection Device', name: name });
});

router.get('/about', function(req, res, next){
  res.render('about', { title: 'About MyJournal'});
});

router.post('/login', checkAuthLocal, function(req, res, next){
  console.log("Current logged in user")
  console.log(req.user)
  res.redirect('/');
});

router.get('/addUser', function(req, res){
  //console.log(req.user.admin)
  if(req.user.admin){
	res.render('addUser');
  } else {
	res.render('index');
  }
});

router.get('/logout', function(req, res){
  req.logout();

  res.redirect('/'); 
});

router.get('/journal', async function(req, res){
	if(!req.isAuthenticated()){
		res.redirect('/');
	} else {
    console.log("inside the journal get index")
    console.log(req.user)
		var entries = await Entry.find({ userId : req.user._id });
		res.render('journal', { entries : entries } );
	}
});

router.get('/journal/:entryId/edit', async function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('journal');
  }
  else{
    var entry = await Entry.findOne({
      userId : req.user._id,
      _id : req.params.entryId
    });
    console.log("In index journal get")
    console.log(entry)
    res.render('edit', {entry: entry});
  }
});

router.get('/myAccount', async function(req, res){
  if(req.user.admin){
    var allUsers = await User.find({})
    res.render('admin', {allUsers, allUsers});
  }
  else{
    res.render('myAccount');
  }
});

router.get('/myAccount/:userId/edit', async function(req, res){
  if(!req.isAuthenticated()){
    res.redirect('/');
  }
  else{
    console.log("params")
    console.log(req.params)
    var currentUser = await User.findById({
      _id : req.params.userId
    });
    console.log("User being passed")
    console.log(currentUser)
    res.render('changePassword', {currentUser: currentUser});
  }
});

module.exports = router;
