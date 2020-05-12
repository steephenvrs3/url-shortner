const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const app = express()

mongoose.connect('mongodb://localhost/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({
  extended: false
}))

app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find({}).exec();
  const chartArray = [];
  shortUrls.forEach((item) => {
    const pushObj = {
      name: item.full,
      data: item.hours,
    }
    chartArray.push(pushObj)
  })
  console.log(chartArray);
  res.render('index', {
    shortUrls: shortUrls,
    chartArray: chartArray
  })
})

app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({
    full: req.body.fullUrl
  })

  res.redirect('/')
})

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({
    short: req.params.shortUrl
  })
  if (shortUrl == null) return res.sendStatus(404)
  const dt = new Date();
  const hour = dt.getHours();
  await ShortUrl.findOneAndUpdate({
    _id: shortUrl._id
  }, {
    $set: {
      clicks: shortUrl.clicks + 1,
    },
    $addToSet: {
      hours: {
        hour: +hour,
        count: shortUrl.clicks + 1
      },
    }
  }).exec();

  res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);