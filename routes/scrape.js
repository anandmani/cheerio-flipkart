var express = require('express');
var fs = require('fs')
var request = require('request')
var cheerio = require('cheerio')
var hma = require('hma-proxy-scraper')

var router = express.Router();

const languages = { "English": 1, "French": 1, "German": 1, "Spanish": 1, "Italian": 1, "Latin": 1, "Dutch": 1, "Russian": 1, "Hindi": 1, "Portuguese": 1, "Danish": 1, "Chinese": 1, "Swedish": 1, "Afrikaans": 1, "Polish": 1, "Marathi": 1, "Hungarian": 1, "Telugu": 1, "Hebrew": 1, "Bengali": 1, "Mandarin Chinese": 1, "Gujarati": 1, "Norwegian": 1, "Tamil": 1, "Czech": 1, "Multiple Languages": 1, "Arabic": 1, "Romanian": 1, "Japanese": 1, "Sanskrit": 1, "Catalan": 1, "Finnish": 1, "Icelandic": 1, "Urdu": 1, "Turkish": 1, "Welsh": 1, "Lithuanian": 1, "Ukrainian": 1, "Yiddish": 1, "Kannada": 1, "Persian": 1, "Malayalam": 1, "Slovenian": 1, "Scots": 1, "Slovak": 1, "Croatian": 1, "Serbian": 1, "Korean": 1, "Irish": 1, "Greek": 1, "Punjabi": 1, "Swahili": 1, "Bulgarian": 1, "Indonesian": 1, "Albanian": 1, "Vietnamese": 1, "Tibetan": 1, "Thai": 1, "Oriya": 1, "Nepali": 1, "Bhojpuri": 1, "Assamese": 1, "Maori": 1, "Egyptian": 1, "Scottish Gaelic": 1, "Somali": 1, "Burmese": 1, "Kurdish": 1, "Portugese": 1 }
const bindings = { "Paperback": 1, "Hardcover": 1, "Library Binding": 1, "Boxed Set": 1, "Audiobook": 1, "Board Book": 1, "Leather Bound": 1 }
// const ips = [
//   'http://159.203.112.118:3128',
//   'http://165.227.124.179:3128',
//   'http://50.17.166.167:3128',
//   'http://216.56.48.118:9000',
//   'http://45.79.149.212:3128',
//   'http://207.201.249.9:8080',
//   'http://209.163.160.253:8080',
//   'http://138.197.192.64:65000',
//   'http://208.59.142.52:65103',
//   'http://138.197.83.21:8080',
//   "http://139.59.69.30:3128", "http://103.250.144.42:8080", "http://139.59.77.126:3128", "http://118.151.209.203:8080", "http://27.124.52.113:8080", "http://139.59.118.0:8080", "http://45.115.174.202:8080", "http://103.240.100.106:8080", "http://202.62.82.74:8080", "http://103.24.127.197:8080"

// ]

const ips = ["http://139.59.69.30:3128", "http://103.250.144.42:8080", "http://139.59.77.126:3128", "http://118.151.209.203:8080", "http://27.124.52.113:8080", "http://139.59.118.0:8080", "http://45.115.174.202:8080", "http://103.240.100.106:8080", "http://202.62.82.74:8080", "http://103.24.127.197:8080"]

var pageNumber = 0
var prevPageUrl = ''

const screenshot = function (html, filename) {
  fs.writeFile(filename, html, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("Last Page saved!");
  });
}

const scrapePage = function (html, stream) {
  var nextPage = null
  var $ = cheerio.load(html)
  $('._2SxMvQ').filter(function () {
    var data = $(this)
    data.children().each(function () {
      var row = $(this)
      row.children().each(function () {
        var col = $(this)
        var title = col.children().first().children().filter((index) => index == 1).attr('title')
        // var img = col.children().first().children().first().children().first().children().first().children().first().children().first().attr('src')
        var meta = col.children().first().children().filter((index) => index == 2).text()
        meta = meta.split(',')
        meta = meta.map(item => item.trim())
        var authors = meta.filter(item => languages[item] !== 1 && bindings[item] !== 1)
        // console.log(JSON.stringify({ title, authors }))
        stream.write(JSON.stringify({ title, authors }) + "\n")
      })
    })
  })
  $('._2kUstJ').filter(function () {
    var data = $(this)
    nextPage = data.children().first().attr('href')
  })
  return nextPage
}

const requestCallback = function (stream, error, response, html) {
  var proxyIp = ips[Math.floor(Math.random() * 10)]
  if (pageNumber === 100000) {
    return
  }
  console.log("Scraping PageNumber", ++pageNumber, "proxy", proxyIp)
  if (!error) {
    const nextPage = scrapePage(html, stream)
    console.log("Next Page url: ", nextPage)
    if (nextPage) {
      const nextPageUrl = 'https://www.flipkart.com' + nextPage
      const options = {
        url: nextPageUrl,
        proxy: proxyIp
      }
      request(nextPageUrl, requestCallback.bind(null, stream))
      prevPageUrl = nextPageUrl
    }
    else {
      // stream.end()
      screenshot(html, "lastPage.html")
      console.log("-------------Error-------------")
      setTimeout(() => request(prevPageUrl, requestCallback.bind(null, stream)), 5000)
    }
  }
}


router.get('/', function (req, res, next) {
  pageNumber = 0
  var stream = fs.createWriteStream("books.txt");
  stream.once('open', function () {
    const options = {
      proxy: ips[0],
      url: 'https://www.flipkart.com/search?as=off&as-show=on&count=40&otracker=start&p%5B%5D=sort%3Drelevance&q=books&sid=bks'
    }
    request(options, requestCallback.bind(null, stream))
  });
  res.send('respond with a resource');
});


module.exports = router;


//https://www.flipkart.com/search?as=off&as-show=on&count=40&otracker=start&p%5B%5D=sort%3Drelevance&q=books&sid=bks
//https://www.flipkart.com/search?as=off&as-show=on&count=40&otracker=start&p%5B%5D=facets.latest_arrivals%255B%255D%3DLast%2B30%2BDays&p%5B%5D=facets.language%255B%255D%3DTamil&p%5B%5D=sort%3Drelevance&q=books&sid=bks