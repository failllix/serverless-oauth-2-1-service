const axios = require("axios");

async function returnAxiosResponse(axiosCallback) {
    try {
        return await axiosCallback();
    } catch (e) {
        return e.response;
    }
}

exports.requestAccessCodeWithPayload = async (payload) => {
    return await returnAxiosResponse(() =>
        axios.post(`${process.env.AUTH_URL}/code`, payload, {
            "Content-Type": "application/json",
        })
    );
};

exports.requestAccessTokenWithPayload = async (payload) => {
    return await returnAxiosResponse(() =>
        axios.post(`${process.env.AUTH_URL}/token`, payload, {
            "Content-Type": "application/json",
        })
    );
};

exports.requestVerificationWithPayload = async (payload) => {
    return await returnAxiosResponse(() =>
        axios.post(`${process.env.AUTH_URL}/introspect`, payload, {
            "Content-Type": "application/json",
        })
    );
};

exports.requestPublicKeys = async () => {
    return await returnAxiosResponse(() =>
        axios.get(`${process.env.AUTH_URL}/.well-known/jwks.json`)
    );
};
