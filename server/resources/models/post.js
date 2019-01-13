var mongoose   = require('mongoose');
const BookReview = require('./book_review')
const Recipe = require('./recipe')

var postSchema = mongoose.Schema({

  id:         { type: String, index: true },
  published:  { type: Date, index: true },
  updated:    { type: Date, index: true },

  url:        { type: String },
  selfLink:   { type: String },
  title:      { type: String },

  content:    { type: Object },
  author:     { type: Object },
  replies:    { type: Object },

  labels:     { type: [String] }

})

var Post = module.exports = mongoose.model('Post', postSchema)

module.exports.parseBlogPost = function(blogObj) {
  var publishedDate = new Date(blogObj.published.substring(0, 19) + 'Z')
  var updatedDate = new Date(blogObj.updated.substring(0, 19) + 'Z')

  var contentObj = new BookReview(blogObj.content)
  if (contentObj.error) {
    contentObj = new Recipe(blogObj.content)
  }
  if (contentObj.error) {
    console.log("ERROR - could not create post content for post with id " + blogObj.id + " and title " + blogObj.title)
  }

  var newPost = new Post({
    id:         blogObj.id,
    published:  publishedDate,
    updated:    updatedDate,

    url:        blogObj.url,
    selfLink:   blogObj.selfLink,
    title:      blogObj.title,

    content:    contentObj,
    author:     blogObj.author,
    replies:    blogObj.replies,

    labels:     blogObj.labels
  })

  return newPost

}

module.exports.getPostsByDateDescending = function(limit, callback) {
  Post.find({}).sort({ published: -1 }).limit(limit).exec(callback)
}

module.exports.getPostsByDateAscending = function(callback) {
  Post.find({}).sort({ published: 1 }).exec(callback)
}

module.exports.getMostRecent = function(callback) {
  Post.find({}).sort({ published: -1 }).limit(1).exec(callback)
}
