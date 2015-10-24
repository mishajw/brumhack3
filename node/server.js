var express = require('express'),
    path = require('path'),
    multer = require('multer'),
    bodyParser = require('body-parser'),
    app = express();


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

app.post('/upload', function (req, res) {
    var files = req.files.file;
    
    if (Array.isArray(files)) {
        // response with multiple files (old form may send multiple files)
        console.log("Got " + files.length + " files");
    } else {
        // dropzone will send multiple requests per default
        console.log("Got one file");
    }
    
    res.writeHead(302, {
      'Location': 'results.html'
      //add other headers here...
    });
    
    res.end();
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);
});
