const backendURL = "http://localhost:" + 3000;
let sessionTokenPromise = createSession();

var bdayData = {
    economy: {
        dollarValue: 0,
        gasPrice: 0,
        todayGasPrice: 0,
    },
    topSong: {
        artist: "",
        title: "",
    },
    trends: {
        start: 0,
        fem: {
          name: "",
		  description: "",
		  cutoutIMG: "",
		  tFrameIMG: "",
		  bFrameIMG: "",
		},
		masc: {
		  name: "",
		  description: "",
		  cutoutIMG: "",
	      tFrameIMG: "",
		  bFrameIMG: "",
		},
	 },
    weather: {
        temperature: 0,
        high: 0,
        low: 0,
        emoji: "",
        conditionsText: "",
    },
    newsArticles: {
        article1: {
            headline: "",
            thumbnail: "",
        },
        article2: {
            headline: "",
            thumbnail: "",
        },
        article3: {
            headline: "",
            thumbnail: "",
        }
    },
    birthdayBesties: {
        bestie1: {
            thumbnail: "",
            name: "",
            profession: ""
        },
        bestie2: {
            thumbnail: "",
            name: "",
            profession: ""
        },
        bestie3: {
            thumbnail: "",
            name: "",
            profession: ""
        }
    },
    misc: {
        generation: "",
        birthstone: "",
        zodiacSign: "",
        birthSeason: "",
        bdayPopularity: {
            births: 0,
            rank: 0,
            percentage: 0,
            rarity: ""
        }
    }
};

var submittedLocationData = "";
var selectedCity = false;

const cityInput = document.getElementById("cityInput");
const citySuggestionsBox = document.getElementById("city-suggestions");
const dateInput = document.getElementById("date-input");
const errorText = document.getElementById("forum-error-text");
const submitbtn = document.getElementById("submit-btn");

async function createSession() {
    let response;
    try {
        response = await fetch(`${backendURL}/api/session`, {
            method: "POST",
        });
    } catch (error) {
        console.error(error);
        const message = "Couldn't connect to server. Try again later.";
        ShowLoadingError(message);
        throw new Error(message);
    }
    if (!response.ok) {
        const message = `Request failed: ${response.status}`;
        ShowLoadingError(message);
        throw new Error(message);
    }
    const data = await response.json();
    return data.token;
}

// stops fuckass browser logging the rejection as unhandled.
sessionTokenPromise.catch(() => {});

async function apiFetch(url, options = {}) {
    const sessionToken = await sessionTokenPromise;
    const headers = new Headers(options.headers);
    headers.set("x-session-token", sessionToken);
    return fetch(url, { ...options, headers });
}

cityInput.addEventListener("input", () => {
    selectedCity = false;                    //false when typing in it
    submitbtn.disabled = true;
});

if (window.location.href === "file:///C:/Users/coder/OneDrive/Documents/Code/App/index.html" || window.location.href === "file:///C:/Users/coder/OneDrive/Documents/Code/App/Index.html") {
    dateInput.value = "2009-01-01";
    cityInput.value = "Woodlake, CA, United States of America";
    submittedLocationData = {
        formatted: "Woodlake, CA, United States of America",
        country: "United States",
        latitude: 36.4134809,
        longitude: -119.098633
    };
    selectedCity = true;
    submitbtn.disabled = false;
}

const citySuggestionCache = new Map();
let citySuggestionTimer;
let latestCityQuery = "";

function UpdateCitySuggestions() {
    clearTimeout(citySuggestionTimer);
    citySuggestionTimer = setTimeout(fetchCitySuggestions, 250);
}

async function fetchCitySuggestions() {
    const query = cityInput.value.trim();
    latestCityQuery = query;
    if (query.length < 2) {
        citySuggestionsBox.innerHTML = "";
        return;
    }
    try {
        const cacheKey = query.toLowerCase();
        let data = citySuggestionCache.get(cacheKey);
        if (!data) {
            const response = await apiFetch(
                backendURL +
                `/api/cities?q=${encodeURIComponent(query)}`
            );
            if (!response.ok) throw new Error(`city request failed: ${response.status}`);
            data = await response.json();
            citySuggestionCache.set(cacheKey, data);
        }
        // Ignore response for a query the ppl have alr typed past
        if (query !== latestCityQuery) return;
        citySuggestionsBox.innerHTML = "";
        data.forEach(place => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = place.cityData.formatted;
            div.addEventListener("click", () => {
                submittedLocationData = place.cityData;
                cityInput.value = submittedLocationData.formatted;
                citySuggestionsBox.innerHTML = "";
                selectedCity = true;
                submitbtn.disabled = false;

            });
            citySuggestionsBox.appendChild(div);
        });
    } catch (error) {
        console.error("Error:", error);
        errorText.innerHTML = error;
    }
}

function ChangeLoadingText(text, _color) {
    document.getElementById("loading-text").innerHTML = text;
    document.getElementById("loading-text").style.color = _color;
}

function ShowLoadingError(text) {
    document.getElementById("loading-container").style.display = "block";
    document.getElementById("error-text").innerHTML = text;
}

async function loadingTasks(tasks) {
    document.getElementById("loading-container").style.display = "block";
    errorText.innerHTML = "";
    try {
        const results = [];
        for (const task of tasks) {
            results.push(await task.run());
        }
        ChangeLoadingText("Finished!", "lightgreen");
        return results;
    } catch (error) {
        console.error(error);
        ShowLoadingError(
            error instanceof Error
                ? error.message
                : "Something went wrong with the loading tasks"
        );
        throw error;
    } finally {
        // switch to display page
        localStorage.setItem("BdayData", JSON.stringify(bdayData));
        //window.location.href = "results.html";
        
    }
}

async function GetData() {
    if (cityInput.value.trim() === "" || dateInput.value === "") {
        errorText.innerHTML = "Error: A field is empty";
        return;
    }
    if (!selectedCity) {
        errorText.innerHTML = "Error: Please select a city from the suggestions";
        return;
    }
    const tasks = [
        { run: () => fetchNews(dateInput.value) },
        { run: () => fetchWeather(dateInput.value) },
        { run: () => fetchTrends(dateInput.value) },
        { run: () => fetchTopSong(dateInput.value) },
        { run: () => fetchEconomy(dateInput.value) },
        { run: () => fetchBirthdayBesties(dateInput.value) },
        { run: () => fetchMisc(dateInput.value) }
    ];
    await loadingTasks(tasks);
}

//  FETCH FUNCTIONS
async function fetchNews(date) {
    ChangeLoadingText("Gettings news...", "orange");
    const stupidDateFormat = dateInput.value.replaceAll("-", "");
    const response = await apiFetch(
        backendURL +
        `/api/news?date=${encodeURIComponent(stupidDateFormat)}&country=${encodeURIComponent(submittedLocationData.country.replaceAll(" ", ""))}`
    );
    if (!response.ok) ShowLoadingError(`Request failed: ${response.status}`);
    bdayData.newsArticles = await response.json();
}
async function fetchWeather(date) {
    ChangeLoadingText("Gettings weather...", "lightblue");
    const response = await apiFetch(
        backendURL +
        `/api/weather?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(submittedLocationData.latitude)}&lon=${encodeURIComponent(submittedLocationData.longitude)}`
    );
    if (!response.ok) ShowLoadingError(`Request failed: ${response.status}`);
    bdayData.weather = await response.json();
}

async function fetchTrends(date) {
    ChangeLoadingText("Gettings trends...", "yellow");
    const response = await apiFetch(
        backendURL +
        `/api/trends?date=${encodeURIComponent(date)}`
    );
    if (!response.ok) ShowLoadingError(`Request failed: ${response.status}`);
    bdayData.trends = await response.json();
}

async function fetchTopSong(date) {
    ChangeLoadingText("Getting top song...", "green");
    const response = await apiFetch(
        backendURL +
        `/api/topSong?date=${encodeURIComponent(date)}`
    );
    if (!response.ok) ShowLoadingError(`Request failed: ${response.status}`);
    bdayData.topSong = await response.json();
}

async function fetchEconomy(date) {
    ChangeLoadingText("Getting economy data...", "purple");
    const response = await apiFetch(
        backendURL +
        `/api/economy?date=${encodeURIComponent(date)}&country=${encodeURIComponent(submittedLocationData.country.replaceAll(" ", "-")).toLowerCase()}`
    );
    if (!response.ok) ShowLoadingError(`Request failed: ${response.status}`);
    bdayData.economy = await response.json();
}

async function fetchMisc(date) {
    ChangeLoadingText("Getting miscellaneous data...", "crimson");
    const response = await apiFetch(
        backendURL +
        `/api/misc?date=${encodeURIComponent(date)}`
    );
    if (!response.ok) ShowLoadingError(`Request failed: ${response.status}`);
    bdayData.misc = await response.json();
}

async function fetchBirthdayBesties(date) {
    const newDate = date.split('-').slice(1).join('-')
    ChangeLoadingText("Getting besties...", "pink");
    const response = await apiFetch(
        backendURL +
        `/api/besties?date=${encodeURIComponent(newDate)}`
    );
    if (!response.ok) ShowLoadingError(`Request failed: ${response.status}`);
    bdayData.birthdayBesties = await response.json();
}