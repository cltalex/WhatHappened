const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const query = req.query.q;

    if (!query || query.length < 2) {
        return res.json([]);
    }
    try {
        const response = await fetch(
            `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&apiKey=${process.env.GEOAPIFY_API_KEY}`
        );

        const data = await response.json();

        const cities = data.features.map(place => ({
            cityData: {
                formatted: place.properties.formatted,
                country: place.properties.country,
                latitude: place.properties.lat,
                longitude: place.properties.lon,
            }
        }));

        res.json(cities);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch cities"
        });
    }
});

module.exports = router;