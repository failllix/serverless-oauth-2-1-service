import environmentVariables from "../storage/environmentVariables.js";

function base64ToUrlBase64(base64String) {
    return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+/g, "");
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

function uint8ToUrlBase64(uint8) {
    let bin = "";
    for (const code of uint8) {
        bin += String.fromCharCode(code);
    }
    return binToUrlBase64(bin);
}

function strToUrlBase64(str) {
    return binToUrlBase64(utf8ToBinaryString(str));
}

function urlBase64ToStr(urlBase64String) {
    const base64String = urlBase64ToBase64(urlBase64String);
    return atob(base64String);
}

function urlBase64Touint8(urlBase64String) {
    const base64String = urlBase64ToBase64(urlBase64String);
    return Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
}

function utf8ToBinaryString(str) {
    const escstr = encodeURIComponent(str);
    const binstr = escstr.replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));

    return binstr;
}

function binToUrlBase64(bin) {
    const base64String = btoa(bin);
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

async function strToSha512HexString(str) {
    const hashBuffer = await crypto.subtle.digest("SHA-512", strToUint8(str));
    return uint8ToHexString(new Uint8Array(hashBuffer));
}

async function calculateSha256FromString(str) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", strToUint8(str));
    return new Uint8Array(hashBuffer);
}

async function generateRandomSha256HexString() {
    const randomValues = crypto.getRandomValues(new Uint8Array(64));

    const hashedBuffer = await crypto.subtle.digest("SHA-256", randomValues);

    return Array.from(new Uint8Array(hashedBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function getRandomUUID() {
    return crypto.randomUUID();
}

async function getPBKDF2PasswordHash(password, base64Salt) {
    try {
        const encodedPassword = new TextEncoder().encode(password);

        const key = await crypto.subtle.importKey("raw", encodedPassword, { name: "PBKDF2" }, false, ["deriveBits"]);

        const decodedSalt = new Uint8Array(atob(base64Salt).split(","));

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: decodedSalt,
                iterations: 1000000,
                hash: "SHA-512",
            },
            key,
            512,
        );

        return btoa(new Uint8Array(derivedBits));
    } catch (error) {
        throw new Error("Could not derive password hash", { cause: error });
    }
}

const getUrlWithoutSearchParams = (url) => {
    if (environmentVariables.isLocalEnvironment()) {
        return `${url.protocol}//${url.hostname}:${url.port}${url.pathname}`;
    }
    return `${url.protocol}//${url.hostname}${url.pathname}`;
};

export default {
    strToUrlBase64,
    urlBase64ToStr,
    strToUint8,
    uint8ToUrlBase64,
    strToSha512HexString,
    calculateSha256FromString,
    getPBKDF2PasswordHash,
    urlBase64Touint8,
    generateRandomSha256HexString,
    getRandomUUID,
    getUrlWithoutSearchParams,
};
