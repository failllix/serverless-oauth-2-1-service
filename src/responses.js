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

export { BAD_REQUEST, NOT_FOUND, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR };
