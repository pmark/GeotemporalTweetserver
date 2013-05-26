"use strict";

var fs = require("fs")

var config = { 
	"port": process.env.PORT || 5000,
    "auth": {
        "accessToken": process.env.TWITTER_OAUTH_ACCESS_TOKEN,
        "accessSecret": process.env.TWITTER_OAUTH_ACCESS_SECRET,
        "consumerKey": process.env.TWITTER_OAUTH_CONSUMER_KEY,
        "consumerSecret": process.env.TWITTER_OAUTH_CONSUMER_SECRET
    }
};

if (!config.auth.accessToken || !config.auth.accessSecret || !config.auth.consumerKey || !config.auth.consumerSecret) {
	// Try reading the config file
	console.log("Reading twitter oauth config from .tweetserverrc file.");
	config = JSON.parse(fs.readFileSync(".tweetserverrc", "utf8"));	
}
else {
	console.log("Using twitter oauth config from environment variables.");
}

/////////

var BASE_URL = "https://api.twitter.com/1.1",
    express = require("express"),
    allowed = require("./lib/tweetserver/api"),
    OAuth = require("oauth").OAuth,
    http = require("http"),
    qs = require("querystring"),
    rCallbackParam = /(^|&)callback=[^&]+/,
    accessToken = config.auth.accessToken,
    accessSecret = config.auth.accessSecret,
    app = express(),
    cache = {},
    oauth;

function request(req, res, url) {
    console.log("config", config);
    
    var query = qs.stringify(req.query).replace(rCallbackParam, ""),
        cached;
    url = BASE_URL + "/" + url + "?" + query;
    cached = cache[url];
    if (cached && +new Date() < cached.next) {
        res.jsonp(JSON.parse(cached.data));
    } else {
        oauth.get(url, accessToken, accessSecret, function (err, data, response) {
            var now = new Date(),
                headers = response.headers,
                remainingWindow = (headers["x-rate-limit-reset"] * 1000) - (+now),
                remainingLimit = headers["x-rate-limit-remaining"];
            cache[url] = {
                data: data,
                now: +now,
                next: +now.setSeconds(now.getSeconds() + (Math.ceil(remainingWindow / remainingLimit / 1000)))
            };
            res.jsonp(JSON.parse(data));
        });
    }
}

app.configure(function() {
    app.set("port", config.port || process.env.port || 5000);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

oauth = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    config.auth.consumerKey,
    config.auth.consumerSecret,
    "1.0A",
    null,
    "HMAC-SHA1",
    null,
    {
        Accept: "*/*",
        Connection: "close",
        "User-Agent": "node-tweetserver"
    }
);

app.get("/", function(req, res) {
    res.send("tweetserver");
});

/*
app.get("/:family/:method?", function (req, res) {
    var params = req.params,
        family = params.family,
        method = params.method;
    if (method) {
        request(req, res, family + "/" + method + ".json"); // There was a method, so construct URL including both family and method
    } else if (allowed.families.indexOf(family) > -1) {
        request(req, res, family + ".json"); // There was no method, so only use the family in the URL
    } else {
        res.send(404); // All requests that do not match an item in the `allowed` list will return a 404
    }
});
*/

console.log("process.env.PORT:", process.env.PORT);


http.createServer(app).listen(app.get("port"), function() {
    console.log("tweetserver is now listening on port " + app.get("port"));
});
