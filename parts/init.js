/* ============================================ */
/* INIT - Main Entry Point and Game Bootstrap  */
/* ============================================ */

/* ============================================ */
function initGame() {
	/* Main initialization function called when the DOM is ready.
	   Checks for a saved game to show or hide the continue button,
	   sets up keyboard shortcuts, and displays the title screen. */

	// 1. Check for a saved game and toggle the continue button
	var loadBtn = document.getElementById('btn-load-game');
	if (loadBtn) {
		if (hasSavedGame()) {
			loadBtn.style.display = 'inline-block';
		} else {
			loadBtn.style.display = 'none';
		}
	}

	// 2. Set up keyboard event listeners for shortcuts
	document.addEventListener('keydown', handleKeyboardShortcut);

	// 3. Show the title screen as the initial view
	transitionTo(PHASE.TITLE);
}

/* ============================================ */
function handleKeyboardShortcut(event) {
	/* Handle keyboard shortcut presses for navigation and modal control.
	   Escape closes the modal if open. Number keys 1-3 navigate
	   between game phases when in an active game phase.

	Args:
		event: KeyboardEvent from the keydown listener
	*/

	var key = event.key;

	// Escape: close modal if open
	if (key === 'Escape') {
		var overlay = document.getElementById('modal-overlay');
		if (overlay && !overlay.classList.contains('modal-hidden')) {
			closeModal();
			return;
		}
	}

	// Only process navigation shortcuts during active game phases
	var activePhases = [PHASE.SCENE, PHASE.LAB, PHASE.CASE_BOARD];
	var isActivePhase = false;
	for (var i = 0; i < activePhases.length; i++) {
		if (gameState.phase === activePhases[i]) {
			isActivePhase = true;
			break;
		}
	}
	if (!isActivePhase) {
		return;
	}

	// Do not intercept keys when the user is typing in an input field
	var activeElement = document.activeElement;
	if (activeElement) {
		var tagName = activeElement.tagName.toLowerCase();
		if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
			return;
		}
	}

	// Number key navigation
	if (key === '1') {
		// Go to scene investigation
		enterScenePhase();
	} else if (key === '2') {
		// Go to laboratory
		enterLabPhase();
	} else if (key === '3') {
		// Go to case board
		enterCaseBoard();
	}
}

/* ============================================ */
// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);
