const express = require("express");
const cors = require("cors");
const citiesRoute = require("./routes/cities");
const messageRoute = require("./routes/message");
const newsRoutes = require("./routes/news");
require("dotenv").config();

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/cities", citiesRoute);
app.use("/api/message", messageRoute);
app.use("/api/news", messageRoute);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});