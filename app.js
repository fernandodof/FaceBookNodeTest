var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//--------------fb
var FB = require('fb');


//Passport
var passport = require('passport');
var config = require('./configurations/config.js');
var facebookStratery = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');


//passport session setup
passport.serializeUser(function(user,done){
                        done(null,user);
});

passport.deserializeUser(function(obj,done){
                        done(null,obj);
});

console.log(config.facebook_api_key);
//passport Strategy - 
passport.use(new facebookStratery({
    clientID : config.facebook_api_key,
    clientSecret : config.facebook_api_secret,
    callbackURL : config.callback_url
    },
    function(accessToken, refreshToken, profile, done){
    //informa o fb o toke    
    fb.setAccessToken(accessToken);
        process.nextTick(function(){
            //Nesse momento podem verificar se o token jaxita no banco e retorna o profile ou criar um nove
            
            //como não estamo usando banco não fazemos nada
            return done(null, profile);          
    });
    }
));


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);



app.get('/auth/facebook', 
        passport.authenticate(
        'facebook', {scope: ['email', 'user_friends']}
));

app.get('/auth/facebook/callback', passport.authenticate(
    'facebook', {successRedirect : 'friends', faulureRedirect: '/'}),
    function(req,res){
        res.redirect('/');
});

app.get('/friends', function(req,res){
    FB.api('me/taggable_friends', function(response){
        if(!res || res.error){
            res.render('index', {title : 'Fail', friends : []});
            return;
        }
        res.send(response.data);
    })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
