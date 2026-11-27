const express = require("express");
const router = express.Router();
const gasPriceJSON = require("../GasPrices.json");

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


        const gasPriceData = gasPriceJSON;
        const todayGasPriceData = gasPriceJSON;
        const year = Number(date.split('-')[0]);
        const gasEntry = gasPriceData?.annual_prices?.find(entry => entry.year === year);
        const todayGasEntry = todayGasPriceData?.annual_prices?.find(entry => entry.year === new Date(todayDate).getFullYear());
        if (!gasEntry || !todayGasEntry) {
            return res.status(404).json({
                error: "No gas price data found for this date and country"
            });
        }
        const gasPrice = gasEntry.price_usd_per_gallon;
        const todayGasPrice = todayGasEntry.price_usd_per_gallon;

        const Economy = {
            dollarValue: dollarValue,
            gasPrice: gasPrice,
            todayGasPrice: todayGasPrice,
        }

        res.json(Economy);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch economy data"
        });
    }
});

module.exports = router;