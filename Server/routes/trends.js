const express = require("express");
const router = express.Router();
const trendsJSON = require("../trends.json");

router.get("/", async (req, res) => {
    const date = req.query.date;
    const year = new Date(date).getFullYear();
    const era = getEraData(date);

    if (!date || date > new Date() || !era) {
        return res.status(400).json({ error: "Invalid date or no trends available for the specified date" });
    }
    try {
        const data = trendsJSON;
        if (!data) return res.status(500).json({ error: "No trend data found" });

        const trends = {
            start: year,
            fem: {
                name: era.Fem.name,
                description: era.Fem.description,
                cutoutIMG: era.Fem.cutoutIMG,
                tFrameIMG: era.Fem.tFrameIMG,
                bFrameIMG: era.Fem.bFrameIMG,
            },
            masc: {
                name: era.Masc.name,
                description: era.Masc.description,
                cutoutIMG: era.Masc.cutoutIMG,
                tFrameIMG: era.Masc.tFrameIMG,
                bFrameIMG: era.Masc.bFrameIMG,
            },
        };
        res.json(trends);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch trends"
        });
    }
});

module.exports = router;

function getEraData(date) {
    const year = new Date(date).getFullYear();
    return trendsJSON.Eras.find(era =>
        year >= Number(era.start) &&
        year <= Number(era.end)
    );
}