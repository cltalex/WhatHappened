const backendURL = "http://localhost:" + 3000;
let sessionTokenPromise = createSession();

var bdayData = {
    economy: {
        dollarValue: 0,
        gasPrice: 0,
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
		  tFrameING: "",
		  bFrameIMG: "",
		},
		masc: {
		  name: "",
		  description: "",
		  cutoutIMG: "",
	      tFrameING: "",
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
};

var submittedLocationData = "";
var selectedCity = false;

const cityInput = document.getElementById("cityInput");
const citySuggestionsBox = document.getElementById("city-suggestions");
const dateInput = document.getElementById("date-input");
const errorText = document.getElementById("forum-error-text");

async function createSession() {
    const response = await fetch(`${backendURL}/api/session`, {
        method: "POST",
    });
    if (!response.ok) throw new Error(`session request failed: ${response.status}`);
    const data = await response.json();
    return data.token;
}

async function apiFetch(url, options = {}) {
    const sessionToken = await sessionTokenPromise;
    const headers = new Headers(options.headers);
    headers.set("x-session-token", sessionToken);
    return fetch(url, { ...options, headers });
}

cityInput.addEventListener("input", () => {
    selectedCity = false;                    //false when typing in it
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
}

async function UpdateCitySuggestions() {
    const query = cityInput.value.trim();
    if (query.length < 2) {
        citySuggestionsBox.innerHTML = "";
        return;
    }
    try {
        const response = await apiFetch(
            backendURL +
            `/api/cities?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        citySuggestionsBox.innerHTML = "";
        data.forEach(place => {
            const div = document.createElement("div");
            // div.parentElement = 
            div.classList.add("suggestion-item");
            div.addEventListener("click", () => {
                submittedLocationData = place.cityData;
                cityInput.value = submittedLocationData.formatted;
                citySuggestionsBox.innerHTML = "";
                selectedCity = true;
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
        errorText.innerHTML =
            error instanceof Error
                ? error.message
                : "Something went wrong with the loading tasks";
        throw error;
    } finally {
        // switch to display page
        localStorage.setItem("UserData", JSON.stringify(bdayData));
        
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
        { run: () => fetchEconomy(dateInput.value) }
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
    if (!response.ok) throw new Error(`news request failed: ${response.status}`);
    bdayData.newsArticles = await response.json();
}
async function fetchWeather(date) {
    ChangeLoadingText("Gettings weather...", "lightblue");
    const response = await apiFetch(
        backendURL +
        `/api/weather?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(submittedLocationData.latitude)}&lon=${encodeURIComponent(submittedLocationData.longitude)}`
    );
    if (!response.ok) throw new Error(`weather request failed: ${response.status}`);
    bdayData.weather = await response.json();
}

async function fetchTrends(date) {
    ChangeLoadingText("Gettings trends...", "yellow");
    const response = await apiFetch(
        backendURL +
        `/api/trends?date=${encodeURIComponent(date)}`
    );
    if (!response.ok) throw new Error(`Trends request failed: ${response.status}`);
    bdayData.trends = await response.json();
}

async function fetchTopSong(date) {
    ChangeLoadingText("Getting top song...", "green");
    const response = await apiFetch(
        backendURL +
        `/api/topSong?date=${encodeURIComponent(date)}`
    );
    if (!response.ok) throw new Error(`Top song request failed: ${response.status}`);
    bdayData.topSong = await response.json();
}

async function fetchEconomy(date) {
    ChangeLoadingText("Getting economy data...", "purple");
    const response = await apiFetch(
        backendURL +
        `/api/economy?date=${encodeURIComponent(date)}&country=${encodeURIComponent(submittedLocationData.country.replaceAll(" ", "-")).toLowerCase()}`
    );
    if (!response.ok) throw new Error(`Economy request failed: ${response.status}`);
    bdayData.economy = await response.json();
}