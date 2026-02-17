/* ============================================ */
/* TIMER SYSTEM - Countdown and Display        */
/* ============================================ */

/* ============================================ */
function startTimer(seconds, onExpireCallback) {
	/* Start the countdown timer from the given number of seconds.
	   Updates gameState timer fields and begins a one-second interval
	   that decrements the counter each tick.

	Args:
		seconds: integer number of seconds for the countdown
		onExpireCallback: function called when the timer reaches zero
	*/
	// Store the timer configuration in gameState
	gameState.timerSeconds = seconds;
	gameState.timerMax = seconds;
	gameState.timerRunning = true;

	// Clear any existing interval before starting a new one
	if (gameState.timerInterval) {
		clearInterval(gameState.timerInterval);
	}

	// Render the initial display immediately
	updateTimerDisplay();

	// Start the one-second countdown interval
	gameState.timerInterval = setInterval(function() {
		gameState.timerSeconds--;
		updateTimerDisplay();

		// Check for timer expiration
		if (gameState.timerSeconds <= 0) {
			gameState.timerSeconds = 0;
			stopTimer();
			if (typeof onExpireCallback === 'function') {
				onExpireCallback();
			}
		}
	}, 1000);
}

/* ============================================ */
function stopTimer() {
	/* Stop the timer completely and clear the interval.
	   Resets timerRunning to false but preserves the current
	   timerSeconds value for display purposes. */
	if (gameState.timerInterval) {
		clearInterval(gameState.timerInterval);
		gameState.timerInterval = null;
	}
	gameState.timerRunning = false;
}

/* ============================================ */
function pauseTimer() {
	/* Pause the timer without resetting the remaining seconds.
	   Clears the interval but keeps timerSeconds at its current
	   value so resumeTimer() can pick up where it left off. */
	if (gameState.timerInterval) {
		clearInterval(gameState.timerInterval);
		gameState.timerInterval = null;
	}
	gameState.timerRunning = false;
}

/* ============================================ */
function resumeTimer(onExpireCallback) {
	/* Resume the timer from the current timerSeconds value.
	   Starts a new interval that continues counting down from
	   wherever the timer was paused.

	Args:
		onExpireCallback: function called when the timer reaches zero
	*/
	// Do not resume if there is no time left
	if (gameState.timerSeconds <= 0) {
		return;
	}

	gameState.timerRunning = true;

	// Clear any stale interval just in case
	if (gameState.timerInterval) {
		clearInterval(gameState.timerInterval);
	}

	// Start the countdown from the current remaining value
	gameState.timerInterval = setInterval(function() {
		gameState.timerSeconds--;
		updateTimerDisplay();

		// Check for timer expiration
		if (gameState.timerSeconds <= 0) {
			gameState.timerSeconds = 0;
			stopTimer();
			if (typeof onExpireCallback === 'function') {
				onExpireCallback();
			}
		}
	}, 1000);
}

/* ============================================ */
function updateTimerDisplay() {
	/* Update the visual timer bar and text in the game header.
	   Sets the #timer-bar-fill width as a percentage of time remaining.
	   Sets #timer-text to "M:SS" format.
	   Changes color based on fraction remaining:
	     green (>60%), yellow (30-60%), red (<30%).
	   Adds CSS class 'timer-critical' when <15% and
	   'timer-warning' when <30% for animation triggers. */
	var barFill = document.getElementById('timer-bar-fill');
	var timerText = document.getElementById('timer-text');

	// Guard against missing DOM elements
	if (!barFill || !timerText) {
		return;
	}

	// Calculate the fraction of time remaining
	var fraction = 0;
	if (gameState.timerMax > 0) {
		fraction = gameState.timerSeconds / gameState.timerMax;
	}

	// Clamp fraction to valid range
	if (fraction < 0) {
		fraction = 0;
	}
	if (fraction > 1) {
		fraction = 1;
	}

	// Set the bar width as a percentage
	var widthPercent = Math.round(fraction * 100);
	barFill.style.width = widthPercent + '%';

	// Set the bar color based on remaining time fraction
	var color = getTimerColor(fraction);
	barFill.style.backgroundColor = color;

	// Format the remaining seconds as M:SS
	var totalSeconds = Math.max(0, gameState.timerSeconds);
	var minutes = Math.floor(totalSeconds / 60);
	var seconds = totalSeconds % 60;
	var secondsStr = (seconds < 10) ? '0' + seconds : String(seconds);
	timerText.textContent = minutes + ':' + secondsStr;

	// Apply CSS classes for warning and critical animations
	var timerContainer = document.getElementById('timer-container');
	if (timerContainer) {
		// Remove existing state classes first
		timerContainer.classList.remove('timer-warning');
		timerContainer.classList.remove('timer-critical');

		// Add appropriate class based on fraction remaining
		if (fraction < 0.15) {
			timerContainer.classList.add('timer-critical');
		} else if (fraction < 0.30) {
			timerContainer.classList.add('timer-warning');
		}
	}
}

/* ============================================ */
function getTimerColor(fraction) {
	/* Returns a CSS color string based on the fraction of time remaining.

	Args:
		fraction: number between 0.0 and 1.0 representing time left

	Returns:
		string: hex color code
		  >0.6  -> '#4caf50' (green)
		  0.3-0.6 -> '#ff9800' (yellow/orange)
		  <0.3  -> '#f44336' (red)
	*/
	if (fraction > 0.6) {
		return '#4caf50';
	}
	if (fraction >= 0.3) {
		return '#ff9800';
	}
	return '#f44336';
}
