"use strict";

function beforeRequest(req, context, ee, next) {
    const token = context.vars.token;

    if (!req.headers) req.headers = {};

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
        // Optional debug:
        // console.log("Attached token:", token.slice(0, 16));
    } else {
        console.warn("❌ No token found in payload context");
    }

    return next();
}

module.exports = { beforeRequest };
