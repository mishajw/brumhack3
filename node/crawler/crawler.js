var Crawler = require("simplecrawler");
var jsdom = require("jsdom");

function crawl(domain) {
	var myCrawler = new Crawler(domain);

	myCrawler.initialPath = "/";
	myCrawler.initialProtocol = "https";

	myCrawler.interval = 25;
	myCrawler.maxConcurrency = 5;
	
	var pics = [];

	myCrawler.maxDepth = 3;
	try{
	var x = myCrawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
		//console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
		//console.log("It was a resource of type %s", response.headers['content-type']);
		var html = responseBuffer.toString();
			jsdom.env(
				html,
			  ["http://code.jquery.com/jquery.js"],
			  function (err, window) {
				  var $ = window.$;
				var images = $("img").map(function ()
				{
					var img = this.src;
					if(img.substring(0,2) == "//")
					{
						img = myCrawler.initialProtocol + ":" + img;
					}
					if(img.substring(0,1) == "/")
					{
						img = myCrawler.initialProtocol + "://" + domain + img;
					}
					if(this.src != "x")
					{
						pics.push(img);
					}
				});
			  }
			);

		//console.log(imgs);

	});
	
	myCrawler.start();
	}
	catch (e)
	{
		console.log("lol you error'd");
	}
	setTimeout(function()
	{
		console.log(pics);
		myCrawler.stop();
	}, 10000);
	
	//myCrawler.stop();
}

crawl("google.co.uk");