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

        const dollarInflationData = await dollarInflationResponse.json();

        if (!dollarInflationData) {
            return res.status(404).json({
                error: "No dollar inflation data found for this date and country"
            });
        }

        const dollarValue = dollarInflationData;

        const endDateDate = new Date();
        endDateDate.setDate(endDateDate.getDate() + 15);
        const endDate = endDateDate.toISOString().split("T")[0];

        const gasPriceResponse = await fetch(
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=3zjKYxV86AqtJWSRoAECir1wQFscVu6lxXnRVKG8&frequency=weekly&data[0]=value&facets[series][]=EMM_EPM0_PTE_NUS_DPG&start=${encodeURIComponent(date)}&end=${encodeURIComponent(endDate)}&sort[0][column]=period&sort[0][direction]=asc&length=1`
        );
        const gasPriceData = await gasPriceResponse.json();
        if (!gasPriceData || !gasPriceData.response.data[0].value) {
            return res.status(404).json({
                error: "No gas price data found for this date and country"
            });
        }
        const gasPrice = gasPriceData.response.data[0].value + gasPriceData.response.data[0].units;

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