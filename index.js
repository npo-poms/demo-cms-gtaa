var path = require('path');
var appDir = path.dirname(require.main.filename);



const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'port', alias: 'P', type: Number, defaultValue: "3000"},
    //{ name: 'gtaaUIHost', alias: 'g', type: String, defaultValue: "https://rs-dev.poms.omroep.nl/v1" },
    { name: 'gtaaUIHost', alias: 'g', type: String, defaultValue: "http://localhost:8070/v1"},
    { name: 'signService', alias: 's', type: String, defaultValue: "http://localhost:3000/sign"},
];

const options = commandLineArgs(optionDefinitions);

console.log("Using these settings:\n", options);

var gtaaUIHost = options.gtaaUIHost;
var signService = options.signService;

const Keycloak = require('keycloak-connect');

var session = require('express-session');

var express = require('express');
var app = express();
app.enable('trust proxy');
app.use(express.static('public'));

var exphbs = require('express-handlebars');
var hbs = exphbs.create({ extname: '.hbs' });

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

//CORS
var cors = require('cors');
var uiURL = require('url').parse(gtaaUIHost);
var uiHost = uiURL.protocol + "//" + uiURL.host;
console.log("Allowing cors from ", uiHost);
var corsOptions = {
    "origin": uiHost,
    "credentials": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
};

app.options('*', cors(corsOptions));
//END CORS



// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.

var memoryStore = new session.MemoryStore();

app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

var keycloak = new Keycloak({
    store: memoryStore
});

app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/'
}));

var jwt = require('jsonwebtoken');

function sign(person, username) {
    var singed = jwt.sign(person, process.env.API_KEY, {
        algorithm: 'HS512',
        header: {
            'iss': 'demo-cms',
            'usr': username
        }
    });
    console.log(singed);
    return singed;
}

function createJWT(req) {
    var expires = Math.floor(Date.now()/1000) + (60 * (60*12));
    var token = jwt.sign({exp: expires}, process.env.API_KEY, {
        algorithm: 'HS512',
        header: {
            'usr': req.kauth.grant.access_token.content.preferred_username,
            'iss': 'demo-cms',
        },
    });
    console.log(token);
    return token;
}

var request = require('request');

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

// A normal un-protected public URL.

app.get('/', keycloak.protect(), function (req, res) {
    res.render('index',
        {
            layout: false,
            gtaaUIHost: gtaaUIHost,
            signService: signService,
            jwtStr: createJWT(req)
        });
});

app.get('/sign', keycloak.protect(), function (req, res) { res.send('move along'); });

app.post('/sign', jsonParser, keycloak.protect(), cors(corsOptions), function (req, res) {
    console.log("singing received POST " + JSON.stringify(req.body, null, 2));
    res.status(200);
    res.send(sign(req.body, req.kauth.grant.access_token.content.preferred_username));
});


// Post json string on specific endpoint (/result)
app.post('/test', keycloak.protect(), function (req, res) {
    console.log("singing received POST " + JSON.stringify(req.body, null, 2));
    res.status(200);
});



var server = app.listen(options.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Demo CMS app listening at http://%s:%s', host, port);
})
