var http = require("http");

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
    console.log(request);
    
  response.write("It's alive!");
  response.end();
}).listen(3000);
