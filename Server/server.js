const path = require('path');
require('dotenv').config({
   path: path.join(__dirname, '../.env')
});
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");


const citiesRoute = require("./routes/cities");
const messageRoute = require("./routes/message");
const newsRoute = require("./routes/news");
const weatherRoute = require("./routes/weather");
const trendsRoute = require("./routes/trends");
const topSongRoute = require("./routes/topsong");
const economyRoute = require("./routes/economy");
const routes = [
    ["/api/cities", citiesRoute],
    ["/api/message", messageRoute],
    ["/api/news", newsRoute],
    ["/api/weather", weatherRoute],
    ["/api/trends", trendsRoute],
    ["/api/topSong", topSongRoute],
    ["/api/economy", economyRoute]
];

const PORT = process.env.SERVER_PORT;
const app = express();
const sessions = new Map();
const SESSION_DURATION_MS = 60 * 60 * 1000;

const sessionCleanup = setInterval(() => {
    const now = Date.now();
    for (const [token, expiresAt] of sessions) {
        if (expiresAt <= now) sessions.delete(token);
    }
}, SESSION_DURATION_MS);
sessionCleanup.unref();

app.use(cors());
app.use(express.json());

app.post("/api/session", (req, res) => {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + SESSION_DURATION_MS);
    res.json({ token });
});

function requireSession(req, res, next) {
    const token = req.get("x-session-token");
    const expiresAt = token && sessions.get(token);

    if (!expiresAt || expiresAt <= Date.now()) {
        if (token) sessions.delete(token);
        return res.status(401).json({ error: "A valid session is required" });
    }

    next();
}

app.use("/api", requireSession);

routes.forEach(([path, router]) => {
    app.use(path, router);
});

app.listen(PORT, () => {
    routes.forEach(([path]) => {
        console.log(`  ✅ ${path}`);
    });

    console.log(`Server running on port ${PORT}`);
    console.log(`All ${routes.length} endpoints loaded without errors :3`);
});