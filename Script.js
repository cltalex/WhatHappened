const backendURl = "http://localhost:3000";

var bdayData = {
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

var submittedCountry = "";
var selectedCity = false;

const cityInput = document.getElementById("cityInput");
const citySuggestionsBox = document.getElementById("city-suggestions");
const dateInput = document.getElementById("date-input");
const errorText = document.getElementById("forum-error-text");

cityInput.addEventListener("input", () => {
    selectedCity = false; //false when typing in it
});

async function UpdateCitySuggestions() {
    const query = cityInput.value.trim();
    if (query.length < 2) {
        citySuggestionsBox.innerHTML = "";
        return;
    }
    try {
        const response = await fetch(
            backendURl +
            `/api/cities?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        citySuggestionsBox.innerHTML = "";
        data.forEach(place => {
            const div = document.createElement("div");
            div.parentElement = 
            div.classList.add("suggestion-item");
            div.textContent = place.city.formatted;
            div.addEventListener("click", () => {
                cityInput.value = place.city.formatted;
                citySuggestionsBox.innerHTML = "";
                submittedCountry = place.city.country.replaceAll(" ", "");
                selectedCity = true;
            });
            citySuggestionsBox.appendChild(div);
        });
    } catch (error) {
        console.error("Error:", error);
        errorText.innerHTML = error;
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
    document.getElementById("loading-container").style.display = "block";
    errorText.innerHTML = "";
    const stupidDateFormat = dateInput.value.replaceAll("-", "");

    // NEWS 
    try {
        ChangeLoadingText("Getting news articles...", "orange");
        const response = await fetch(
            backendURl +
            `/api/news?date=${encodeURIComponent(stupidDateFormat)}&country=${encodeURIComponent(submittedCountry)}`
        );
        const data = await response.json();
        bdayData.newsArticles = data;
        ChangeLoadingText("Getting weather...", "red");
    } catch (error) {
        console.error(error);
        errorText.innerHTML = error;
    }
}

function ChangeLoadingText(text, _color) {
    document.getElementById("loading-text").innerHTML = text;
    document.getElementById("loading-text").style.color = _color;
}