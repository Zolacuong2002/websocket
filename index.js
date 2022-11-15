const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
const mongoose = require('mongoose')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
const {engine} = require('express-handlebars')
const bcrypt = require('bcrypt');
const saltRound = 10;
const User = require('./models/user.js')
var Account = require('./models/account.js');


app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: "main"
}));
// view engine setup
app.set('view engine', 'hbs')
// set path to views folder
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')));

// establish server websocket to open connect 
const wss = new WebSocket.Server({ server:server});

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    const msg = message.toString().substring(1)
    const uid = message.toString().charAt(0) 
    // save to mongoDB
    const user = new User({
      uid: uid == 1 ? true : false,
      msg: msg
    })
    user.save()
    
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
    
  });
});

// connect to database cloud
const url = 'mongodb+srv://chatting:Zolacuong1@websocket.5bvaxdc.mongodb.net/chat-onl?retryWrites=true&w=majority'

async function connect(){
    try{
        await mongoose.connect(url)
        console.log('connected to MongoDB')
    }catch(error){
        console.error(error)
    }
}
connect()

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require("express-session")({saveUninitialized: true, resave: true, secret: "abc123"}))
app.use((req, res, next)=>{
  res.locals.flash = req.session.flash || '';
  delete req.session.flash
  next();
})

app.get('/', (req, res) => {
  // check sign in before go to home page
  if(!req.session.user){
    return res.redirect("/login")
  }
   return res.render('index', {title : 'Web Chatting | Together', username: req.session.user});
})

app.get('/register', (req, res) => {
   return res.render('register', {title : 'Sign up | Together'});
})

app.post('/register', function(req, res, next) {
  bcrypt.hash(req.body.password, saltRound).then(function(hash){
    let acc = new Account({
      firstname : req.body.firstname,
      lastname:req.body.lastname,
      email : req.body.email,
      password : hash
    })
  acc.save((err, account) =>{
    if(err){
      return res.render('register', {err})
    }
    req.session.flash = {
      type: 'success',
      msg : 'Sign up successful'  
    }
    res.redirect("/login")
  })
  })
});

app.get('/login', (req, res) => {
  // User.remove({}, (error, data) =>{
  //   if(!error)
  //     return res.send('Hello World!')
  //   return res.send('fail')
  // })
  if(req.session.user){
    return res.redirect("/")
  }
   return res.render('login', {title : 'Log in | Together'});
})

app.post('/login', function(req, res, next){
  email = req.body.email
  pass = req.body.password
  Account.findOne({email : email}, (error, account)=>{
    if(error || !account){
      req.session.flash = {
        type: 'danger',
        msg: 'Email is not exist'
      }
      return res.redirect("/login")
    }
    bcrypt.compare(pass, account.password).then(function(result){
      if(result){
        req.session.user = account.firstname + account.lastname
        return res.redirect('/')
      }
      req.session.flash = {
        type: 'danger',
        msg : 'Email or password wrong'
      }
      return res.redirect("/login")
    })
  })
})

app.get('/logout', (req, res) => {
  delete req.session.user;
  return res.redirect('/login');
})

app.get('/user1', (req, res) => {
   // check sign in before go to home page
   if(!req.session.user){
    return res.redirect("/login")
  }
  User.find({}).lean()
  .exec(function(error, data){
  if(!error)
      return res.render('user1', {users: data, title: 'User 1'})
    return res.send('fail')
  })
})
app.get('/user2', (req, res) => {
   // check sign in before go to home page
   if(!req.session.user){
    return res.redirect("/login")
  }
  User.find({}).lean()
  .exec(function(error, data){
  if(!error)
      return res.render('user2', {users: data, title: 'User 2'})
    return res.send('fail')
  })
})

server.listen(3000, () => console.log(`Lisening on port :3000`))