const extractUserInfoFromBasicAuthHeader = (authHeader) => {
    const basicAuthHeaderMatches = authHeader.match(/^Basic ([-A-Za-z0-9+/]*={0,3})$/);

    if (basicAuthHeaderMatches === null) {
        throw new Error("Authorization header does not match expected format: 'Basic <base64_encoded_data>'.");
    }

    const base64EncodedUserInfoString = basicAuthHeaderMatches[1];

    const userInfoBinaryString = atob(base64EncodedUserInfoString);
    const userInfoBytes = Uint8Array.from(userInfoBinaryString, (m) => m.codePointAt(0));
    const decodedUserInfo = new TextDecoder().decode(userInfoBytes);

    const userInfoMatches = decodedUserInfo.match(/^(.*):(.*)$/);
    if (userInfoMatches === null) {
        throw new Error("Supplied Basic authentication data does not match expected format: '<username>:<password>'.");
    }

    return { username: userInfoMatches[1], password: userInfoMatches[2] };
};

export default {
    extractUserInfoFromBasicAuthHeader,
};
