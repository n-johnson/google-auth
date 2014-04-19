/*
 * Base32 encoding/decoding based on RFC 3548
 * https://github.com/chrisumbel/thirty-two
 * Copyright 2011 Chris Umbel
 * License: MIT License - https://raw.githubusercontent.com/chrisumbel/thirty-two/master/LICENSE.txt
 */

var Base32 = {};

Base32.charTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
Base32.byteTable = [
    0xff, 0xff, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
    0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
    0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff
];

Base32.quintetCount = function(buff) {
    var quintets = Math.floor(buff.length / 5);
    return buff.length % 5 === 0 ? quintets : quintets + 1;
};

Base32.encode = function(plain) {
    var i = 0;
    var j = 0;
    var shiftIndex = 0;
    var digit = 0;
    var encoded = new Array(Base32.quintetCount(plain) * 8);

    while (i < plain.length) {
        var current = plain.charCodeAt(i);

        if (shiftIndex > 3) {
            digit = current & (0xff >> shiftIndex);
            shiftIndex = (shiftIndex + 5) % 8;
            digit = (digit << shiftIndex) | ((i + 1 < plain.length) ?
                plain.charCodeAt(i + 1) : 0) >> (8 - shiftIndex);
            i++;
        } else {
            digit = (current >> (8 - (shiftIndex + 5))) & 0x1f;
            shiftIndex = (shiftIndex + 5) % 8;
            if (shiftIndex === 0) i++;
        }

        encoded[j] = Base32.charTable[digit];
        j++;
    }

    for (i = j; i < encoded.length; i++)
        encoded[i] = '=';

    return encoded.join('');
};

Base32.decode = function(encoded) {
    var shiftIndex = 0;
    var plainDigit = 0;
    var plainChar;
    var plainPos = 0;

    encoded = encoded.replace(/[=]+$/, '');
    var decoded = new Array(Math.floor(encoded.length * 5 / 8));

    for (var i = 0; i < encoded.length; i++) {
        var encodedByte = encoded.charCodeAt(i) - 0x30;

        if (encodedByte < Base32.byteTable.length) {
            plainDigit = Base32.byteTable[encodedByte];

            if (shiftIndex <= 3) {
                shiftIndex = (shiftIndex + 5) % 8;

                if (shiftIndex === 0) {
                    plainChar |= plainDigit;
                    decoded[plainPos] = String.fromCharCode(plainChar);
                    plainPos++;
                    plainChar = 0;
                } else {
                    plainChar |= 0xff & (plainDigit << (8 - shiftIndex));
                }
            } else {
                shiftIndex = (shiftIndex + 5) % 8;
                plainChar |= 0xff & (plainDigit >>> shiftIndex);
                decoded[plainPos] = String.fromCharCode(plainChar);
                plainPos++;

                plainChar = 0xff & (plainDigit << (8 - shiftIndex));
            }
        }
    }

    return decoded.join('');
};

module.exports = Base32;