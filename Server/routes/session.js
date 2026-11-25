const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const SESSION_TTL_MS = 60 * 60 * 1000;
const sessions = new Map(); // token -> expiry timestamp

function pruneExpired() {
    const now = Date.now();
    for (const [token, expires] of sessions) {
        if (expires <= now) sessions.delete(token);
    }
}

router.post("/", (req, res) => {
    pruneExpired();
    const token = crypto.randomUUID();
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    res.json({ token });
});

function requireSession(req, res, next) {
    const token = req.get("x-session-token");
    const expires = token && sessions.get(token);
    if (!expires || expires <= Date.now()) {
        sessions.delete(token);
        return res.status(401).json({ error: "Invalid or expired session" });
    }
    next();
}

module.exports = { router, requireSession };
