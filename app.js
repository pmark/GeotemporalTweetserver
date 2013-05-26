var express = require("express");
var app = express();
app.use(express.logger());

console.log("STARTING TEST NODE")

app.get('/', function(request, response) {
	console.log("GET!!!")
	response.send('Hello World!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
  console.log("done STARTING TEST NODE")

});