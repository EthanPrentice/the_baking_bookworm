const https    = require('https')
const path     = require('path')
const logger   = require('morgan')
const url      = require('url')
const mongoose = require('mongoose')

const Post       = require('./resources/models/post')
const BookReview = require('./resources/models/book_review')
const Recipe = require('./resources/models/recipe')

const BLOG_ID = '648528809470059310'
const API_KEY = 'YOUR_API_KEY'

const REPEAT = true;
const REPEAT_MS = 15*1000; // 15 minutes

mongoose.connect('mongodb://localhost/the_baking_bookworm', { useNewUrlParser: true });

function loadPosts() {
  https.get(`https://content.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}`, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      var jsonObj = JSON.parse(data)

      var reviews = []
      var posts = []

      Post.getMostRecent(function(err, result) {
        if (err) throw err

        var mostRecentPublishDate = false;
        if (result.length != 0)
          mostRecentPublishDate = result[0].published

        for (let i in jsonObj.items) {
          let post = Post.parseBlogPost(jsonObj.items[i])
          if (mostRecentPublishDate === false || mostRecentPublishDate < post.published) {
            post.save()
            posts.push(post)
            console.log(`[${timeStamp()}]  Added "${post.title}" (${post.id}) to the database!`)
          }
          else break
        }

        if (REPEAT) setTimeout(loadPosts, REPEAT_MS)
        else setTimeout(function() {
          console.log("Done! Press Ctrl C to exit!")
        }, 1000)

      })
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}


function timeStamp() {
  var d = new Date();
  var hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours()
  var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
  var sec = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()
  return `${hour}:${min}:${sec}`
}

function dateStamp() {
  var d = new Date();
  var date = d.getDate() < 10 ? "0" + d.getDate() : d.getDate()
  var month = d.getMonth()+1 < 10 ? "0" + (d.getMonth()+1) : d.getMonth()+1
  return `${date}/${month}/${d.getFullYear()}`
}


loadPosts()
