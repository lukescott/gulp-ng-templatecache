"use strict";

var gutil = require("gulp-util");
var jsStringEscape = require("js-string-escape");
var map = require("map-stream");
var path = require("path");

var PUT_TPL = '$templateCache.put("<%= url %>", "<%= contents %>");';
var MODULE_TPL = 'angular.module("<%= name %>").run(function($templateCache) {\n<%= contents %>\n});';

function templateCachePut(options) {
	if (options === undefined) {
		options = {};
	}
	return map(function(file, callback) {
		if (path.extname(file.path) === ".html") {
			var template = options.template || PUT_TPL;
			file.contents = new Buffer(gutil.template(template, {
				url: file.relative,
				contents: jsStringEscape(file.contents),
				file: file
			}));
			file.path = gutil.replaceExtension(file.path, ".html.js");
		}
		callback(null, file);
	});
}

function templateCacheModule(options) {
	if (options === undefined) {
		options = {};
	}
	return map(function(file, callback) {
		if (path.extname(file.path) === ".js") {
			var template = options.template || MODULE_TPL;
			var name = options.name;
			switch (typeof name) {
			case "undefined":
				name = file.relative.split(path.sep).slice(0, -1).join(".");
				break;
			case "function":
				name = name(file);
				break;
			}
			if (options.namePrefix) {
				name = options.namePrefix + name;
			}
			file.contents = new Buffer(gutil.template(template, {
				name: name,
				contents: file.contents,
				file: file
			}));
		}
		callback(null, file);
	});
}

module.exports = {
	put: templateCachePut,
	module: templateCacheModule
};
