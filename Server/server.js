const path = require('path');
require('dotenv').config({
   path: path.join(__dirname, '../.env')
});
const express = require("express");
const cors = require("cors");
const citiesRoute = require("./routes/cities");
const messageRoute = require("./routes/message");
const newsRoute = require("./routes/news");
const weatherRoute = require("./routes/weather");

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/cities", citiesRoute);
app.use("/api/message", messageRoute);
app.use("/api/news", newsRoute);
app.use("/api/weather", weatherRoute);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});