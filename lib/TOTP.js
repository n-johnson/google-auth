/*
 * google-auth - TOTP.js
 * https://github.com/n-johnson/google-auth
 * Copyright 2014 Nathan Johnson
 * Except TOTP._hexToByteArray: Copyright (c) 2009-2013, Jeff Mott. (Crypto-JS 2.5.4)
 * License: MIT License - https://raw.github.com/n-johnson/google-auth/raw/master/LICENSE
 */

var crypto = require('crypto');

var TOTP = {
    defaults: {
        responseLength: 6,
        stepLength: 30
    }
};

/* generateOTP
 * @param (string) inputKey - stored private key
 * @param (int) responseLength - digits to return as OTP
 *              - Default: 6 | google auth only is compatible with 6 digits
 */
TOTP.generateOTP = function(inputKey, responseLength) {
    responseLength = responseLength || TOTP.defaults.responseLength;
    var mod = Math.pow(10, responseLength);

    var byteHash = TOTP._HMAC_SHA1(inputKey);
    var truncated = TOTP._truncateOTP(byteHash);
    var otp = '' + truncated % mod;

    while (otp.length < responseLength) //Pad front end of result if < responseLength
        otp = "0" + otp;

    return otp;
};

/* _HMAC_SHA1
 *      - Based on RFC 6238 (TOTP) and RFC 4226 (HOTP)
 *      - Where hmac = HMAC-SHA-1(Key,Counter)
 * @param (string) inputKey - stored private key
 * @return (byte[]) - byte[] representation of HMAC(Key,Counter)
 */
TOTP._HMAC_SHA1 = function(inputKey) {
    var steps = TOTP._intToByteArray(TOTP._getStepCount()); //Steps between T(cur) and T(0)
    var hmac = crypto.createHmac('SHA1', new Buffer(inputKey));
    hmac.setEncoding('hex');
    hmac.write(new Buffer(steps));
    hmac.end();
    return TOTP._hexToByteArray(hmac.read());
};

/* _getStepCount - Returns the T value for HOTP as specified by RFC6238
 * Let T0 = 00:00:00 1 January 1970 UTC
 * T = floor((Current unixtime - T0) / X)
 * X = 30 seconds - google auth limitation
 * @param stepLength (optional) - Validity period of each OTP.
 *        - Default: 30 (recommended)
 * @return - (integer) - step count
 */
TOTP._getStepCount = function(stepLength) {
    stepLength = stepLength || TOTP.defaults.stepLength;
    var currentSeconds = Date.now() / 1000;
    return Math.floor(currentSeconds / TOTP.defaults.stepLength);
};

/* truncateOTP - Converts byteArray of hash into OTP
 *             - Described in RFC 6238 page 12
 */
TOTP._truncateOTP = function(byteArray) {
    var offset = byteArray[byteArray.length - 1] & 0xf;
    var binary =
        ((byteArray[offset] & 0x7f) << 24) |
        ((byteArray[offset + 1] & 0xff) << 16) |
        ((byteArray[offset + 2] & 0xff) << 8) |
        (byteArray[offset + 3] & 0xff);
    return binary;
};

/* Crypto-JS v2.5.4
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 *
 * hexToBytes - Converts a hex string to its corresponding byte array
 * @param - (string) hex
 * @return - byte[]
 */
TOTP._hexToByteArray = function(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
};

/* _intToByteArray - Converts integer to corresponding byte array
 * @param - (integer) inputInteger
 * @return - byte[]
 */
TOTP._intToByteArray = function(inputInteger) {
    var byteArray = [];
    for (var i = 7; i > -1; i--) {
        byteArray[i] = inputInteger & 0xff; //(0xff = 255); bitwise AND operation
        inputInteger = (inputInteger - byteArray[i]) / 256;
    }
    return byteArray;
};

/* verifyToken - Check if an entered code is correct
 * @param (string) - token - Provided by user
 * @param (string) - key - Private key stored securely on the server
 * @param (integer) - responseLength (OPTIONAL) - If not using the default 6 digit token.
 * @return (boolean) - True: Correct token provided
 */
TOTP.verifyToken = function(token, key, responseLength) {
    responseLength = responseLength || TOTP.defaults.responseLength;
    var expectedToken = TOTP.generateOTP(key, responseLength);
    if (token === expectedToken)
        return true;
    return false;
};

module.exports = TOTP;