





function CheckDataValid() {
    const bdayData = JSON.parse(localStorage.getItem("BdayData"));
    if (!bdayData) window.location.href = "index.html";
}
CheckDataValid();