const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../.env')
});

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const citiesRoute = require("./routes/cities");
const messageRoute = require("./routes/message");
const newsRoute = require("./routes/news");
const weatherRoute = require("./routes/weather");
const trendsRoute = require("./routes/trends");
const topSongRoute = require("./routes/topsong");
const economyRoute = require("./routes/economy");

const { router: sessionRoute, requireSession } = require("./routes/session");

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

app.use(cors());
app.use(express.json());

// Limits are per IP. The API limit is generous because city autocomplete fires on typing.
const limiterOptions = {
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" }
};
const sessionLimiter = rateLimit({ ...limiterOptions, windowMs: 60 * 1000, limit: 10 }); //every IP can create a session at most 10 times per minute
const apiLimiter = rateLimit({ ...limiterOptions, windowMs: 60 * 1000, limit: 25 });

// Session creation is public; every other API route requires a valid session token
app.use("/api/session", sessionLimiter, sessionRoute);

routes.forEach(([path, router]) => {
    app.use(path, apiLimiter, requireSession, router);
});

app.listen(PORT, () => {
    routes.forEach(([path]) => {
        console.log(`  ✅ ${path}`);
    });

    console.log(`Server running on port ${PORT}`);
    console.log(`All ${routes.length} endpoints loaded without errors :3`);
});
