let timeLeft;
let timerId = null;
let isWorkMode = true;
let isNightMode = false;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const workButton = document.getElementById('work');
const breakButton = document.getElementById('break');
const nightModeButton = document.getElementById('night-mode');

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0; // Reset sound to start
    sound.play();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function startTimer() {
    playSound('start-sound');
    if (timerId === null) {
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                alert(isWorkMode ? 'Work session completed! Take a break!' : 'Break is over! Back to work!');
                resetTimer();
            }
        }, 1000);
        startButton.textContent = 'Pause';
    } else {
        clearInterval(timerId);
        timerId = null;
        startButton.textContent = 'Start';
    }
}

function resetTimer() {
    playSound('reset-sound');
    clearInterval(timerId);
    timerId = null;
    timeLeft = isWorkMode ? 25 * 60 : 5 * 60;
    updateDisplay();
    startButton.textContent = 'Start';
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

// Initialize
timeLeft = 25 * 60;
updateDisplay();

// Event listeners
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
workButton.addEventListener('click', () => switchMode('work'));
breakButton.addEventListener('click', () => switchMode('break'));
nightModeButton.addEventListener('click', toggleNightMode); 