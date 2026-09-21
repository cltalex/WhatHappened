const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const date = req.query.date;
    const country = req.query.country;
    const todayDate = new Date().toISOString().split("T")[0];

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
        const dollarInflationResponse = await fetch(
            `https://www.statbureau.org/calculate-inflation-price-json?jsoncallback=jQuery1112030168503952351233_1781976277288&country=${encodeURIComponent(country)}&start=${encodeURIComponent(date)}&end=${encodeURIComponent(todayDate)}&amount=1&format=true`
        );
        console.log(dollarInflationResponse);
        const dollarInflationData = await dollarInflationResponse.json();
        if (!dollarInflationData.response || dollarInflationData.response.docs.length === 0) {
            return res.status(404).json({
                error: "No dollar inflation data found for this date and country"
            });
        }
        const dollarValue = dollarInflationData.response;
        

        const gasPriceResponse = await fetch(
            `https://api.eia.gov/v2/natural-gas/pri/sum/data/?api_key=3zjKYxV86AqtJWSRoAECir1wQFscVu6lxXnRVKG8`, {
                headers: {
                    "X-Params": {
                        "frequency": "annual",
                        "data": [
                            "value"
                        ],
                        "facets": {},
                        "start": date,
                        "end": todayDate,
                        "sort": [
                            {
                                "column": "period",
                                "direction": "desc"
                            }
                        ],
                        "offset": 0,
                        "length": 1
                    }
                },
            }
        )
        const gasPriceData = await gasPriceResponse.json();
        if (!gasPriceData.response || gasPriceData.response.docs.length === 0) {
            return res.status(404).json({
                error: "No gas price data found for this date and country"
            });
        }
        const gasPrice = gasPriceData.response.data[0].value;

        const Economy = {
            dollarValue: dollarValue,
            gasPrice: gasPrice,
        }
        res.json(Economy);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch news"
        });
    }
});

module.exports = router;