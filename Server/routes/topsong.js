const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const date = req.query.date;
    
    if (!date || date > new Date()) {
        return res.json([]);
    }
    try {
        const closestSaturday = getPreviousSaturday(date);
        console.log(`https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/date/${closestSaturday}.json`);
        const response = await fetch(
            `https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/date/${closestSaturday}.json`
        );

        const data = await response.json();
        if (!data) return res.status(500).json({ error: "No song data found" });
        console.log(data);

        const topSong = {
            artist: data.data[0].artist,
            title: data.data[0].song,
        };

        res.json(topSong);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch song"
        });
    }
});

module.exports = router;

function getPreviousSaturday(date) {
  const d = new Date(date);
  const day = d.getDay();

  const diff = day === 6 ? 7 : day + 1;
  d.setDate(d.getDate() - diff);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}