// Constants
const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let selectedDate = null;
let selectedHour = null;

// Function to render the calendar UI
function renderCalendar() {
  const calendarContainer = document.getElementById("calendar");

  // Create the table element for the calendar
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");

  // Create header cells with the weekday names
  for (const day of WEEK_DAYS) {
    const cell = document.createElement("th");
    cell.textContent = day;
    headerRow.appendChild(cell);
  }

  table.appendChild(headerRow);

  // Create cells for each hour of the day
  for (let hour = 9; hour <= 17; hour++) {
    const row = document.createElement("tr");

    for (let day = 0; day < WEEK_DAYS.length; day++) {
      const cell = document.createElement("td");
      cell.setAttribute("data-day", day);
      cell.setAttribute("data-hour", hour);
      cell.addEventListener("click", onCellClick);
      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  calendarContainer.appendChild(table);
}

// Function to handle cell click event
function onCellClick(event) {
  const day = event.target.getAttribute("data-day");
  const hour = event.target.getAttribute("data-hour");

  // Implement logic to show a popup or input form to add information for the selected day and hour
  selectedDate = calculateSelectedDate(day);
  selectedHour = hour;

  // Implement logic to show a popup or input form to add information for the selected day and hour
  // For simplicity, let's use the browser's built-in prompt to get user input
  const information = prompt("Enter information:");
  if (information !== null) {
    addInformation(selectedDate, selectedHour, information);
  }
}

// Function to add information to the Google Sheet
async function addInformation(date, hour, information) {
  // Implement logic to send data to the back-end and add it to the Google Sheet
  // You can use fetch() to make a POST request to the back-end endpoint that handles data addition.
  const data = {
    date: date.toISOString().split("T")[0], // Convert to 'YYYY-MM-DD' format
    hour,
    information,
  };

  try {
    const response = await fetch("/add_info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to add information to the Google Sheet.");
    }
    alert("Information added successfully!");
  } catch (error) {
    console.error(error);
    alert("An error occurred while adding information.");
  }
}

// Function to display information for the selected week
async function displayInformation() {
  // Implement logic to fetch data from the back-end and display it in the grid format
  // You can use fetch() to make a GET request to the back-end endpoint that retrieves data from the Google Sheet.
  try {
    const response = await fetch("/get_info", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve information from the Google Sheet.");
    }

    const data = await response.json();
    displayDataInGrid(data.data);
  } catch (error) {
    console.error(error);
    alert("An error occurred while retrieving information.");
  }
}

function displayDataInGrid(data) {
  // Clear existing grid, if any
  const gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = "";

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  const headerDateCell = document.createElement("th");
  headerDateCell.textContent = "Date";
  headerRow.appendChild(headerDateCell);

  for (const day of WEEK_DAYS) {
    const cell = document.createElement("th");
    cell.textContent = day;
    headerRow.appendChild(cell);
  }

  table.appendChild(headerRow);
  const groupedData = {};
  data.forEach((item) => {
    const key = `${item.date}-${item.hour}`;
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(item.information);
  });
  const today = new Date();
  for (let i = 0; i < WEEK_DAYS.length; i++) {
    const row = document.createElement("tr");
    const dateCell = document.createElement("td");
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dateCell.textContent = date.toISOString().split("T")[0];
    row.appendChild(dateCell);

    for (let hour = 9; hour <= 17; hour++) {
      const cell = document.createElement("td");
      const key = `${date.toISOString().split("T")[0]}-${hour}`;
      const informationList = groupedData[key] || [];
      cell.textContent = informationList.join("\n");
      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  gridContainer.appendChild(table);
}
