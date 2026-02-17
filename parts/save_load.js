/* ============================================ */
/* SAVE/LOAD SYSTEM - LocalStorage Persistence */
/* ============================================ */

// LocalStorage key for the saved game
var SAVE_KEY = 'forensic_detective_save';

/* ============================================ */
function saveGame() {
	/* Save the current gameState to localStorage.
	   Creates a clean copy without the timerInterval reference
	   (which is non-serializable) and stores it as JSON.
	   Shows a brief "Game Saved" notification on success. */

	// Build a clean copy of gameState without the interval handle
	var saveData = {};
	var keys = Object.keys(gameState);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		// Skip the interval ID since it cannot be serialized
		if (key === 'timerInterval') {
			continue;
		}
		saveData[key] = gameState[key];
	}

	// Add a save timestamp for display purposes
	saveData.savedAt = Date.now();

	// Serialize and store
	var jsonStr = JSON.stringify(saveData);
	localStorage.setItem(SAVE_KEY, jsonStr);

	// Show a brief success notification
	showNotification('Game Saved', 'success');
}

/* ============================================ */
function loadGame() {
	/* Load gameState from localStorage.
	   Reads the saved JSON, parses it, and restores all fields
	   onto the global gameState object. Does NOT restart the timer;
	   the caller is responsible for resuming any active timer.

	Returns:
		boolean: true if a saved game was found and loaded,
		         false if no save exists or parsing failed
	*/
	var jsonStr = localStorage.getItem(SAVE_KEY);
	if (!jsonStr) {
		return false;
	}

	var saveData = null;
	try {
		saveData = JSON.parse(jsonStr);
	} catch (e) {
		return false;
	}

	if (!saveData || typeof saveData !== 'object') {
		return false;
	}

	// Restore each saved field onto the global gameState
	var keys = Object.keys(saveData);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		// Skip internal save metadata
		if (key === 'savedAt') {
			continue;
		}
		gameState[key] = saveData[key];
	}

	// Ensure the timer interval is clean after loading
	gameState.timerInterval = null;
	gameState.timerRunning = false;

	return true;
}

/* ============================================ */
function loadAndResumeGame() {
	/* Called from the title screen "Continue Investigation" button.
	   Attempts to load a saved game and transition to the
	   appropriate phase. If no save is found, shows an error modal. */

	var loaded = loadGame();

	if (!loaded) {
		showModal(
			'No Saved Game',
			'<p>No saved investigation was found.</p>' +
			'<p>Start a new investigation to begin.</p>'
		);
		return;
	}

	// Transition to whichever phase the player was in when they saved
	var resumePhase = gameState.phase;

	// Validate the phase is a real game phase (not title or setup)
	if (resumePhase === PHASE.TITLE || resumePhase === PHASE.SETUP) {
		// If saved during setup or title, restart from setup
		transitionTo(PHASE.SETUP);
		return;
	}

	// Update header displays before transitioning
	updateRoundDisplay();
	updateScoreDisplay();
	updateSuspectCards();

	// Transition to the saved phase
	transitionTo(resumePhase);
}

/* ============================================ */
function deleteSave() {
	/* Remove the saved game from localStorage.
	   Silently succeeds even if no save exists. */
	localStorage.removeItem(SAVE_KEY);
}

/* ============================================ */
function hasSavedGame() {
	/* Check whether a saved game exists in localStorage.
	   Used to show or hide the "Continue" button on the title screen.

	Returns:
		boolean: true if a saved game is present, false otherwise
	*/
	var jsonStr = localStorage.getItem(SAVE_KEY);
	if (!jsonStr) {
		return false;
	}
	// Verify the stored data is valid JSON
	try {
		var parsed = JSON.parse(jsonStr);
		return (parsed && typeof parsed === 'object');
	} catch (e) {
		return false;
	}
}
