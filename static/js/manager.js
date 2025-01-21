
        const BASE_URL = "https://voice-leave-app.onrender.com";
        async function fetchLeaveApplications() {
            try {
                const response = await fetch(`${BASE_URL}/get_leave_applications`);
                const applications = await response.json();

                const tableBody = document.querySelector('#applications-table tbody');
                tableBody.innerHTML = '';  // Clear any existing rows

                applications.forEach(application => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${application.employee_name}</td>
                        <td>${application.leave_type}</td>
                        <td>${application.from_date}</td>
                        <td>${application.to_date}</td>
                        <td>${application.status || 'Pending'}</td>
                        <td>
                            <button class="voice-btn" onclick="handleVoiceCommand(${application.id})">🎤</button>
                            <div class="description-box" id="description-box-${application.id}" style="display: none;">
                                <textarea placeholder="Enter reason for rejection" id="description-${application.id}" rows="3" style="width: calc(100% - 40px);"></textarea>
                                <button class="voice-btn" onclick="fillDescription(${application.id})">🎤</button>
                                <button onclick="submitRejection(${application.id})">Submit</button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error fetching leave applications:', error);
            }
        }

        function handleVoiceCommand(applicationId) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.start();

            recognition.onresult = function (event) {
                const command = event.results[0][0].transcript.toLowerCase();
                if (command.includes('approve')) {
                    approveLeave(applicationId);
                } else if (command.includes('reject')) {
                    const descriptionBox = document.getElementById(`description-box-${applicationId}`);
                    descriptionBox.style.display = 'block'; // Show the description box
                } else {
                    alert('Command not recognized. Please say "approve" or "reject".');
                }
            };

            recognition.onerror = function (event) {
                alert('Error capturing voice input: ' + event.error);
            };
        }

        function fillDescription(applicationId) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.start();

            recognition.onresult = function (event) {
                const text = event.results[0][0].transcript;
                const descriptionBox = document.getElementById(`description-${applicationId}`);
                descriptionBox.value = text; // Set the value of the description box
            };

            recognition.onerror = function (event) {
                alert('Error capturing voice input for description: ' + event.error);
            };
        }

        async function approveLeave(id) {
            try {
                const response = await fetch(`${BASE_URL}/approve_leave`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                });

                const result = await response.json();
                alert(result.message);  // Show success message
                fetchLeaveApplications();  // Refresh the table
            } catch (error) {
                alert('Error approving leave: ' + error.message);
            }
        }

        async function submitRejection(id) {
            const description = document.getElementById(`description-${id}`).value;
            if (!description) {
                alert('Please provide a reason for rejection.');
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/reject_leave`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id, description })
                });

                const result = await response.json();
                alert(result.message);  // Show success message
                fetchLeaveApplications();  // Refresh the table
            } catch (error) {
                alert('Error rejecting leave: ' + error.message);
            }
        }

        // Fetch leave applications when the page loads
        fetchLeaveApplications();
    