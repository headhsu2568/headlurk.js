var fibers = require('fibers');
var current = null;
var oauth = require('oauth');
var http = require('http');
var querystring = require('querystring');
var plurks = (typeof process.env.plurks === 'undefined') ? require('./plurks.json') : process.env.plurks;
var config = require('./config.json');
var consumerKey = config.consumerKey;
var consumerSecret = config.consumerSecret;
var token = '';
var tokenSecret = '';
var loginToken = '';
var loginCookie = '';
var accessToken = '';
var accessTokenSecret = '';
var verifier = '';
var limitTo = [];

function getRequestToken() {
    O.getOAuthRequestToken(requestTokenCallback);
    fibers.yield();
    console.log('Token: ' + token);
    console.log('Token Secret: ' + tokenSecret);
}
function requestTokenCallback(error, t, ts, result) {
    if(error) {
        console.log(error);
    }
    else {
        token = t;
        tokenSecret = ts;
        current.run();
    }
}
function getLoginToken() {
    var opt = {
        hostname: 'www.plurk.com', 
        path: '/Users/showLogin'
    };
    http.request(opt, loginTokenCallback).end();
    fibers.yield();
    console.log('Login Token: ' + loginToken);
}
function loginTokenCallback (response) {
    var result = '';
    response.on('data', function(chunk) {
            result += chunk;
            });
    response.on('end', function() {
            var match = result.match(/login_token"\s*value\s*=\s*"(\S*)"/);
            loginToken = match[1];
            current.run();
            });
}
function login() {
    var postdata = querystring.stringify({
            'nick_name': config.username, 
            'password': config.password, 
            'login_token': loginToken, 
            'logintoken': '1', 
            'submit': '登入'
            });
    var opt = {
        hostname: 'www.plurk.com', 
        path: '/Users/login', 
        method: 'POST', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Content-Length': postdata.length
        }
    };
    var req = http.request(opt, loginCallback);
    req.write(postdata);
    req.end();
    fibers.yield();
    console.log('Login Cookie: ' + loginCookie);
}
function loginCallback (response) {
    var result = '';
    response.on('data', function(chunk) {
            result += chunk;
            });
    response.on('end', function() {
            loginCookie = response.headers['set-cookie'][0];
            current.run();
            });
}
function authorize() {
    var postdata = querystring.stringify({
            'oauth_token': token, 
            'accept': '1', 
            'deviceid': ''
            });
    var opt = {
        hostname: 'www.plurk.com', 
        path: '/OAuth/authorizeDone',  
        method: 'POST', 
        headers: {
            'Cookie': loginCookie, 
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Content-Length': postdata.length
        }
    };
    var req = http.request(opt, authorizeCallback);
    req.write(postdata);
    req.end();
    fibers.yield();
    console.log('Verifier: ' + verifier);
}
function authorizeCallback (response) {
    var result = '';
    response.on('data', function(chunk) {
            result += chunk;
            });
    response.on('end', function() {
            var match = result.match(/oauth_verifier"\D*(\d*)/);
            verifier = match[1];
            current.run();
            });
}
function getAccessToken() {
    O.getOAuthAccessToken(token, tokenSecret, verifier, accessTokenCallback);
    fibers.yield();
    console.log('Access Token: ' + accessToken);
    console.log('Access Token Secret: ' + accessTokenSecret);
}
function accessTokenCallback(error, at, ats, result) {
    if(error) {
        console.log(error);
    }
    else {
        accessToken = at;
        accessTokenSecret = ats;
        current.run();
    }
}

function plurk(p) {
    for(var i in p.cliques) {
        getLimitTo(p.cliques[i], null);
    }
    for(var i in p.friends) {
        getLimitTo(null, p.friends[i]);
    }
    plurkAdd(p.content, p.qualifier, p.fb);
}

function getLimitTo(clique, friend) {
    if(clique) {
        var path = 'http://www.plurk.com/APP/Cliques/getClique';
        var param = {
            'clique_name': clique
        };
    }
    else if(friend) {
    }
    O.post(path, accessToken, accessTokenSecret, param, 'application/json', getLimitToCallback);
    fibers.yield();
    console.log('Limit To: ' + limitTo.toString());
}
function getLimitToCallback(error, data, res) {
    var list = JSON.parse(data);
    for(var i in list) {
        limitTo.push(list[i].id);
    }
    current.run();
}

function plurkAdd(content, qualifier, fb) {
    if(fb != 1) content = '!fb ' + content;
    qualifier = (qualifier) ? qualifier : 'says';
    var lang = 'tr_cn';
    var limitToStr = '[' + limitTo.toString() + ']';
    var path = 'http://www.plurk.com/APP/Timeline/plurkAdd';
    var param = {
        'content': content, 
        'qualifier': qualifier, 
        'lang': lang, 
        'limited_to': limitToStr
    };
    console.log(param);
    O.post(path, accessToken, accessTokenSecret, param, 'application/json', plurkAddCallback);
    fibers.yield();
}
function plurkAddCallback(error, data, res) {
    console.log(data);
}

fibers(function() {
        current = fibers.current;
        O = new oauth.OAuth('http://www.plurk.com/OAuth/request_token', 'http://www.plurk.com/OAuth/access_token', consumerKey, consumerSecret, '1.0', null, 'HMAC-SHA1');
        getRequestToken();
        getLoginToken();
        login();
        authorize();
        getAccessToken();
        for(var i in plurks) plurk(plurks[i]);
}).run();
