var express = require('express');
var multer = require('multer');
var upload = multer({ dest: "uploads/" });
var app = express();


// app.use(multer());
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/misha', function (req, res) {
  res.send('Hello Misha!');
});

app.post('/upload', upload.single("file"), function (req, res) {
  console.log(req.files);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
