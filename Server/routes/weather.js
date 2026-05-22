const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const date = req.query.date;
    const latitude = req.query.lat;
    const longitude = req.query.lon;
    
    if (!date || !latitude || !longitude) {
        return res.json([]);
    }
    try {
        const response = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&start_date=${encodeURIComponent(date)}&end_date=${encodeURIComponent(date)}&daily=rain_sum,temperature_2m_min,temperature_2m_max,snowfall_sum,cloud_cover_mean,wind_speed_10m_mean,temperature_2m_mean&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
        );

        const data = await response.json();
        if (!data) return res.status(500).json({ error: "No weather data found" });

        const rain = data.daily.rain_sum?.[0] ?? 0;
        const snow = data.daily.snowfall_sum?.[0] ?? 0;
        const cloud = data.daily.cloud_cover_mean?.[0] ?? 0;
        let emojiToUse = "❓";
        let _conditionsText = "";

        if (cloud > 80) { //percentage
            _conditionsText += "cloudy";
            emojiToUse = "☁️";
        } else {
            _conditionsText += "sunny";
            emojiToUse = "☀️";
        }
        if (rain > 0.09) { //inches
            if (rain <= 0.25) {
                //light rain
                emojiToUse = "🌧️";
                _conditionsText += " & light rain";
            } else {
                //hard rain
                emojiToUse = "🌧️";
                _conditionsText += " & hard rain";
            }
        }
        if (snow > 0.5) { //inches
            //snowy
            _conditionsText = "snowy";
            emojiToUse = "🌨️";
        }

        const weather = {
            temperature: `${Math.trunc(data.daily.temperature_2m_mean[0])}°F`,
            high: `${Math.trunc(data.daily.temperature_2m_max[0])}°F`,
            low: `${Math.trunc(data.daily.temperature_2m_min[0])}°F`,
            emoji: emojiToUse,
            conditionsText: _conditionsText,
        };

        res.json(weather);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch weather"
        });
    }
});

module.exports = router;