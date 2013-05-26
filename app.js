var fs = require("fs")

var config = { 
	"port": 5000,
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
	JSON.parse(fs.readFileSync(".tweetserverrc", "utf8"));	
}
else {
	console.log("Using twitter oauth config from environment variables.");
}

require("./lib/tweetserver/app")(config);
