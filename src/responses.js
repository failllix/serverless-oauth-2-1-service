const SUCCESS = ({ jsonResponse, headers }) => {
    return new Response(JSON.stringify(jsonResponse), { status: 200, headers });
};

const FOUND = (newUrl) => {
    return new Response(null, {
        status: 302,
        headers: { Location: newUrl },
    });
};

const BAD_REQUEST = (message) =>
    new Response(message, {
        status: 400,
    });

const INTERNAL_SERVER_ERROR = (message) => new Response(message, { status: 500 });

const NOT_FOUND = new Response(null, {
    status: 404,
});
const FORBIDDEN = new Response(null, {
    status: 403,
});
const UNAUTHORIZED = new Response(null, {
    status: 401,
});

const NOT_IMPLEMENTED = () => new Response(null, { status: 501 });

export { SUCCESS, FOUND, BAD_REQUEST, NOT_FOUND, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED };
