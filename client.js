'use strict';

var hoxy = require( 'hoxy' );
var portfinder = require( 'portfinder' );
var localtunnel = require( 'localtunnel' );

function escapeRegExp(str) {
  return str.replace( /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&' );
}

module.exports = function( powapp, opt, fn ) {
	if( typeof opt === 'function' ) {
		fn = opt;
		opt = {};
	}

	opt = opt || {};

	portfinder.getPort( function( error, port ) {
		if( error ) {
			return error;
		}

		var powServer = 'http://' + powapp + '.dev';

		var proxy = new hoxy.Proxy({
			reverse: powServer
		}).listen( port );

		localtunnel( port, {
			subdomain: powapp
		}, function( err, tunnel ) {
			proxy.intercept({
				phase: 'response',
				mimeType: 'text/html',
				as: 'string'
			}, function( req, res ) {
				var powServerRegExp = new RegExp( escapeRegExp( powServer ), 'g' );
				res.string = res.string.replace( powServerRegExp, tunnel.url );
			});

			fn( tunnel );
		});
	});
};
