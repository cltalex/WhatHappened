const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const date = req.query.date;

    let birthdayBesties = {
        bestie1: {
            thumbnail: "",
            name: "",
            profession: ""
        },
        bestie2: {
            thumbnail: "",
            name: "",
            profession: ""
        },
        bestie3: {
            thumbnail: "",
            name: "",
            profession: ""
        }
    };

    if (!date) {
        return res.status(400).json({
            error: "Date is required"
        });
    }

    try {
        const response = await fetch(
            `https://pelicanto.com/api/famous-birthdays/day?date=${date}`
        );
        const data = await response.json();
        if (data && data.rows && data.rows.length > 0) {
            birthdayBesties = {
                bestie1: {
                    thumbnail: data.rows[0]?.imageUrl || "",
                    name: data.rows[0]?.name || "",
                    profession: data.rows[0]?.profession || ""
                },
                bestie2: {
                    thumbnail: data.rows[1]?.imageUrl || "",
                    name: data.rows[1]?.name || "",
                    profession: data.rows[1]?.profession || ""
                },
                bestie3: {
                    thumbnail: data.rows[2]?.imageUrl || "",
                    name: data.rows[2]?.name || "",
                    profession: data.rows[2]?.profession || ""
                }
            }
        }
        return res.json(birthdayBesties);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch besties"
        });
    }
});

module.exports = router;