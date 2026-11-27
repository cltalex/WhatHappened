const express = require("express");
const router = express.Router();
const bdayJSON = require("../BirthdayPopularity.json");
const birthstones = {
    1: "Garnet",
    2: "Amethyst",
    3: "Aquamarine",
    4: "Diamond",
    5: "Emerald",
    6: "Alexandrite",
    7: "Ruby",
    8: "Peridot",
    9: "Sapphire",
    10: "Tourmaline",
    11: "Topaz",
    12: "Tanzanite"
};


router.get("/", async (req, res) => {
    const date = req.query.date;
    const match = typeof date === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) {
        return res.status(400).json({ error: "Invalid date or no data available for the specified date" });
    }

    const [, yearString, monthString, dayString] = match;
    const year = Number(yearString);
    const month = Number(monthString);
    const day = Number(dayString);
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year === 0 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
        return res.status(400).json({ error: "Invalid date or no data available for the specified date" });
    }

    try {

        // BDAY JSON
        const data = await getBirthdayPopularity(month, day);




        const misc = {
            generation: getGeneration(year),
            birthstone: getBirthstone(month),
            zodiacSign: getZodiacSign(month, day),
            birthSeason: getBirthSeason(month), 
            ...data
        }
        res.json(misc);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch misc data"
        });
    }
});



async function getBirthdayPopularity(month, day) {
    const data = bdayJSON;
    const key =
        `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const rankedDates = [...data.dates]
        .sort((a, b) => b.births - a.births);

    const birthday = rankedDates.find(date => date.key === key);

    if (!birthday) {
        throw new Error("Birthday not found");
    }

    const rank = rankedDates.findIndex(
        date => date.key === key
    ) + 1;

    const percentage = birthday.births / data.totalBirths * 100;
    let rarity;
    if (percentage >= 0.28) {
        rarity = "Very Common";
    } else if (percentage >= 0.25) {
        rarity = "Common";
    } else if (percentage >= 0.22) {
        rarity = "Average";
    } else if (percentage >= 0.18) {
        rarity = "Uncommon";
    } else {
        rarity = "Rare";
    }
    return {
        bdayPopularity: {
            births: birthday.births,
            rank: `${rank} out of ${rankedDates.length}`,
            percentage: percentage.toFixed(3) + "%",
            rarity: rarity
        }
    };
}

function getGeneration(year) {
    if (year >= 2010) {
        return "Gen Alpha";
    } else if (year >= 1997) {
        return "Gen Z";
    } else if (year >= 1981) {
        return "Gen Y";
    } else if (year >= 1965) {
        return "Gen X";
    } else if (year >= 1946) {
        return "Baby Boomer";
    } else {
        return "Silent Generation";
    }
}

function getBirthstone(month) {
    return birthstones[month] || "";
}

function getZodiacSign(month, day) {
    const zodiacSigns = {
        "Capricorn": [ [12, 22], [1, 19] ],
        "Aquarius": [ [1, 20], [2, 18] ],
        "Pisces": [ [2, 19], [3, 20] ],
        "Aries": [ [3, 21], [4, 19] ],
        "Taurus": [ [4, 20], [5, 20] ],
        "Gemini": [ [5, 21], [6, 20] ],
        "Cancer": [ [6, 21], [7, 22] ],
        "Leo": [ [7, 23], [8, 22] ],
        "Virgo": [ [8, 23], [9, 22] ],
        "Libra": [ [9, 23], [10, 22] ],
        "Scorpio": [ [10, 23], [11, 21] ],
        "Sagittarius": [ [11, 22], [12, 21] ]
    };
    for (const [sign, [[startMonth, startDay], [endMonth, endDay]]] of Object.entries(zodiacSigns)) {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
            return sign;
        }
    }
    return "";
}

function getBirthSeason(month) {
    if ([12, 1, 2].includes(month)) {
        return "Winter";
    } else if ([3, 4, 5].includes(month)) {
        return "Spring";
    } else if ([6, 7, 8].includes(month)) {
        return "Summer";
    } else if ([9, 10, 11].includes(month)) {
        return "Fall";
    }
    return "";
}

module.exports = router;