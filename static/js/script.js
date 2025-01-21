
const BASE_URL = "https://voice-leave-app.onrender.com";
const leaveTypeElement = document.getElementById("leave-type");
const fromDateCombinedElement =
  document.getElementById("from-date-combined");
const toDateCombinedElement = document.getElementById("to-date-combined");
const responseElement = document.getElementById("response");
const micIcon = document.getElementById("start-voice");
const listeningIcon = document.getElementById("listening-icon");

let leaveType = "";
let fromDate = "";
let toDate = "";
let errorMessages = [];

const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;

// Function to check if a date is valid for a specific month and year
function isValidDate(day, month, year) {
  const daysInMonth = {
    "01": 31,
    "02": new Date(year, 1, 29).getDate() === 29 ? 29 : 28,
    "03": 31,
    "04": 30,
    "05": 31,
    "06": 30,
    "07": 31,
    "08": 31,
    "09": 30,
    "10": 31,
    "11": 30,
    "12": 31,
  };
  return day >= 1 && day <= daysInMonth[month];
}

// Compare "To" date and "From" date
function isFromBeforeTo(fromDate, toDate) {
  return new Date(fromDate) <= new Date(toDate);
}

// Check if a date is in the past
function isPastDate(date) {
  const today = new Date();
  const inputDate = new Date(date);
  return inputDate < today.setHours(0, 0, 0, 0); // Consider only the date, not time
}
  listeningIcon.style.display = "none" //making ;istening disabled
micIcon.addEventListener("click", () => {
  listeningIcon.style.display = "inline";
  micIcon.style.display = "none";
  responseElement.textContent = "Listening for voice input...";
  recognition.start();
});

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.toLowerCase();
  responseElement.textContent = `You said: "${transcript}"`;

  const leaveTypeRegex = /(sick|vacation|casual|emergency)/i;
  const dateRegex =
    /\b(\d{1,2})\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec)\b/g;

  const leaveTypeMatch = transcript.match(leaveTypeRegex);
  if (leaveTypeMatch) {
    leaveType = leaveTypeMatch[0].trim();
    leaveTypeElement.value = leaveType;
  }

  const dateMatches = [...transcript.matchAll(dateRegex)];
  if (dateMatches.length >= 2) {
    const months = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    const fromDay = parseInt(dateMatches[0][1]);
    const fromMonth = months[dateMatches[0][2].toLowerCase()];
    const fromYear = 2025;

    if (!isValidDate(fromDay, fromMonth, fromYear)) {
      errorMessages.push(
        `Invalid "From" date. Please check the day for ${dateMatches[0][2]} ${fromYear}.`
      );
      return;
    }

    fromDate = `${fromYear}-${fromMonth}-${fromDay
      .toString()
      .padStart(2, "0")}`;
    fromDateCombinedElement.value = fromDate;

    const toDay = parseInt(dateMatches[1][1]);
    const toMonth = months[dateMatches[1][2].toLowerCase()];
    const toYear = 2025; // Automatically set the year to 2025

    if (!isValidDate(toDay, toMonth, toYear)) {
      errorMessages.push(
        `Invalid "To" date. Please check the day for ${dateMatches[1][2]} ${toYear}.`
      );
      return;
    }

    toDate = `${toYear}-${toMonth}-${toDay.toString().padStart(2, "0")}`;
    toDateCombinedElement.value = toDate;

    // Check if "From" date is in the past
    if (isPastDate(fromDate)) {
      errorMessages.push('"From" date cannot be in the past.');
      return;
    }

    // Check if "To" date is in the past
    if (isPastDate(toDate)) {
      errorMessages.push('"To" date cannot be in the past.');
      return;
    }

    // Check if "To" date is before "From" date
    if (!isFromBeforeTo(fromDate, toDate)) {
      errorMessages.push(
        '"To" date should not be earlier than "From" date.'
      );
      return;
    }
  } else {
    errorMessages.push("Please mention both From Date and To Date.");
  }

  listeningIcon.style.display = "none";
  micIcon.style.display = "inline";

  if (errorMessages.length > 0) {
    responseElement.textContent = errorMessages.join(" ");
  }
};

recognition.onerror = (event) => {
  errorMessages.push(`Error: ${event.error}`);
  listeningIcon.style.display = "none";
  micIcon.style.display = "inline";

  responseElement.textContent = errorMessages.join(" ");
};

document
  .getElementById("submit-leave")
  .addEventListener("click", async () => {
    if (errorMessages.length > 0 || !leaveType || !fromDate || !toDate) {
      responseElement.textContent =
        "Please fix the errors before submitting.";
      return;
    }

    const data = {
      employee_name: "Mr . employee name",
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
    };

    try {
      const response = await fetch(`${BASE_URL}/apply_leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        responseElement.textContent = result.message; // Success message
      } else {
        const error = await response.json();
        responseElement.textContent = `Error: ${error.detail}`; // Error details
      }
    } catch (error) {
      responseElement.textContent = `Error applying leave: ${error.message}`; // Network error
    }
  });
