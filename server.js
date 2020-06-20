const express = require("express");
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser'); 
const methodOverride  =  require('method-override');
const redis = require('redis');

// @ Redis DB Config & Connect  
const redisDBhost = require('./config/keys').redisHost;
const redisDBport = require('./config/keys').redisPort;

var redisClient = redis.createClient({redisDBhost, redisDBport});
redisClient.on("error", async()=>{
    console.log(error);
});
redisClient.on("connect", async()=>{
    console.log("Redis Connected .. ..!!")
});

const app = express();
const PORT = process.env.PORT || 7800;

// @ Config View Engine 0
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// @ Body Parser middleware config 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// @ Method override middleware config 
app.use(methodOverride('_method'));

//   @ Home Route for search page
app.get('/', (req,res)=>{
   res.render('searchuser');
});

// @ Serach processing Route
app.post('/user/search', (req, res, next)=>{
 let id =  req.body.id;

 redisClient.hgetall(id, (err, obj)=>{
   if(!obj){
        res.render('searchuser', {
              error: 'User does not exist'
        });
   } else {
         obj.id = id ;
         res.render('details', {
         user: obj
         })
   }
 })
});

// @ Add User Routes :
app.get('/user/add', (req, res, next)=>{
    res.render('adduser');
});

app.post('/user/add', (req, res, next)=>{
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
 
  redisClient.hmset(id, [
      'first_name', first_name,
      'last_name', last_name,
      'emai', email,
      'phone', phone
  ], (err, reply)=>{
        if (err){
            console.log(err);
        }
         console.log(reply);
         res.redirect('/')
  });
});

// Delete User
app.delete('/user/delete/:id', function(req, res, next){
    redisClient.del(req.params.id);
    res.redirect('/');
  });

app.listen(PORT, ()=>{
    console.log(`The server is on PORT ${PORT}`);
});

const locslURL =  () =>{
      
}