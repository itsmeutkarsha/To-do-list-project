let streak = 0;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
        console.log('Service Worker Registered!', reg);
    }).catch(function(err) {
        console.log('Service Worker registration failed: ', err);
    });
}

const ctx = document.getElementById('progressChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Completed Tasks', 'Remaining Tasks'],
        datasets: [{
            label: 'Task Progress',
            data: [0, 1],
            backgroundColor: ['#36A2EB', '#FF6384'],
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, 
        cutoutPercentage: 50, 
        animation: {
            duration: 0 
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.label + ': ' + tooltipItem.raw;
                    }
                }
            }
        }
    }
});


function addTask(taskText = null) {
    const taskInput = document.getElementById("taskInput");
    const notifyTimeInput = document.getElementById("notifyTime");
    const taskCategory = document.getElementById("taskCategory");
    const task = taskText || taskInput.value.trim();
    const notifyTime = notifyTimeInput.value;

    if (task === "") {
        alert("Please enter a task!");
        return;
    }

    const taskList = document.getElementById("taskList");

    const newTask = document.createElement("li");
    newTask.textContent = `${task} (${taskCategory.value})`;

    newTask.addEventListener("click", function() {
        this.classList.toggle("completed");
        updateChart();
        if (this.classList.contains("completed")) {
            updateStreak();
        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", function() {
        taskList.removeChild(newTask);
        updateChart();
    });

    newTask.appendChild(deleteButton);
    taskList.appendChild(newTask);

    taskInput.value = "";
    notifyTimeInput.value = "";

    updateChart();

    if (notifyTime) {
        scheduleNotification(task, notifyTime);
        sendNotificationToServer(task, notifyTime);
    }
}

function updateChart() {
    const totalTasks = document.querySelectorAll("#taskList li").length;
    const completedTasks = document.querySelectorAll("#taskList li.completed").length;

    chart.data.datasets[0].data = [completedTasks, totalTasks - completedTasks];
    chart.update();
}

function updateStreak() {
    streak++;
    document.getElementById('streakDisplay').textContent = `Streak: ${streak}`;
}

function scheduleNotification(task, notifyTime) {
    const notifyDate = new Date(notifyTime);
    const now = new Date();
    const timeDifference = notifyDate - now;

    if (timeDifference > 0) {
        setTimeout(function() {
            new Notification(`Reminder: ${task}`);
        }, timeDifference);
    } else {
        alert("Please choose a future date and time for the notification.");
    }
}


window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.lang = 'en-US';

recognition.addEventListener('result', function(event) {
    const transcript = event.results[0][0].transcript.trim();
    console.log('Voice input received: ', transcript);
    addTask(transcript); 
});

recognition.addEventListener('end', recognition.stop);

function startVoiceInput() {
    recognition.start();
}


document.getElementById('voiceInputBtn').addEventListener('click', startVoiceInput);
