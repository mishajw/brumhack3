var express = require('express'),
    path = require('path'),
    multer = require('multer'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    crawler = require("simplecrawler").Crawler,
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
      return commonResultHandler(err, ai, res, "Your Files", urls);
    });

});

app.post('/domain', function(req, res) {
  var url, msg;
	
	if (req.body.domain) {
		url = req.body.domain;
		msg = url;
	} else if (req.body.hashtag) {
		url = "https://twitter.com/hashtag/" + req.body.hashtag + "?f=images";
		msg = "#" + req.body.hashtag;
	} else {
		console.log("Not posting domain properly.");
		return;
	}
	
  crawl(url, function(pics,myCrawler) {
    myCrawler.stop();
		pics = pics.slice(0, 20);
    urls = pics.filter(function(elem, pos,arr) {
      return arr.indexOf(elem) == pos;
    });
		
    console.log("Callback");
    console.log(pics);
    console.log(urls);
    clarifai.tagURL( urls, urls, function(err, ai){
      return commonResultHandler(err, ai, res, msg, urls);
    });
  });
});

app.get("/error", function(req, res) {
	var filePath = "public/results.html";
		fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
			if(!err){
				stuff = data.replace("JSONDATA", JSON.stringify({msg: "You messed up.", data: null, urls: null}));
				res.writeHead(200, {'Content-Type' : 'text/html'});
				res.write(stuff);
				res.end();
			} else {
				console.log(err);
			}
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

function commonResultHandler( err, res, jacksvar, msg, urls) {
	if( err != null ) {
		if( typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
			console.log("TAG request timed out");
			console.log(err);
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
			console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");		
			console.log(err);
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
    jacksvar.writeHead(301, {"location" : "/error"});
    jacksvar.end();
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
				console.log(res.results);
				// the request completed successfully
				for( i = 0; i < res.results.length; i++ ) {
					if( res["results"][i]["status_code"] === "OK" ) {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id +
							' tags='+res["results"][i].result["tag"]["classes"] )
            for( j = 0; j < res.results[i].result.tag.classes.length; j++){
              name = res.results[i].result.tag.classes[j];
							var value = res.results[i].result.tag.probs[j];
              if (name in dict) {
                dict[name] += value;
              } else {
                dict[name] = value;
              }
            }
					}
					else {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id + 
							' status_code='+res.results[i].status_code +
							' error = '+res.results[i]["result"]["error"])
					}
				}

        console.log(dict);
        var returns = JSON.stringify({ msg: msg, data: dict, urls: urls});
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

function crawl(url, f) {
  console.log(url);
  console.log("starting crawler");
  
	var protoSplit = url.split("://");
	
	var proto, domain, path, location;
	
	if (protoSplit.length == 2) {
		proto = protoSplit[0];
		location = protoSplit[1];
	} else {
		proto = "http";
		location = url;
	}
	
	console.log(proto);
	console.log(location);
	
	domain = location.split("/")[0];
	console.log(domain);
	path = location.substr(domain.length, location.length);
	console.log(path);
	
  var myCrawler = new crawler(domain, path);
  
  myCrawler.initialProtocol = proto;

  myCrawler.interval = 25;
  myCrawler.maxConcurrency = 3;
  var pics = [];

  myCrawler.maxDepth = domain == "twitter.com" || domain == "www.twitter.com" ? 3 : 3;
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
							
							if (img.indexOf(".jpg") == -1 && img.indexOf(".png") == -1) {
								return;
							}
							
							
              if(img.substring(0,2) == "//"){
                img = myCrawler.initialProtocol + ":" + img;
              }
              if(img.substring(0,1) == "/"){
                img = myCrawler.initialProtocol + "://" + domain + img;
              }
							if (img.split("/")[0].indexOf(".") == -1 && img.split("/")[0].indexOf(":") == -1) {
								img = myCrawler.initialProtocol + "://" + domain + "/" + img;
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
