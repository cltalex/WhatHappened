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

        

        const gasPriceUrl = (params) =>
            `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=3zjKYxV86AqtJWSRoAECir1wQFscVu6lxXnRVKG8&frequency=weekly&data[0]=value&facets[series][]=EMM_EPM0_PTE_NUS_DPG&sort[0][column]=period&length=1&${params}`;

        const [gasPriceResponse, todayGasPriceResponse] = await Promise.all([
            fetch(gasPriceUrl(`start=${encodeURIComponent(date)}&end=${encodeURIComponent(endDate)}&sort[0][direction]=asc`)),
            fetch(gasPriceUrl("sort[0][direction]=desc"))
        ]);
        const gasPriceData = await gasPriceResponse.json();
        const todayGasPriceData = await todayGasPriceResponse.json();

        const gasEntry = gasPriceData?.response?.data?.[0];
        const todayGasEntry = todayGasPriceData?.response?.data?.[0];
        if (!gasEntry?.value || !todayGasEntry?.value) {
            return res.status(404).json({
                error: "No gas price data found for this date and country"
            });
        }
        const gasPrice = gasEntry.value + gasEntry.units;
        const todayGasPrice = todayGasEntry.value + todayGasEntry.units;

        const Economy = {
            dollarValue: dollarValue,
            gasPrice: gasPrice,
            todayGasPrice: todayGasPrice,
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