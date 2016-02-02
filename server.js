// set up
var SERVER_PORT = process.env.PORT || 8080;
var MONGO_USER = 'Hyperion';
var MONGO_PASSWORD = 'darktemplar0';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var MONGO_URI = 'mongodb://'+MONGO_USER+':'+MONGO_PASSWORD+'@ds037195.mongolab.com:37195/kalayaan';
console.log(MONGO_URI);
var MONGOOSE_URI = uriUtil.formatMongoose(MONGO_URI);
console.log(MONGOOSE_URI);

//config
mongoose.connect(MONGOOSE_URI, function(error){
  if (error) console.error("error: "+error);
  else console.log('mongo connected');
});
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());

//define model
var Todo = mongoose.model('newTodo',{
  'message' : String,
  'title': String,
  'progress': Number,
  'todo_type': String,
  'date_started': {type: Date, default: Date.now},
  'date_finished': Date
});

//routes
app.get('/api/todos', function(req,res){
  Todo.find(function(err, todos){
    if(err) 
      res.send(err);

    res.json(todos);
  });

});

app.post('/api/todos', function(req,res){
  console.log('Posting data: '+ req.body.title);
  Todo.create({
    'message': req.body.message,
    'title': req.body.title,
    'progress':0  ,
    'todo_type': req.body.todo_type,
    done: false
  }, function(err, todo){
      console.log(err);
      if(err)
        res.send(err);

      Todo.find(function(err, todos){
        if(err)
          res.send(err);

        res.json(todos);
      });
  });
});

app.put('/api/todos/update/:_id', function(req,res){
  console.log('Updating data: '+ req.body.title);
  var date_finished = null;
  if(req.body.progress=="100" && 
        (req.body.date_finished != null && req.body.date_finished == "")){
    console.log("Task recorded as finished!: "+req.body.title);
    date_finished = new Date();
  }
  else if((req.body.date_finished != null && req.body.date_finished != "")){
    date_finished = Date.parse(req.body.date_finished);
  }
  Todo.update(
    {_id:req.body._id},
      
    {
      $set:
      {
        'message': req.body.message,
        'title': req.body.title,
        'progress': req.body.progress,
        'date_finished': date_finished
      }
    }, 
    {},
    function(err, todo){
      console.log(err);
      if(err)
        res.send(err);

      Todo.find(function(err, todos){
        if(err)
          res.send(err);

        res.json(todos);
      });
  });
});


app.delete('/api/todos/:todo_id', function(req,res){
  Todo.remove({
    _id: req.params.todo_id
  }, function(err, todo){
      if(err)
        res.send(err)

      Todo.find(function(err, todos){
        if(err)
          res.send(err)

        res.json(todos);
      });
  });
});

app.put('/api/todos/delete/multiple', function(req,res){
  console.log(req);
  Todo.remove({
    _id: {$in : req.body._ids}
  }, function(err, todo){
    console.log("delete logs:")
      console.log(err);
      
      if(err)
        res.send(err)

      Todo.find(function(err, todos){
        if(err)
          res.send(err)
        res.json(todos);
      });
  });
});

app.get('*', function(req, res){
  res.sendfile('./public/core.html');
});


// listen on server port; start server
app.listen(SERVER_PORT);
console.log("App listening on port "+ SERVER_PORT);
