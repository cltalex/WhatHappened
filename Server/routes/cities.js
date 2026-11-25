const express = require("express");
const router = express.Router();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 1000;
const cache = new Map(); // normalized query -> { cities, expires }

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expires <= Date.now()) {
        cache.delete(key);
        return null;
    }
    return entry.cities;
}

function setCached(key, cities) {
    if (cache.size >= CACHE_MAX_ENTRIES) {
        // Maps iterate in insertion order, so this evicts the oldest entry
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, { cities, expires: Date.now() + CACHE_TTL_MS });
}

router.get("/", async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (query.length < 2 || !/^[a-zA-Z,]+$/.test(query)) { // Require at least 2 characters and only letters and commas
        return res.json([]);
    }

    const cacheKey = query.toLowerCase();
    const cached = getCached(cacheKey);
    if (cached) {
        return res.json(cached);
    }

    try {
        const response = await fetch(
            `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&apiKey=${process.env.GEOAPIFY_API_KEY}`
        );

        if (!response.ok) {
            return res.status(502).json({
                error: "Failed to fetch cities"
            });
        }

        const data = await response.json();

        const cities = data.features.map(place => ({
            cityData: {
                formatted: place.properties.formatted,
                country: place.properties.country,
                latitude: place.properties.lat,
                longitude: place.properties.lon,
            }
        }));

        setCached(cacheKey, cities);
        res.json(cities);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch cities"
        });
    }
});

module.exports = router;