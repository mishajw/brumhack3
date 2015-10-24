//<<<<<<< HEAD
var express = require('express'),
    path = require('path'),
    multer = require('multer'),
    bodyParser = require('body-parser'),
    app = express();
//=======
//var express = require('express');
//var multer = require('multer');
//var crypto = require('crypto');
//var path = require('path');
//
//var storage = multer.diskStorage({
//  destination: './uploads/',
//  filename: function (req, file, cb) {
//    crypto.pseudoRandomBytes(16, function (err, raw) {
//      if (err) return cb(err)
//
//      cb(null, raw.toString('hex') + path.extname(file.originalname))
//    })
//  }
//})
//
//var upload = multer({ storage: storage })
//
//
//var app = express();
//>>>>>>> 5662b284bb078a32f69c10c3fcbbdc8a685efa3f


app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: 'uploads'})); // dest is not necessary if you are happy with the default: /tmp
app.use(express.static(path.join(__dirname, 'bower_components')));

//// app.use(multer());
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/misha', function (req, res) {
  res.send('Hello Misha!');
});

//<<<<<<< HEAD
app.post('/upload', function (req, res) {
    var files = req.files.file;
    
    if (Array.isArray(files)) {
        // response with multiple files (old form may send multiple files)
        console.log("Got " + files.length + " files");
    } else {
        // dropzone will send multiple requests per default
        console.log("Got one file");
    }
    
    res.sendStatus(200);
//=======
//app.post('/upload', upload.single("file"), function (req, res) {
//  console.log(req.file);
//>>>>>>> 5662b284bb078a32f69c10c3fcbbdc8a685efa3f
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
