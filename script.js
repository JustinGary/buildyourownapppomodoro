let timeLeft;
let timerId = null;
let isWorkMode = true;
let isNightMode = true;

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
        // Show first uncompleted task
        const firstUncompletedTask = [task1Input, task2Input, task3Input].find((input, index) => 
            !checkboxes[index].checked && input.value.trim()
        );
        
        if (firstUncompletedTask) {
            activeTaskDisplay.textContent = firstUncompletedTask.value;
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
        task1: { text: task1Input.value, completed: checkboxes[0].checked },
        task2: { text: task2Input.value, completed: checkboxes[1].checked },
        task3: { text: task3Input.value, completed: checkboxes[2].checked }
    };
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('pomodoroTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        task1Input.value = tasks.task1?.text || '';
        task2Input.value = tasks.task2?.text || '';
        task3Input.value = tasks.task3?.text || '';
        
        checkboxes[0].checked = tasks.task1?.completed || false;
        checkboxes[1].checked = tasks.task2?.completed || false;
        checkboxes[2].checked = tasks.task3?.completed || false;
        
        updateTaskStyles();
    }
}

function updateTaskStyles() {
    checkboxes.forEach((checkbox, index) => {
        const taskRow = checkbox.parentElement;
        taskRow.classList.toggle('completed', checkbox.checked);
    });
}

function showCompletionModal() {
    const isWorkComplete = isWorkMode;
    
    modalTitle.textContent = isWorkComplete ? 
        '🎉 Work Session Complete!' : 
        '⏰ Break Time Over!';
    
    let message = '';
    if (isWorkComplete) {
        const completedTasks = checkboxes.filter(cb => cb.checked).length;
        const totalTasks = checkboxes.filter((_, i) => task1Input.value.trim() || task2Input.value.trim() || task3Input.value.trim()).length;
        message = `You've completed ${completedTasks} out of ${totalTasks} tasks.\n`;
        message += 'Time for a well-deserved break!';
    } else {
        message = 'Ready to get back to work?';
    }
    
    modalMessage.textContent = message;
    modalAction.textContent = isWorkComplete ? 'Start Break' : 'Start Work';
    completionModal.classList.remove('hidden');
    
    // Play completion sound
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
    switchMode(isWorkMode ? 'break' : 'work');
    completionModal.classList.add('hidden');
    startTimer();
});

modalClose.addEventListener('click', () => {
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
 