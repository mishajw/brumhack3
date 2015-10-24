var express = require('express');
var multer = require('multer');
var clarifai = require('./clarifai_node.js');
var upload = multer({ dest: "uploads/" });
var stdio = require('stdio');
var app = express();


clarifai.initAPI("uQeWKJLNIt1rz8NeDRHfUb6KNQZPlKenjb_xpafq", "1CUq98b72stAyNL262wsqIj5ICuaxIU4FY7sAH1d" );


tagMultipleURL(["https://dianakhayyat.files.wordpress.com/2011/05/animals_cats_small_cat_005241_.jpg"],["kitty"]);

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

/*var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});*/

// CLARIFAI

clarifai.setThrottleHandler( function( bThrottled, waitSeconds ) { 
	console.log( bThrottled ? ["throttled. service available again in",waitSeconds,"seconds"].join(' ') : "not throttled");
});

function commonResultHandler( err, res ) {
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

				// the request completed successfully
				for( i = 0; i < res.results.length; i++ ) {
					if( res["results"][i]["status_code"] === "OK" ) {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id +
							' tags='+res["results"][i].result["tag"]["classes"] )
					}
					else {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id + 
							' status_code='+res.results[i].status_code +
							' error = '+res.results[i]["result"]["error"] )
					}
				}
			}
	}
}

// exampleTagMultipleURL() shows how to request the tags for multiple images URLs
function tagMultipleURL(testImageURLs, ourIds) {
  clarifai.tagURL( testImageURLs , ourIds, commonResultHandler ); 
}

