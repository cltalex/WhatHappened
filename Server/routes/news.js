const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const date = req.query.date;
    const country = req.query.country;

    let newsArticles = {
        article1: {
            headline: "",
            thumbnail: "",
        },
        article2: {
            headline: "",
            thumbnail: "",
        },
        article3: {
            headline: "",
            thumbnail: "",
        }
    };

    if (!date) {
        return res.status(400).json({
            error: "Date is required"
        });
    }
    if (!country) {
        return res.status(400).json({
            error: "Country is required"
        });
    }

    try {
        const nytResponse = await fetch(
            `https://api.nytimes.com/svc/search/v2/articlesearch.json?begin_date=${date}&end_date=${date}&fq=type_of_material:("News") AND glocations:("${country}")&api-key=${process.env.NEWS_API_KEY}`
        );

        const nytData = await nytResponse.json();
        if (nytData.response && nytData.response.docs && nytData.response.docs.length > 0) {
            const docs = nytData.response.docs;
            newsArticles = {
                article1: {
                    headline: docs[0]?.snippet || "",
                    thumbnail: docs[0]?.multimedia.thumbnail.url,
                },
                article2: {
                    headline: docs[1]?.snippet || "",
                    thumbnail: docs[1]?.multimedia.thumbnail.url,
                },
                article3: {
                    headline: docs[2]?.snippet || "",
                    thumbnail: docs[2]?.multimedia.thumbnail.url,
                }
            };
            return res.json(newsArticles);
        }

        console.log("No NYT articles found. Trying other source.");

        const year = date.slice(0,4);
        const month = date.slice(4,6);
        const day = date.slice(6,8);
        const fallbackSource = await fetch(
            `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`
        );

        const fallbackData = await fallbackSource.json();
        if (fallbackData && fallbackData.events.length > 0) {
            const articles = fallbackData.events.filter(e => e.year === Number(year));
            if (articles.length > 0) {
                newsArticles = {
                    article1: {
                        headline: articles[0]?.text || "",
                        thumbnail: articles[0]?.pages?.[0]?.thumbnail?.source || "",
                    },
                    article2: {
                        headline: articles[1]?.text || "",
                        thumbnail: articles[1]?.pages?.[0]?.thumbnail?.source || "",
                    },
                    article3: {
                        headline: articles[2]?.text || "",
                        thumbnail: articles[2]?.pages?.[0]?.thumbnail?.source || "",
                    }
                };
                return res.json(newsArticles);
            }
        }

        console.log("No articles found. Returning nulls");
        // NO ARTICLES ANYWHERE
        return res.json({
            article1: "",
            article2: "",
            article3: "",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch news"
        });
    }
});

module.exports = router;