/*
 * Used in the Post model
 * Pretty much just a subtype of a Post
 *
 */
 const sanitizeHtml = require('sanitize-html')

 const sanitization = {
   allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'u', 'b', 'i' ]),
   allowedAttributes: {
     '*': [ 'href', 'class', 'id', 'center', 'align' ],
     'img': [ 'src', 'border' ]
   }
 }

module.exports = class Recipe {

  constructor(contentStr) {
    this.type         = 'RECIPE'
    this.html         = ''            // REQUIRED
    this.image        = ''            // REQUIRED
    this.desc         = ''            // OPTIONAL - Improve scraping and change to required

    let error = false
    let errors = []

    let decodedContent = decodeURIComponent(contentStr)
    this.html = sanitizeHtml(decodedContent, sanitization)

    /*
     * REQUIRED INFORMATION
     */

    // Get image from HTML
    let img = decodedContent.match(/(?<=(<img border="0" [^>]*src="))[^"]*/)
    if (img != null) this.image = img[0]
    else {
      error = true
      errors.push("No image element could be found!")
    }

    // TODO: improve this
    let desc = decodedContent.match(/<span.*?<\/span>/)
    if (desc != null) {
      this.desc = sanitizeHtml(desc[0], sanitization)
    }
    else {
      //error = true
      errors.push("No description could be found!")
    }

    // Handle errors
    if (error) {
      for (var i in this) {
        delete this[i]
      }
      this.error = true
      this.errors = errors
      return
    }

  }

}
