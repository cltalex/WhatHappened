const backendURL = "http://localhost:3000";

var bdayData = {
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

cityInput.addEventListener("input", () => {
    selectedCity = false; //false when typing in it
});
if (window.location.href === "file:///C:/Users/coder/OneDrive/Documents/Code/App/index.html") {
    dateInput.value = "2009-01-01";
    cityInput.value = "www";
    UpdateCitySuggestions();
}


async function UpdateCitySuggestions() {
    const query = cityInput.value.trim();
    if (query.length < 2) {
        citySuggestionsBox.innerHTML = "";
        return;
    }
    try {
        const response = await fetch(
            backendURL +
            `/api/cities?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        citySuggestionsBox.innerHTML = "";
        data.forEach(place => {
            const div = document.createElement("div");
            div.parentElement = 
            div.classList.add("suggestion-item");
            div.textContent = place.cityData.formatted;
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
        const results = await Promise.all(
            tasks.map(task => task.run())
        );
        ChangeLoadingText("Finished!", "lightgreen");
        return results;
    } catch (error) {
        console.error(error);
        errorText.innerHTML = error instanceof Error ? error.message : "Something went wrong with the loading tasks";
        throw error;
    } finally {
        //switch to display page
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
        { run: () => fetchWeather(dateInput.value) }
    ];
    await loadingTasks(tasks);
}

//  FETCH FUNCTIONS

async function fetchNews(date) {
    ChangeLoadingText("Gettings news...", "orange");
    const stupidDateFormat = dateInput.value.replaceAll("-", "");
    const response = await fetch(
        backendURL +
        `/api/news?date=${encodeURIComponent(stupidDateFormat)}&country=${encodeURIComponent(submittedLocationData.country.replaceAll(" ", ""))}`
    );
    if (!response.ok) throw new Error(`news request failed: ${response.status}`);
    bdayData.newsArticles = await response.json();
}
async function fetchWeather(date) {
    ChangeLoadingText("Gettings weather...", "lightblue");
    const response = await fetch(
        backendURL +
        `/api/weather?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(submittedLocationData.latitude)}&lon=${encodeURIComponent(submittedLocationData.longitude)}`
    );
    if (!response.ok) throw new Error(`weather request failed: ${response.status}`);
    bdayData.weather = await response.json();
}