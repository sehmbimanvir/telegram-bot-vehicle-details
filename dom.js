const cheerio = require('cheerio')

/** DOM Crawler Class to Extract HTML Elements Data */
class DOMCrawler {
  crawler = null

  constructor (html) {
    this.crawler = cheerio.load(html)
  }

  get (query) {
    return this.crawler(query)
  }
}

module.exports = {DOMCrawler}