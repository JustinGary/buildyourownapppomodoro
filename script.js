let timeLeft;
let timerId = null;
let isWorkMode = true;
let isNightMode = true;
let sessionsToday = 0;
let lastSessionDate = new Date().toDateString();

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const workButton = document.getElementById('work');
const breakButton = document.getElementById('break');
const nightModeButton = document.getElementById('night-mode');
const task1Input = document.getElementById('task1');
const task2Input = document.getElementById('task2');
const task3Input = document.getElementById('task3');
const currentTaskDiv = document.getElementById('current-task');
const activeTaskDisplay = document.getElementById('active-task');
const checkboxes = [
    document.getElementById('check1'),
    document.getElementById('check2'),
    document.getElementById('check3')
];
const completionModal = document.getElementById('completion-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalAction = document.getElementById('modal-action');
const modalClose = document.getElementById('modal-close');
const minutesUp = document.getElementById('minutes-up');
const minutesDown = document.getElementById('minutes-down');
const secondsUp = document.getElementById('seconds-up');
const secondsDown = document.getElementById('seconds-down');
const deleteButtons = document.querySelectorAll('.delete-task');

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0; // Reset sound to start
    sound.play();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer display
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    // Update page title with timer and mode
    const mode = isWorkMode ? 'Work' : 'Break';
    document.title = `${timeString} - ${mode} - Focus Block Timer`;
    
    updateTimeControls();
}

function startTimer() {
    playSound('start-sound');
    if (timerId === null) {
        // Only show task during work mode
        if (isWorkMode) {
            const firstUncompletedTask = [task1Input, task2Input, task3Input].find((input, index) => 
                !checkboxes[index].checked && input.value.trim()
            );
            
            if (firstUncompletedTask) {
                activeTaskDisplay.textContent = firstUncompletedTask.value;
                currentTaskDiv.classList.remove('hidden');
            }
        } else {
            // Show break time message
            activeTaskDisplay.textContent = "Break Time! 🎉";
            currentTaskDiv.querySelector('h3').textContent = "Current Mode:";
            currentTaskDiv.classList.remove('hidden');
        }
        
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
                handleSessionComplete();
            }
        }, 1000);
        startButton.textContent = 'Pause';
        updateTimeControls();
    } else {
        clearInterval(timerId);
        timerId = null;
        startButton.textContent = 'Start';
        updateTimeControls();
    }
}

function resetTimer() {
    playSound('reset-sound');
    clearInterval(timerId);
    timerId = null;
    timeLeft = isWorkMode ? 25 * 60 : 5 * 60;
    updateDisplay();
    startButton.textContent = 'Start';
    currentTaskDiv.classList.add('hidden');
}

function switchMode(mode) {
    playSound('mode-switch-sound');
    isWorkMode = mode === 'work';
    workButton.classList.toggle('active', isWorkMode);
    breakButton.classList.toggle('active', !isWorkMode);
    
    // Update display for break mode
    if (!isWorkMode) {
        currentTaskDiv.classList.remove('hidden');
        activeTaskDisplay.textContent = "Break Time! 🎉";
        currentTaskDiv.querySelector('h3').textContent = "Current Mode:";
    } else {
        currentTaskDiv.classList.add('hidden');
        currentTaskDiv.querySelector('h3').textContent = "Current Focus:";
    }
    
    resetTimer();
}

function toggleNightMode() {
    playSound('mode-switch-sound');
    isNightMode = !isNightMode;
    document.body.classList.toggle('night-mode', isNightMode);
    nightModeButton.textContent = isNightMode ? 'Light Mode' : 'Night Mode';
}

function saveTasks() {
    const tasks = {
        task1: { 
            text: task1Input.value, 
            completed: checkboxes[0].checked,
            sessions: task1Input.dataset.sessions || 0
        },
        task2: { 
            text: task2Input.value, 
            completed: checkboxes[1].checked,
            sessions: task2Input.dataset.sessions || 0
        },
        task3: { 
            text: task3Input.value, 
            completed: checkboxes[2].checked,
            sessions: task3Input.dataset.sessions || 0
        }
    };
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('pomodoroTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        
        [task1Input, task2Input, task3Input].forEach((input, index) => {
            const taskNum = index + 1;
            const task = tasks[`task${taskNum}`];
            input.value = task?.text || '';
            input.dataset.sessions = task?.sessions || 0;
            checkboxes[index].checked = task?.completed || false;
        });
        
        updateTaskStyles();
        initializeTaskDisplays();
    }
}

function updateTaskDisplay(input, index) {
    const sessions = parseInt(input.dataset.sessions) || 0;
    const sessionText = sessions > 0 ? ` (${sessions} blocks)` : '';
    const taskRow = input.parentElement;
    const sessionCount = taskRow.querySelector('.session-count') || document.createElement('span');
    sessionCount.className = 'session-count';
    sessionCount.textContent = sessionText;
    if (!taskRow.querySelector('.session-count')) {
        taskRow.appendChild(sessionCount);
    }
}

function updateTaskStyles() {
    checkboxes.forEach((checkbox, index) => {
        const taskRow = checkbox.parentElement;
        taskRow.classList.toggle('completed', checkbox.checked);
    });
}

function showCompletionModal() {
    if (isWorkMode) {
        sessionsToday++;
        saveSessionsCount();
        
        modalTitle.textContent = '🎉 Work Session Complete!';
        modalMessage.textContent = `Great job! You've completed ${sessionsToday} focus block${sessionsToday === 1 ? '' : 's'} today.`;
        
        // Check if there's an active task
        const activeTask = activeTaskDisplay.textContent;
        if (activeTask) {
            modalMessage.textContent += '\n\nDid you complete your task?';
            modalAction.textContent = 'Yes, Task Complete!';
            modalClose.textContent = 'Not Yet';
        } else {
            modalAction.textContent = 'Start Break';
            modalClose.textContent = 'Close';
        }
    } else {
        modalTitle.textContent = '⏰ Break Time Over!';
        modalMessage.textContent = 'Ready to get back to work?';
        modalAction.textContent = 'Start Work';
        modalClose.textContent = 'Close';
    }
    
    completionModal.classList.remove('hidden');
    playSound('completion-sound');
}

function handleSessionComplete() {
    clearInterval(timerId);
    timerId = null;
    showCompletionModal();
}

function adjustTime(amount) {
    if (timerId !== null) return; // Don't adjust while timer is running
    
    timeLeft += amount;
    
    // Ensure timeLeft stays within reasonable bounds (1 second to 60 minutes)
    timeLeft = Math.max(1, Math.min(timeLeft, 60 * 60));
    
    updateDisplay();
    playSound('mode-switch-sound');
}

function updateTimeControls() {
    const isRunning = timerId !== null;
    
    // Disable all controls while timer is running
    minutesUp.disabled = isRunning;
    minutesDown.disabled = isRunning;
    secondsUp.disabled = isRunning;
    secondsDown.disabled = isRunning;
    
    // Disable up/down based on limits
    minutesUp.disabled = isRunning || timeLeft >= 60 * 60;
    minutesDown.disabled = isRunning || timeLeft <= 60;
    secondsUp.disabled = isRunning || timeLeft % 60 === 59;
    secondsDown.disabled = isRunning || timeLeft <= 1;
}

// Initialize
timeLeft = 25 * 60;
document.body.classList.add('night-mode');
nightModeButton.textContent = 'Light Mode';
updateDisplay();

// Event listeners
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
workButton.addEventListener('click', () => switchMode('work'));
breakButton.addEventListener('click', () => switchMode('break'));
nightModeButton.addEventListener('click', toggleNightMode);
task1Input.addEventListener('change', saveTasks);
task2Input.addEventListener('change', saveTasks);
task3Input.addEventListener('change', saveTasks);

checkboxes.forEach((checkbox, index) => {
    checkbox.addEventListener('change', () => {
        updateTaskStyles();
        saveTasks();
    });
});

loadTasks();

// Add modal button event listeners
modalAction.addEventListener('click', () => {
    if (isWorkMode) {
        const activeTask = activeTaskDisplay.textContent;
        if (activeTask) {
            // Find the active task
            const taskInputs = [task1Input, task2Input, task3Input];
            const taskIndex = taskInputs.findIndex(input => input.value === activeTask);
            if (taskIndex !== -1) {
                const input = taskInputs[taskIndex];
                // Always increment sessions when work session completes
                input.dataset.sessions = parseInt(input.dataset.sessions || 0) + 1;
                updateTaskDisplay(input, taskIndex);
                
                // Only mark as complete if "Yes, Task Complete!" was clicked
                if (modalAction.textContent === 'Yes, Task Complete!') {
                    checkboxes[taskIndex].checked = true;
                    updateTaskStyles();
                }
                saveTasks();
                playSound('completion-sound');
            }
        }
    }
    
    switchMode(isWorkMode ? 'break' : 'work');
    completionModal.classList.add('hidden');
    if (!isWorkMode) startTimer();
});

modalClose.addEventListener('click', () => {
    if (isWorkMode) {
        const activeTask = activeTaskDisplay.textContent;
        if (activeTask) {
            // Find and increment the active task's session count
            const taskInputs = [task1Input, task2Input, task3Input];
            const taskIndex = taskInputs.findIndex(input => input.value === activeTask);
            if (taskIndex !== -1) {
                const input = taskInputs[taskIndex];
                input.dataset.sessions = parseInt(input.dataset.sessions || 0) + 1;
                updateTaskDisplay(input, taskIndex);
                saveTasks();
            }
            
            // Show encouragement message
            modalTitle.textContent = '💪 Keep Going!';
            modalMessage.textContent = 'Great work on your focus block! Take a short break and come back refreshed to continue working on your task.';
            modalAction.textContent = 'Start Break';
            modalClose.textContent = 'Close';
            
            // Don't hide the modal yet if showing encouragement
            if (modalClose.textContent === 'Not Yet') {
                return;
            }
        }
    }
    completionModal.classList.add('hidden');
});

// Add event listeners for time adjustment
minutesUp.addEventListener('click', () => adjustTime(60));
minutesDown.addEventListener('click', () => adjustTime(-60));
secondsUp.addEventListener('click', () => adjustTime(1));
secondsDown.addEventListener('click', () => adjustTime(-1));

// Add function to handle task deletion
function deleteTask(index) {
    const taskInput = document.getElementById(`task${index + 1}`);
    const checkbox = document.getElementById(`check${index + 1}`);
    
    // Clear the task
    taskInput.value = '';
    checkbox.checked = false;
    
    // Play sound
    playSound('reset-sound');
    
    // Update task styles and save
    updateTaskStyles();
    saveTasks();
    
    // If this was the current focus task, hide the current task display
    if (currentTaskDiv.classList.contains('hidden') === false && 
        activeTaskDisplay.textContent === taskInput.value) {
        currentTaskDiv.classList.add('hidden');
    }
}

// Add event listeners for delete buttons
deleteButtons.forEach((button, index) => {
    button.addEventListener('click', () => deleteTask(index));
});

// Load sessions count from localStorage
function loadSessionsCount() {
    const savedDate = localStorage.getItem('lastSessionDate');
    if (savedDate === new Date().toDateString()) {
        sessionsToday = parseInt(localStorage.getItem('sessionsToday')) || 0;
    } else {
        sessionsToday = 0;
    }
    lastSessionDate = new Date().toDateString();
}

// Save sessions count to localStorage
function saveSessionsCount() {
    localStorage.setItem('sessionsToday', sessionsToday);
    localStorage.setItem('lastSessionDate', lastSessionDate);
}

// Add this to your initialization code
loadSessionsCount();

// Add this function to initialize all task displays
function initializeTaskDisplays() {
    [task1Input, task2Input, task3Input].forEach((input, index) => {
        updateTaskDisplay(input, index);
    });
}

// Add this to your initialization code at the bottom
initializeTaskDisplays();
 