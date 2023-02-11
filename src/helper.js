//Base64 and UrlBase64 conversion
function base64ToUrlBase64(base64String) {
    return base64String
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+/g, "");
}

function urlBase64ToBase64(urlBase64String) {
    let base64String = urlBase64String.replace(/-/g, "+").replace(/_/g, "/");
    if (base64String % 4 !== 0) {
        for (let i = 0; i < base64String % 4; i++) {
            base64String += "=";
        }
    }
    return base64String;
}

//Converting to UrlBase64
function uint8ToUrlBase64(uint8) {
    var bin = "";
    uint8.forEach(function (code) {
        bin += String.fromCharCode(code);
    });
    return binToUrlBase64(bin);
}

function strToUrlBase64(str) {
  return binToUrlBase64(utf8ToBinaryString(str));
}

//Converting from UrlBase64
function urlBase64Touint8(urlBase64String) {
  let base64String = urlBase64ToBase64(urlBase64String);
  return Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
}


//HELPERS
function utf8ToBinaryString(str) {
  var escstr = encodeURIComponent(str);
  var binstr = escstr.replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
  });

  return binstr;
}

function binToUrlBase64(bin) {
  let base64String = btoa(bin);
  return base64ToUrlBase64(base64String);
}

function strToUint8(str) {
  return new TextEncoder().encode(str);
}

function uint8ToHexString(uint8) {
  return Array.from(uint8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
}


// Hashing functions
async function strToSha512HexString(str) {
    const hashBuffer = await crypto.subtle.digest("SHA-512", strToUint8(str));
    return uint8ToHexString(new Uint8Array(hashBuffer));
}

export {
    strToUrlBase64,
    strToUint8,
    uint8ToUrlBase64,
    strToSha512HexString,
    urlBase64Touint8,
};
