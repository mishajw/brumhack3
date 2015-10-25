var express = require('express'),
    path = require('path'),
    multer = require('multer'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    crawler = require("simplecrawler"),
    jsdom = require("jsdom"),
    app = express();

var clarifai = require('./clarifai_node.js');
var stdio = require('stdio');

clarifai.initAPI("uQeWKJLNIt1rz8NeDRHfUb6KNQZPlKenjb_xpafq", "1CUq98b72stAyNL262wsqIj5ICuaxIU4FY7sAH1d" );

//tagMultipleURL(["https://dianakhayyat.files.wordpress.com/2011/05/animals_cats_small_cat_005241_.jpg","http://4hdwall.com/wp-content/uploads/2012/05/cute-cat-wallpapers.jpg"],["kitty","cat"]);

app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: 'public/uploads'})); // dest is not necessary if you are happy with the default: /tmp
app.use(express.static(path.join(__dirname, 'bower_components')));
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
        files = [files];
    }
    console.log(files);
    var qualifier = "http://52.30.124.205:3000/uploads/"
    var urls = [];
    for(i = 0; i < files.length; i++){
      urls[i] = qualifier.concat(files[i].name);
      console.log(urls[i]);
    }
    clarifai.tagURL( urls, files, function(err, ai) {
      return commonResultHandler(err, ai, res);
    });

});

app.post('/domain', function(req, res) {
  var url = req.body.domain;
  crawl(url, function(pics, myCrawler) {
    urls = pics.filter(function(elem, pos,arr) {
      return arr.indexOf(elem) == pos;
    });
    myCrawler.stop();
    console.log("Callback");
    console.log(pics);
    console.log(urls);
    clarifai.tagURL( urls, urls, function(err, ai){
      return commonResultHandler(err, ai, res);
    });
  });
});
  crawl("google.com", function(pics,myCrawler) {
    myCrawler.stop();
    urls = pics.filter(function(elem, pos,arr) {
      return arr.indexOf(elem) == pos;
    });
    console.log("Callback");
    console.log(pics);
    console.log(urls);
    clarifai.tagURL( urls, urls, function(err, ai){
      return commonResultHandler(err, ai, res);
    });
  });

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);
});

// CLARIFAI

clarifai.setThrottleHandler( function( bThrottled, waitSeconds ) { 
	console.log( bThrottled ? ["throttled. service available again in",waitSeconds,"seconds"].join(' ') : "not throttled");
});

function commonResultHandler( err, res, jacksvar) {
	if( err != null ) {
		if( typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
			console.log("TAG request timed out");
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
			console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");				
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "TOKEN_FAILURE") {
			console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");				
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "ERROR_THROTTLED") {
			console.log("Clarifai host is throttling this application.");				
		}
		else {
			console.log("TAG request encountered an unexpected error: ");
			console.log(err);
		}
	}
	else {
			// if some images were successfully tagged and some encountered errors,
			// the status_code PARTIAL_ERROR is returned. In this case, we inspect the
			// status_code entry in each element of res["results"] to evaluate the individual
			// successes and errors. if res["status_code"] === "OK" then all images were 
			// successfully tagged.
			if( typeof res["status_code"] === "string" && 
				( res["status_code"] === "OK" || res["status_code"] === "PARTIAL_ERROR" )) {
        
        var dict = {};
				// the request completed successfully
				for( i = 0; i < res.results.length; i++ ) {
					if( res["results"][i]["status_code"] === "OK" ) {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id +
							' tags='+res["results"][i].result["tag"]["classes"] )
            for( j = 0; j < res.results[i].result.tag.classes.length; j++){
              name = res.results[i].result.tag.classes[j];
              if (name in dict) {
                dict[name]++;
              } else {
                dict[name] = 1;
              }
            }
					}
					else {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id + 
							' status_code='+res.results[i].status_code +
							' error = '+res.results[i]["result"]["error"] )
					}
				}

        console.log(dict);
        var returns = JSON.stringify(dict);
        /*jacksvar.write(returns);
        jacksvar.end();*/
        var filePath = "public/results.html";
        fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
          if(!err){
            stuff = data.replace("JSONDATA", returns);
            jacksvar.writeHead(200, {'Content-Type' : 'text/html'});
            jacksvar.write(stuff);
            jacksvar.end();
          } else {
            console.log(err);
          }
        });
			}
	}
}

// exampleTagMultipleURL() shows how to request the tags for multiple images URLs
function tagMultipleURL(testImageURLs, ourIds) {
  clarifai.tagURL( testImageURLs , ourIds, commonResultHandler );
}

// Crawler

function crawl(domain, f) {
  console.log(domain);
  console.log("starting crawler");
  
  var myCrawler = new crawler(domain);
  
  myCrawler.initialPath = "/";
  myCrawler.initialProtocol = "https";

  myCrawler.interval = 25;
  myCrawler.maxConcurrency = 5;

  var pics = [];

  myCrawler.maxDepth = 3;
  try{
    var x = myCrawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
      console.log("fetch complete");
      
      var html = responseBuffer.toString();
      jsdom.env(
          html,
          ["http://code.jquery.com/jquery.js"],
          function (err, window) {
            console.log("Parsed html");
            var $ = window.$;
            var images = $("img").map(function (){
              var img = this.src;
              if(img.substring(0,2) == "//"){
                img = myCrawler.initialProtocol + ":" + img;
              }
              if(img.substring(0,1) == "/"){
                img = myCrawler.initialProtocol + "://" + domain + img;
              }
              if(this.src != "x"){
                console.log("image");
                pics.push(img);
              }
            });
          });
        });
      console.log("about to start");
      myCrawler.start();
    }
    catch (e) {
      console.log("Sensible error message");
    }
   setTimeout(function() {
     f(pics, myCrawler);
   }, 10000);
}


