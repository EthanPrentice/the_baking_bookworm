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

module.exports = class BookReview {

  constructor(contentStr) {
    this.type         = 'BOOK_REVIEW'

    this.html         = ''            // REQUIRED
    this.image        = ''            // REQUIRED
    this.author       = ''            // REQUIRED
    this.genres       = []            // REQUIRED
    this.desc         = ''            // OPTIONAL - Improve scraping and change to required

    this.type         = ''            // OPTIONAL
    this.pages        = 0             // OPTIONAL
    this.source       = ''            // OPTIONAL
    this.publisher    = ''            // OPTIONAL
    this.publishDate  = ''            // OPTIONAL

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

    // Get author from HTML
    let author = decodedContent.match(/(?<=(<u>[\s]*Author[\s]*<\/u>: ))[^<]*/)
    if (author != null) this.author = author[0]
    else {
      error = true
      errors.push("No author name could be found!")
    }

    // Get genres from HTML
    let genres = decodedContent.match(/(?<=(<u>[\s]*Genre[\s]*<\/u>: ))[^<]*/)
    if (genres != null) {
      genres = genres[0].replace(/\./g, '')
      let genreList = genres.split(/[/,]/)
      for (let j in genreList) genreList[j] = genreList[j].trim()
      this.genres = genreList
    }
    else {
      error = true
      errors.push("No genres could be found!")
    }

    // TODO: improve this
    let desc = decodedContent.match(/(?<=(<u>[\s]*My Review[\s]*<\/u><\/b>: )).*?(?=(<br \/>))/)
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


    /*
     * OPTIONAL INFORMATION
     */

    let optionals = [
      { property: 'type',        searchFor: 'Type' },
      { property: 'pages',       searchFor: 'Pages' },
      { property: 'source',      searchFor: 'Source' },
      { property: 'publisher',   searchFor: 'Publisher' },
      { property: 'publishDate', searchFor: 'First Published' },
    ]

    // search for and load optional info
    for (let i in optionals) {
      let regEx = RegExp(`(?<=(<u>[\\s]*${optionals[i].searchFor}[\\s]*<\\/u>: ))[^<]*`, '')
      let info = regEx.exec(decodedContent)
      if (info != null) this[optionals[i].property] = info[0]
    }

  }

}
