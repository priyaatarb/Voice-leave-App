
const BASE_URL = "https://voice-leave-app.onrender.com";
const leaveTypeElement = document.getElementById("leave-type");
const fromDateCombinedElement =
  document.getElementById("from-date-combined");
const toDateCombinedElement = document.getElementById("to-date-combined");
const responseElement = document.getElementById("response");
const micIcon = document.getElementById("start-voice");
const listeningIcon = document.getElementById("listening-icon");
let isListening = false;//added for reaet button functionality




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

//new regex added to handel dated like ("Twenty first ,21st,new date().yeaar")
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.toLowerCase();
  responseElement.textContent = `You said: "${transcript}"`;

  const leaveTypeRegex = /\b(sick|vacation|casual|emergency|maternity\s*leave|paternity\s*leave|red dot leave)\b/i;

  const dateRegex =
    /\b(\d{1,2})(?:st|nd|rd|th)?(?:\s*(to|-)\s*(\d{1,2})(?:st|nd|rd|th)?)?\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec)?\b/i;

  const leaveTypeMatch = transcript.match(leaveTypeRegex);
  if (leaveTypeMatch) {
    leaveType = leaveTypeMatch[0].trim();
    leaveTypeElement.value = leaveType;
  }

  const dateMatch = transcript.match(dateRegex);
  if (dateMatch) {
    const day1 = parseInt(dateMatch[1]); // First date
    const day2 = dateMatch[4] ? parseInt(dateMatch[4]) : null; // Second date
    const month = dateMatch[5]?.toLowerCase() || null; // Month (if mentioned)

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
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sept: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };

    if (month && months[month]) {
      const currentYear = new Date().getFullYear();
      const parsedMonth = months[month];

      // Handle the "from" date
      if (isValidDate(day1, parsedMonth, currentYear)) {
        fromDate = `${currentYear}-${parsedMonth}-${day1
          .toString()
          .padStart(2, "0")}`;
        fromDateCombinedElement.value = fromDate;
      } else {
        errorMessages.push(`Invalid "From" date: ${day1} ${month}.`);
      }

      // Handle the "to" date (if mentioned)
      if (day2 && isValidDate(day2, parsedMonth, currentYear)) {
        toDate = `${currentYear}-${parsedMonth}-${day2
          .toString()
          .padStart(2, "0")}`;
        toDateCombinedElement.value = toDate;
      } else if (day2) {
        errorMessages.push(`Invalid "To" date: ${day2} ${month}.`);
      }
    } else {
      errorMessages.push("Please specify a valid month.");
    }
  } else {
    errorMessages.push(
      "Please mention the leave dates in a proper format (e.g., '27 to 29 January')."
    );
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

// Reset button functionality Added
// Function to reset all fields and stop recognition
function resetForm() {
  if (isListening) {
    recognition.stop();  // Stop the voice recognition if it's ongoing
    isListening = false;  // Set listening status to false
  }

  // Clear the inputs
  document.getElementById("leave-type").value = "";
  document.getElementById("from-date-combined").value = "";
  document.getElementById("to-date-combined").value = "";

  // Clear the response area
  const responseDiv = document.getElementById("response");
  if (responseDiv) {
    responseDiv.innerHTML = "";
  }

  // Reset the icons
  listeningIcon.style.display = "none";
  micIcon.style.display = "inline";
}

// Add event listener to reset button
document.getElementById("reset").addEventListener("click", resetForm);

document
  .getElementById("submit-leave")
  .addEventListener("click", async () => {
    if (errorMessages.length > 0 || !leaveType || !fromDate || !toDate) {
      responseElement.textContent =
        "Please fix the errors before submitting (check dates wheather dates are incorrect).";
      return;
    }
// document.getElementById('reset').addEventListener('click', function () {
//         location.reload();
//       });


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
