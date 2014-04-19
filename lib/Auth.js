/*
 * google-auth - Auth.js
 * https://github.com/n-johnson/google-auth
 * Copyright 2014 Nathan Johnson
 * License: MIT License - https://raw.github.com/n-johnson/google-auth/raw/master/LICENSE
 */

var crypto = require('crypto');
var b32 = require('./Base32');
var TOTP = require('./TOTP');

var Auth = {
    '_generateSecureKey': function(length, callback) {
        crypto.randomBytes(length, function(ex, buf) {
            if (ex) throw ex;
            var token = buf.toString('hex');
            return callback(token);
        });
    },
    'generateNewkey': function(callback) {
        Auth._generateSecureKey(48, function(token) {
            var encodeB32 = b32.encode(token);
            return callback(token, encodeB32);
        });
    },
    'generateQRData': function(username, secret, issuer) {
        return encodeURIComponent('otpauth://totp/' + issuer + ':' + username + '?secret=' + secret + '&issuer=' + issuer);
    },
    '_getCurrentCode': function(token) {
        return TOTP.generateOTP(token, 6);
    },
    'verifyToken': function(token, key) {
        return TOTP.verifyToken(token, key);
    }
};

module.exports = Auth;