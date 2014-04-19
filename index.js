/*
 * google-auth - index.js
 * https://github.com/n-johnson/google-auth
 * Copyright 2014 Nathan Johnson
 * License: MIT License - https://raw.github.com/n-johnson/google-auth/raw/master/LICENSE
 */

var Base32 = require('./lib/Base32');
var TOTP = require('./lib/TOTP');

console.log(TOTP.generateOTP('7c10d573edd02639f1d07fb18022a14683b472a5d89cc7dd7cd230d55fee14cd8fba82f817c7ae1247154db50ebaf69c'));

var Auth = {};