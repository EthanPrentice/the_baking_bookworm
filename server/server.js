const https = require('https')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const hbs = require('express-handlebars')
const url = require('url')
const app = express()
const fs = require('fs')
const sanitizeHtml = require('sanitize-html')
const mongoose = require('mongoose')

const Post = require('./resources/models/post')

var MongoClient = require('mongodb').MongoClient;
var mongoURL = "mongodb://localhost:27017/";

const sanitization = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'u', 'b', 'i' ]),
  allowedAttributes: {
    '*': [ 'href', 'class', 'id', 'center', 'align' ],
    'img': [ 'src', 'border' ]
  }
}

const PORT = process.env.PORT || 3000
const ROOT_DIR = ''; //root directory for static pages


mongoose.connect('mongodb://localhost/the_baking_bookworm');


// Engine (Handlebars)
const VIEWS_DIR = "resources/views"
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: VIEWS_DIR }))
app.set('views', path.join(__dirname, VIEWS_DIR))
app.set('view engine', 'hbs')


// Middleware (Express)
app.use( logger('dev') )
app.use(function(req, res, next){
  console.log('-------------------------------')
  console.log('req.path: ', req.path)
  console.log('serving:' + __dirname + ROOT_DIR + req.path)
  next(); //allow next route or middleware to run
})

app.use(express.static(__dirname + ROOT_DIR)) // provide static server


// Start server
app.listen(PORT, err => {
  if (err) console.log(err)
  else console.log(`Server listening at: localhost:${PORT}`)
})

// Query functions
let parseQuery = function(queryString) {
  var parsed = {}
  if (queryString == null) return parsed

  var params = queryString.split('&')

  // console.log("Parsing query '" + queryString + "':")
  for (param of params) {
    let split = param.split('=')
    parsed[split[0]] = split[1]
    console.log("  " + split[0] + " -> " + split[1])
  }
  // console.log("Finished parsing.")
  return parsed
}

// Render page on all linkes provided in requirements
const renderHome = function(req, res, next) {
  let requestURL = req.url
  let query = parseQuery( url.parse(requestURL).query )

  let renderObj = {
    posts: recentPosts
  }

  console.log(renderObj)

  res.render('index', renderObj)
}

const renderTest = function(req, res, next) {
  Post.getPostsByDateDescending(1, function(err, data) {
    if (err) {
      console.log(err)
      throw err
    }
    console.log(data)
    res.render('post', recentPosts)
  })
}

app.get('/?', renderHome)

app.get('/test/?', renderTest)

//TODO: just for testing, remove on prod
app.get("/refreshPosts/?", refreshData);

app.get("/recipes/?")

// if no get requests found, error 404
app.use(function(req, res, next){
  res.render('error_404', {  })
})


function refreshData(req, res, next) {
  updateRecentPosts()
  res.redirect("/", 302)
}

let recentPosts = {}
function updateRecentPosts() {
  Post.getPostsByDateDescending(8, function(err, result) {
    if (err) throw err;
    recentPosts = result
  })
}

// set intervals
updateRecentPosts()
setInterval(updateRecentPosts, 60*60*1000) // update recent posts every hour
