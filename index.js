/**
 * This script launches the KeystoneJS Docs website using express.
 */

var _ = require('lodash');
var errorHandler = require('errorhandler');
var express = require('express');
var favicon = require('serve-favicon');
var less = require('less-middleware');
var logger = require('morgan');

var content = require('./content');

function view(view, options) {
	return function(req, res, next) {
		options.pretty = true;
		options.prefix = (options.language === 'en') ? '/' : '/' + options.language + '/';
		_.extend(options, content.languages[options.language]);
		res.render(options.language + '/pages/' + view, options);
	}
}

var app = express();

app.set('port', process.env.PORT || 8080);
app.set('views', 'content');
app.set('view engine', 'jade');

app.use(favicon('public/favicon.ico'));
app.use(less('public'));
app.use(express.static('public'));

app.use(logger('dev'));

// disable cache, safari workaround
// see http://stackoverflow.com/questions/18811286/nodejs-express-cache-and-304-status-code
app.use(function(req, res, next) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	next();
});

// Set up locals and routes
app.locals.languages = content.languages;
app.locals.version = require('./package.json').version;

_.each(content.routes, function(options) {
	app.get(options.path, view(options.template, options));
});

app.use(function(req, res, next) {
	res.status(404).render('404');
});

app.use(errorHandler());

// Start server

app.listen(app.get('port'), function() {
  console.log('Keystone docs are available on port ' + app.get('port'));
});
