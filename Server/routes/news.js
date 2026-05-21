const express = require("express");
const router = express.Router();
require('dotenv').config();

router.get("/", async (req, res) => {
    const query = req.query.date;
    const query1 = req.query.country;
    var newsArticle =  {
        article1: "",
        article2: "",
        article3: "",
    }

    if (!query || query.length < 3) {
        return res.json([]);
    }

    if (!query1) {
        return res.json([]);
    }

    try {
        const response = await fetch(
            `https://api.nytimes.com/svc/search/v2/articlesearch.json?begin_date=${encodeURIComponent(query)}&end_date=${encodeURIComponent(query)}&fq=type_of_material:("News") AND glocations:("${query1}")&api-key=${process.env.NEWS_API_KEY}`
        );

        const data = await response.json();

        if (data.response || data.response.docs) {
            const docs = data.response.docs;
            newsArticles = {
                article1: docs[0]?.snippet || "",
                article2: docs[1]?.snippet || "",
                article3: docs[2]?.snippet || "",
            };
        } else {
            console.log("Could not get info from nyt source, trying diff source");
            GetNewFromOtherSource();
        }

        res.json(newsArticles);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch news"
        });
    }
});

module.exports = router;