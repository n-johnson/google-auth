var Auth = require('../index');

Auth.generateNewkey(function(hex, base32) {
    console.log("Private Key: " + hex);
    console.log("The above key is stored securely on the server and used to validate a token.");
    console.log("Below is a URI-encoded string that can be directly converted in a QR code via the library of your choice");
    console.log("For more information on the format expected by google authenticator, go here: https://code.google.com/p/google-authenticator/wiki/KeyUriFormat");
    console.log(Auth.generateQRData("Username", base32, "YourSite.com"));
});