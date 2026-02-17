/* ============================================ */
/* UI RENDERING - DOM Manipulation and Updates  */
/* ============================================ */

// Stored callback for the modal close button
var _modalCloseCallback = null;

/* ============================================ */
function renderSetupScreen() {
	/* Populate the setup screen with difficulty option cards and
	   suspect selection cards. Difficulty cards are clickable to
	   select one. Suspect cards are clickable to toggle selection.
	   The "Begin Investigation" button is enabled when 4-6 suspects
	   are selected. Default difficulty is medium. */

	// -- Difficulty options --
	var diffContainer = document.getElementById('difficulty-options');
	if (diffContainer) {
		var diffHtml = '';
		var diffKeys = ['easy', 'medium', 'hard'];
		for (var d = 0; d < diffKeys.length; d++) {
			var diffKey = diffKeys[d];
			var config = DIFFICULTY_CONFIG[diffKey];
			// Default to medium selected
			var selectedClass = (diffKey === 'medium') ? ' selected' : '';
			diffHtml += '<div class="difficulty-card' + selectedClass + '"';
			diffHtml += ' data-difficulty="' + diffKey + '"';
			diffHtml += ' onclick="selectDifficulty(\'' + diffKey + '\')">';
			diffHtml += '<h4>' + config.label + '</h4>';
			diffHtml += '<p class="diff-description">' + config.description + '</p>';
			diffHtml += '<div class="diff-details">';
			// Format the timer as M:SS
			var timerMin = Math.floor(config.timerSeconds / 60);
			var timerSec = config.timerSeconds % 60;
			var timerStr = timerMin + ':' + ((timerSec < 10) ? '0' + timerSec : timerSec);
			diffHtml += '<span>Timer: ' + timerStr + '</span>';
			diffHtml += '<span>Swabs: ' + config.swabsPerRound + '</span>';
			diffHtml += '<span>Tests: ' + config.testsPerRound + '</span>';
			diffHtml += '</div>';
			diffHtml += '</div>';
		}
		diffContainer.innerHTML = diffHtml;
	}

	// -- Suspect selection --
	var suspectContainer = document.getElementById('suspect-selection');
	if (suspectContainer) {
		var susHtml = '';
		for (var s = 0; s < CHARACTER_POOL.length; s++) {
			var character = CHARACTER_POOL[s];
			susHtml += '<div class="suspect-option"';
			susHtml += ' data-suspect-id="' + character.id + '"';
			susHtml += ' onclick="toggleSuspectSelection(\'' + character.id + '\')">';
			susHtml += '<div class="suspect-name">' + escapeHtml(character.name) + '</div>';
			susHtml += '<div class="suspect-role">' + escapeHtml(character.role) + '</div>';
			susHtml += '<div class="suspect-age">Age: ' + character.age + '</div>';
			susHtml += '</div>';
		}
		suspectContainer.innerHTML = susHtml;
	}

	// Update the suspect count display and button state
	updateSuspectCountDisplay();
}

/* ============================================ */
function selectDifficulty(difficultyKey) {
	/* Handle clicking a difficulty card on the setup screen.
	   Removes .selected from all difficulty cards and adds it
	   to the clicked one.

	Args:
		difficultyKey: string 'easy', 'medium', or 'hard'
	*/
	var cards = document.querySelectorAll('.difficulty-card');
	for (var i = 0; i < cards.length; i++) {
		cards[i].classList.remove('selected');
		if (cards[i].getAttribute('data-difficulty') === difficultyKey) {
			cards[i].classList.add('selected');
		}
	}
}

/* ============================================ */
function toggleSuspectSelection(suspectId) {
	/* Toggle whether a suspect option card is selected on the setup
	   screen. Adds or removes the .selected class and updates
	   the count display and button state.

	Args:
		suspectId: string ID of the suspect to toggle
	*/
	var cards = document.querySelectorAll('.suspect-option');
	for (var i = 0; i < cards.length; i++) {
		if (cards[i].getAttribute('data-suspect-id') === suspectId) {
			cards[i].classList.toggle('selected');
			break;
		}
	}
	updateSuspectCountDisplay();
}

/* ============================================ */
function updateSuspectCountDisplay() {
	/* Update the suspect count text and enable/disable the
	   "Begin Investigation" button based on the current selection
	   count (must be 4-6 suspects). */
	var selected = getSelectedSuspects();
	var count = selected.length;

	// Update count text
	var countDisplay = document.getElementById('suspect-count-display');
	if (countDisplay) {
		countDisplay.textContent = 'Selected: ' + count + ' / 4-6 required';
	}

	// Enable or disable the start button
	var startBtn = document.getElementById('btn-start-case');
	if (startBtn) {
		if (count >= 4 && count <= 6) {
			startBtn.disabled = false;
		} else {
			startBtn.disabled = true;
		}
	}
}

/* ============================================ */
function renderIntroBriefing() {
	/* Fill #intro-content with a dramatic narrative briefing that
	   sets the scene for the investigation. Lists the selected
	   suspects and their claimed alibis. */
	var introEl = document.getElementById('intro-content');
	if (!introEl) {
		return;
	}

	var html = '';

	// Dramatic opening narrative
	html += '<div class="intro-narrative">';
	html += '<h2>Case Briefing</h2>';
	html += '<p class="intro-dramatic">';
	html += 'You have been called to the estate of Dr. Victor Graves, ';
	html += 'a renowned criminologist found dead in his study during ';
	html += 'what was supposed to be an exclusive dinner party.';
	html += '</p>';
	html += '<p>';
	html += 'The local police have secured the scene, but they lack the ';
	html += 'forensic expertise to process the DNA evidence. As a forensic ';
	html += 'investigator, you must collect biological samples, run lab ';
	html += 'analyses, and piece together the evidence to identify the killer ';
	html += 'before they strike again.';
	html += '</p>';
	html += '<p>';
	html += 'The clock is ticking. If you take too long, the killer will ';
	html += 'eliminate another guest. Every round, you must collect evidence ';
	html += 'from the crime scene, analyze it in the laboratory, and update ';
	html += 'your case board with your findings.';
	html += '</p>';
	html += '</div>';

	// Difficulty summary
	var diffConfig = DIFFICULTY_CONFIG[gameState.difficulty];
	html += '<div class="intro-difficulty">';
	html += '<h3>Difficulty: ' + diffConfig.label + '</h3>';
	html += '<p>' + diffConfig.description + '</p>';
	html += '</div>';

	// Suspect profiles with alibis
	html += '<div class="intro-suspects">';
	html += '<h3>Suspects Present at the Dinner Party</h3>';
	html += '<div class="intro-suspect-list">';
	for (var i = 0; i < gameState.suspects.length; i++) {
		var suspect = gameState.suspects[i];
		html += '<div class="intro-suspect-card">';
		html += '<div class="intro-suspect-name">' + escapeHtml(suspect.name) + '</div>';
		html += '<div class="intro-suspect-role">' + escapeHtml(suspect.role) + '</div>';
		html += '<div class="intro-suspect-alibi">';
		html += '<strong>Alibi:</strong> ' + escapeHtml(suspect.alibi);
		html += '</div>';
		html += '<div class="intro-suspect-motive">';
		html += '<strong>Possible motive:</strong> ' + escapeHtml(suspect.motive);
		html += '</div>';
		html += '</div>';
	}
	html += '</div>';
	html += '</div>';

	// Final instruction
	html += '<div class="intro-instruction">';
	html += '<p>';
	html += 'Examine the evidence carefully. Use proper forensic protocols. ';
	html += 'Wear your gloves, label your samples, and let the science guide ';
	html += 'your conclusions. The truth is in the DNA.';
	html += '</p>';
	html += '</div>';

	introEl.innerHTML = html;
}

/* ============================================ */
function updatePhaseDisplay(phaseName) {
	/* Update the #phase-display text in the game header bar.

	Args:
		phaseName: string label for the current phase
	*/
	var phaseEl = document.getElementById('phase-display');
	if (phaseEl) {
		phaseEl.textContent = phaseName;
	}
}

/* ============================================ */
function updatePhaseNav(currentPhase) {
	/* Show or hide phase navigation buttons based on which
	   phase the player is currently in.

	Args:
		currentPhase: string 'scene', 'lab', or 'board'
	*/
	var btnScene = document.getElementById('btn-to-scene');
	var btnLab = document.getElementById('btn-to-lab');
	var btnBoard = document.getElementById('btn-to-board');
	var btnEndRound = document.getElementById('btn-end-round');

	// Hide all navigation buttons first
	if (btnScene) { btnScene.style.display = 'none'; }
	if (btnLab) { btnLab.style.display = 'none'; }
	if (btnBoard) { btnBoard.style.display = 'none'; }
	if (btnEndRound) { btnEndRound.style.display = 'none'; }

	// Show buttons based on current phase
	if (currentPhase === 'scene') {
		if (btnLab) { btnLab.style.display = 'inline-block'; }
		if (btnBoard) { btnBoard.style.display = 'inline-block'; }
		if (btnEndRound) { btnEndRound.style.display = 'inline-block'; }
	} else if (currentPhase === 'lab') {
		if (btnScene) { btnScene.style.display = 'inline-block'; }
		if (btnBoard) { btnBoard.style.display = 'inline-block'; }
		if (btnEndRound) { btnEndRound.style.display = 'inline-block'; }
	} else if (currentPhase === 'board') {
		if (btnScene) { btnScene.style.display = 'inline-block'; }
		if (btnLab) { btnLab.style.display = 'inline-block'; }
		if (btnEndRound) { btnEndRound.style.display = 'inline-block'; }
	}
}

/* ============================================ */
function updateRoundDisplay() {
	/* Update the #round-display text in the game header. */
	var roundEl = document.getElementById('round-display');
	if (roundEl) {
		roundEl.textContent = 'Round ' + gameState.round;
	}
}

/* ============================================ */
function updateScoreDisplay() {
	/* Update the #score-display text in the game header. */
	var scoreEl = document.getElementById('score-display');
	if (scoreEl) {
		scoreEl.textContent = 'Score: ' + gameState.totalScore;
	}
}

/* ============================================ */
function updateSuspectCards() {
	/* Render suspect cards in the #suspect-cards sidebar panel.
	   Each card shows the suspect's name, role, alive/dead status,
	   and suspicion level if set. Dead suspects are grayed out.
	   If the player is in the CASE_BOARD phase, cards are clickable
	   to open suspect notes. */
	var container = document.getElementById('suspect-cards');
	if (!container) {
		return;
	}

	var suspects = gameState.suspects;
	if (!suspects || suspects.length === 0) {
		container.innerHTML = '<p class="empty-state">No suspects loaded.</p>';
		return;
	}

	var html = '';
	for (var i = 0; i < suspects.length; i++) {
		var suspect = suspects[i];
		var cardClass = 'suspect-card';

		// Dead suspects get a special class
		if (!suspect.alive) {
			cardClass += ' suspect-dead';
		}

		// Make cards clickable in the case board phase
		var clickAttr = '';
		if (gameState.phase === PHASE.CASE_BOARD && suspect.alive) {
			clickAttr = ' onclick="openSuspectNotes(\'' + suspect.id + '\')"';
			cardClass += ' suspect-clickable';
		}

		html += '<div class="' + cardClass + '"' + clickAttr + '>';

		// Name
		html += '<div class="suspect-card-name">';
		html += escapeHtml(suspect.name);
		html += '</div>';

		// Role subtitle
		html += '<div class="suspect-card-role">';
		html += escapeHtml(suspect.role);
		html += '</div>';

		// Alive/Dead status indicator
		html += '<div class="suspect-status">';
		if (suspect.alive) {
			html += '<span class="status-alive">Alive</span>';
		} else {
			html += '<span class="status-dead">Deceased</span>';
		}
		html += '</div>';

		// Suspicion level from suspect notes (if any)
		var notes = gameState.suspectNotes[suspect.id];
		if (notes && notes.length > 0) {
			html += '<div class="suspect-notes-preview">';
			// Truncate long notes for the sidebar preview
			var preview = notes;
			if (preview.length > 50) {
				preview = preview.substring(0, 47) + '...';
			}
			html += escapeHtml(preview);
			html += '</div>';
		}

		html += '</div>';
	}

	container.innerHTML = html;
}

/* ============================================ */
function showModal(title, htmlContent, onCloseCallback) {
	/* Show the modal overlay with the given title and HTML content.
	   Removes the .modal-hidden class from #modal-overlay to display it.

	Args:
		title: string displayed as the modal heading
		htmlContent: raw HTML string for the modal body
		onCloseCallback: optional function called when the modal is closed
	*/
	var overlay = document.getElementById('modal-overlay');
	var contentEl = document.getElementById('modal-content');

	if (!overlay || !contentEl) {
		return;
	}

	// Store the close callback for the close button handler
	_modalCloseCallback = onCloseCallback || null;

	// Build the modal inner HTML with title and content
	var modalHtml = '';
	modalHtml += '<h2 class="modal-title">' + title + '</h2>';
	modalHtml += '<div class="modal-body">';
	modalHtml += htmlContent;
	modalHtml += '</div>';

	contentEl.innerHTML = modalHtml;

	// Show the modal overlay
	overlay.classList.remove('modal-hidden');
}

/* ============================================ */
function closeModal() {
	/* Hide the modal overlay by adding .modal-hidden.
	   Calls the stored onCloseCallback if one was provided. */
	var overlay = document.getElementById('modal-overlay');
	if (overlay) {
		overlay.classList.add('modal-hidden');
	}

	// Call the stored close callback if present
	if (typeof _modalCloseCallback === 'function') {
		var callback = _modalCloseCallback;
		// Clear the reference before calling to prevent double-fire
		_modalCloseCallback = null;
		callback();
	} else {
		_modalCloseCallback = null;
	}
}

/* ============================================ */
function showNotification(message, type) {
	/* Show a brief notification message at the top center of the screen.
	   The notification fades in, stays for 3 seconds, then fades out
	   and removes itself from the DOM.

	Args:
		message: text string to display
		type: string 'success', 'warning', 'error', or 'info'
	*/
	if (!type) {
		type = 'info';
	}

	// Create the notification element
	var notifEl = document.createElement('div');
	notifEl.className = 'game-notification notification-' + type;
	notifEl.textContent = message;

	// Style the notification for top-center positioning
	notifEl.style.position = 'fixed';
	notifEl.style.top = '20px';
	notifEl.style.left = '50%';
	notifEl.style.transform = 'translateX(-50%)';
	notifEl.style.padding = '10px 24px';
	notifEl.style.borderRadius = '6px';
	notifEl.style.zIndex = '10000';
	notifEl.style.fontWeight = 'bold';
	notifEl.style.fontSize = '14px';
	notifEl.style.opacity = '0';
	notifEl.style.transition = 'opacity 0.3s ease';
	notifEl.style.pointerEvents = 'none';

	// Set color based on notification type
	if (type === 'success') {
		notifEl.style.backgroundColor = '#2e7d32';
		notifEl.style.color = '#ffffff';
	} else if (type === 'warning') {
		notifEl.style.backgroundColor = '#f57f17';
		notifEl.style.color = '#ffffff';
	} else if (type === 'error') {
		notifEl.style.backgroundColor = '#c62828';
		notifEl.style.color = '#ffffff';
	} else {
		// info
		notifEl.style.backgroundColor = '#1565c0';
		notifEl.style.color = '#ffffff';
	}

	// Add to the document body
	document.body.appendChild(notifEl);

	// Trigger fade-in after a brief delay so the transition fires
	setTimeout(function() {
		notifEl.style.opacity = '1';
	}, 10);

	// Fade out and remove after 3 seconds
	setTimeout(function() {
		notifEl.style.opacity = '0';
		// Remove from DOM after the fade-out transition completes
		setTimeout(function() {
			if (notifEl.parentNode) {
				notifEl.parentNode.removeChild(notifEl);
			}
		}, 350);
	}, 3000);
}

/* ============================================ */
function getSelectedDifficulty() {
	/* Returns the currently selected difficulty from the setup screen.
	   Checks which .difficulty-card has the .selected class.

	Returns:
		string: 'easy', 'medium', or 'hard' (defaults to 'medium')
	*/
	var cards = document.querySelectorAll('.difficulty-card');
	for (var i = 0; i < cards.length; i++) {
		if (cards[i].classList.contains('selected')) {
			var diff = cards[i].getAttribute('data-difficulty');
			if (diff) {
				return diff;
			}
		}
	}
	// Default to medium if nothing is selected
	return 'medium';
}

/* ============================================ */
function getSelectedSuspects() {
	/* Returns an array of selected suspect ID strings from the
	   setup screen. Checks which .suspect-option elements have
	   the .selected class.

	Returns:
		array: suspect ID strings
	*/
	var selected = [];
	var cards = document.querySelectorAll('.suspect-option');
	for (var i = 0; i < cards.length; i++) {
		if (cards[i].classList.contains('selected')) {
			var suspectId = cards[i].getAttribute('data-suspect-id');
			if (suspectId) {
				selected.push(suspectId);
			}
		}
	}
	return selected;
}
