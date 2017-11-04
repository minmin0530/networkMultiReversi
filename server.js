var fs = require("fs");
var server = require("http").createServer(function(req, res) {
  res.writeHead(200, {"Content-Type":"text/html"});
  var output = fs.readFileSync("./index.html", "utf-8");
  res.end(output);
}).listen(8080);
var io = require("socket.io").listen(server);
var Main = require("./main");
var main = new Main();
main.io_sockets(io);