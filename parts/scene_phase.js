/* ============================================ */
/* SECTION 5: SCENE INVESTIGATION PHASE         */
/* ============================================ */

// Descriptive text pools for each evidence type
var EVIDENCE_DESCRIPTIONS = {
	blood: [
		'A dark red stain has soaked into the surface.',
		'Dried blood droplets form a scattered pattern.',
		'A smeared streak of blood, still slightly tacky.',
		'Tiny blood spatter marks dot the area.',
		'A small pool of dried blood has collected here.'
	],
	touch_dna: [
		'Smudged fingerprints are visible on the surface.',
		'Skin cells and oils left behind from a firm grip.',
		'Faint oily residue suggests recent handling.',
		'A visible palm print pressed against the surface.',
		'Latent prints partially visible under angled light.'
	],
	hair: [
		'A single strand of hair lies on the surface.',
		'Several loose hairs are caught in the fabric.',
		'A hair with root attached rests on the edge.',
		'Fine hairs are tangled around the surface.',
		'A distinctive hair strand stands out against the background.'
	],
	saliva: [
		'A wet spot on the rim suggests recent contact.',
		'Dried saliva traces are visible under light.',
		'A faint moisture ring marks where lips touched.',
		'Residue consistent with saliva coats the surface.',
		'A small dried droplet sits on the edge.'
	],
	fiber: [
		'Fabric fibers are caught on the rough edge.',
		'Thread fragments cling to the surface.',
		'A tuft of textile fibers is wedged in the gap.',
		'Loose threads have snagged on the material.',
		'Tiny fiber strands are barely visible without magnification.'
	]
};

// Icon characters for each evidence type (ASCII-safe)
var EVIDENCE_ICONS = {
	blood: '[B]',
	touch_dna: '[D]',
	hair: '[H]',
	saliva: '[S]',
	fiber: '[F]'
};

/* ============================================ */
function renderScenePhase() {
	/*
	Renders the full scene investigation UI into #main-panel.
	Shows the room, narrative, gloves button, swab counter,
	and a grid of clickable evidence cards.
	*/
	var mainPanel = document.getElementById('main-panel');
	var scene = gameState.currentScene;

	// Safety check: bail out if no scene is loaded
	if (!scene) {
		mainPanel.innerHTML = '<p>Error: No crime scene data loaded.</p>';
		return;
	}

	var html = '';

	// -- Scene header: room name and description --
	html += '<div class="scene-header">';
	html += '<h2>' + escapeHtml(scene.room.name) + '</h2>';
	html += '<p class="scene-description">' + escapeHtml(scene.room.description) + '</p>';
	html += '</div>';

	// -- Narrative paragraph about the incident --
	html += '<div class="scene-narrative">';
	html += '<p class="narrative-text">';
	html += buildNarrativeText(scene);
	html += '</p>';
	html += '</div>';

	// -- Controls row: gloves button and swab counter --
	html += '<div class="scene-controls">';
	html += buildGlovesButton();
	html += buildSwabCounter();
	html += '</div>';

	// -- Evidence grid --
	html += '<div class="evidence-grid">';
	var evidence = gameState.availableEvidence;
	for (var i = 0; i < evidence.length; i++) {
		html += buildEvidenceCard(evidence[i], i);
	}
	html += '</div>';

	// Inject into the main panel
	mainPanel.innerHTML = html;

	// Update the evidence sidebar to reflect current state
	updateEvidenceSidebar();
}

/* ============================================ */
function buildNarrativeText(scene) {
	/*
	Constructs a narrative paragraph describing the crime scene.
	Uses the current victim and round information for context.
	*/
	var victimName = 'the victim';
	if (gameState.victim && gameState.victim.name) {
		victimName = escapeHtml(gameState.victim.name);
	}

	// Check if there are additional dead characters this round
	var deadCount = gameState.deadCharacters.length;

	var text = '';
	if (gameState.round === 1) {
		// First round narrative
		text += 'You arrive at the scene where ' + victimName;
		text += ' was found. The room has been cordoned off, ';
		text += 'but time is limited before evidence degrades. ';
		text += 'Look carefully for biological evidence that can ';
		text += 'be collected and analyzed in the lab.';
	} else {
		// Subsequent rounds - the killer has struck again
		var latestVictim = 'another victim';
		if (deadCount > 0) {
			var lastDead = gameState.deadCharacters[deadCount - 1];
			if (lastDead && lastDead.name) {
				latestVictim = escapeHtml(lastDead.name);
			}
		}
		text += 'The killer has struck again. ';
		text += latestVictim + ' was found here under suspicious circumstances. ';
		text += 'This is round ' + gameState.round + ' of the investigation. ';
		text += 'Collect evidence carefully and move to the lab when ready.';
	}

	return text;
}

/* ============================================ */
function buildGlovesButton() {
	/*
	Returns HTML for the gloves toggle button.
	Red outline when gloves are off, green with checkmark when on.
	*/
	var html = '';
	if (gameState.glovesOn) {
		// Gloves are already on - show green confirmation
		html += '<button class="btn btn-gloves gloves-on" disabled>';
		html += '[OK] Gloves On';
		html += '</button>';
	} else {
		// Gloves are off - prominent red warning button
		html += '<button class="btn btn-gloves gloves-off" onclick="putOnGloves()">';
		html += '!! Put On Gloves !!';
		html += '</button>';
	}
	return html;
}

/* ============================================ */
function buildSwabCounter() {
	/*
	Returns HTML displaying how many swabs remain for collection.
	*/
	var remaining = gameState.swabsRemaining;
	var total = DIFFICULTY_CONFIG[gameState.difficulty].swabsPerRound;
	var html = '<div class="swab-counter">';
	html += 'Swabs: <strong>' + remaining + '</strong> / ' + total + ' remaining';
	html += '</div>';
	return html;
}

/* ============================================ */
function buildEvidenceCard(evidenceItem, index) {
	/*
	Builds the HTML for a single evidence card in the grid.
	Grays out cards for already-collected items.
	Args:
		evidenceItem: object with type, location, description, quality, collected
		index: position in the availableEvidence array
	*/
	var isCollected = evidenceItem.collected;
	var cardClass = 'evidence-card';
	if (isCollected) {
		cardClass += ' evidence-collected';
	}

	var html = '';
	if (isCollected) {
		// Disabled card - already collected
		html += '<div class="' + cardClass + '">';
	} else {
		// Clickable card
		html += '<div class="' + cardClass + '" onclick="collectEvidence(' + index + ')">';
	}

	// Evidence type tag with icon
	var typeLabel = evidenceItem.type.replace('_', ' ');
	html += '<div class="evidence-tag tag-' + evidenceItem.type + '">';
	html += EVIDENCE_ICONS[evidenceItem.type] + ' ' + typeLabel.toUpperCase();
	html += '</div>';

	// Location within the room
	html += '<div class="evidence-location">';
	html += escapeHtml(evidenceItem.location);
	html += '</div>';

	// Descriptive text about the evidence
	html += '<div class="evidence-description">';
	html += escapeHtml(evidenceItem.description);
	html += '</div>';

	// Quality indicator
	html += '<div class="evidence-quality">';
	html += 'Quality: ' + evidenceItem.quality;
	html += '</div>';

	// Collected overlay
	if (isCollected) {
		html += '<div class="collected-overlay">COLLECTED</div>';
	}

	html += '</div>';
	return html;
}

/* ============================================ */
function putOnGloves() {
	/*
	Handles the player clicking the Put On Gloves button.
	Sets the glovesOn flag and re-renders the scene.
	*/
	gameState.glovesOn = true;
	renderScenePhase();
}

/* ============================================ */
function collectEvidence(evidenceIndex) {
	/*
	Called when the player clicks an evidence card to collect it.
	Checks for gloves, swab availability, and then opens
	the collection dialog.
	Args:
		evidenceIndex: index into gameState.availableEvidence
	*/
	var evidenceItem = gameState.availableEvidence[evidenceIndex];

	// Guard: item already collected
	if (evidenceItem.collected) {
		return;
	}

	// Check if player has swabs remaining
	if (gameState.swabsRemaining <= 0) {
		showModal(
			'No Swabs Remaining',
			'<p>You have used all your collection swabs for this round.</p>' +
			'<p>Proceed to the Laboratory to analyze what you have, ' +
			'or review your evidence on the Case Board.</p>'
		);
		return;
	}

	// Check for gloves - contamination mechanic
	if (!gameState.glovesOn) {
		// Increment contamination counter
		gameState.contaminationEvents++;

		// Mark this specific evidence item as contaminated
		evidenceItem.contaminated = true;

		// Apply score penalty for contamination
		gameState.currentRoundScore.contaminationPenalty += SCORE_WEIGHTS.contaminationPenalty;

		// Show contamination warning, then proceed with collection
		showModal(
			'WARNING: Contamination!',
			'<p style="color: #cc0000; font-weight: bold;">' +
			'WARNING: You collected evidence without gloves!</p>' +
			'<p>Your bare hands have contaminated the sample. ' +
			'Your own DNA is now mixed with the evidence, ' +
			'which may compromise lab results.</p>' +
			'<p>Contamination events so far: <strong>' +
			gameState.contaminationEvents + '</strong></p>' +
			'<p>Always put on gloves before handling evidence!</p>',
			function() {
				closeModal();
				// Proceed to collection dialog despite contamination
				showCollectionDialog(evidenceItem, evidenceIndex);
			}
		);
		return;
	}

	// Normal collection path - gloves on, swabs available
	showCollectionDialog(evidenceItem, evidenceIndex);
}

/* ============================================ */
function showCollectionDialog(evidenceItem, evidenceIndex) {
	/*
	Displays a modal dialog for the player to label their sample.
	Includes fields for sample label, evidence type guess, and notes.
	Args:
		evidenceItem: the evidence object being collected
		evidenceIndex: index in gameState.availableEvidence
	*/
	// Pre-select the evidence type dropdown based on the item
	var guessedType = guessEvidenceType(evidenceItem);

	var formHtml = '';
	formHtml += '<div class="collection-form">';

	// Sample label input
	formHtml += '<div class="form-group">';
	formHtml += '<label for="sample-label">Sample Label:</label>';
	formHtml += '<input type="text" id="sample-label" ';
	formHtml += 'placeholder="e.g., Blood from desk edge" ';
	formHtml += 'maxlength="60">';
	formHtml += '<p class="form-hint">Give this sample a descriptive name for tracking.</p>';
	formHtml += '</div>';

	// Evidence type dropdown
	formHtml += '<div class="form-group">';
	formHtml += '<label for="evidence-type-select">Evidence Type:</label>';
	formHtml += '<select id="evidence-type-select">';
	for (var i = 0; i < EVIDENCE_TYPES.length; i++) {
		var evType = EVIDENCE_TYPES[i];
		var evLabel = evType.replace('_', ' ');
		var selected = (evType === guessedType) ? ' selected' : '';
		formHtml += '<option value="' + evType + '"' + selected + '>';
		formHtml += evLabel;
		formHtml += '</option>';
	}
	formHtml += '</select>';
	formHtml += '<p class="form-hint">Select the type of biological evidence.</p>';
	formHtml += '</div>';

	// Location notes input
	formHtml += '<div class="form-group">';
	formHtml += '<label for="location-notes">Location Notes:</label>';
	formHtml += '<input type="text" id="location-notes" ';
	formHtml += 'placeholder="e.g., Found near the window latch" ';
	formHtml += 'maxlength="80">';
	formHtml += '<p class="form-hint">Describe exactly where the sample was found.</p>';
	formHtml += '</div>';

	// Evidence preview
	formHtml += '<div class="evidence-preview">';
	formHtml += '<strong>Collecting:</strong> ';
	formHtml += escapeHtml(evidenceItem.description);
	formHtml += ' (' + escapeHtml(evidenceItem.location) + ')';
	formHtml += '</div>';

	// Collect button
	formHtml += '<button class="btn btn-primary" ';
	formHtml += 'onclick="submitCollectionForm(' + evidenceIndex + ')">';
	formHtml += 'Collect Sample';
	formHtml += '</button>';

	formHtml += '</div>';

	showModal('Collect Evidence Sample', formHtml);
}

/* ============================================ */
function guessEvidenceType(evidenceItem) {
	/*
	Attempts to guess the evidence type based on the description text.
	Returns the best matching type string from EVIDENCE_TYPES.
	Args:
		evidenceItem: the evidence object with a description field
	*/
	var desc = evidenceItem.description.toLowerCase();

	// Check for keywords associated with each type
	if (desc.indexOf('blood') !== -1 || desc.indexOf('red stain') !== -1 || desc.indexOf('spatter') !== -1) {
		return 'blood';
	}
	if (desc.indexOf('hair') !== -1 || desc.indexOf('strand') !== -1) {
		return 'hair';
	}
	if (desc.indexOf('saliva') !== -1 || desc.indexOf('wet spot') !== -1 || desc.indexOf('lips') !== -1) {
		return 'saliva';
	}
	if (desc.indexOf('fiber') !== -1 || desc.indexOf('thread') !== -1 || desc.indexOf('fabric') !== -1 || desc.indexOf('tuft') !== -1) {
		return 'fiber';
	}
	if (desc.indexOf('fingerprint') !== -1 || desc.indexOf('skin cell') !== -1 || desc.indexOf('palm print') !== -1 || desc.indexOf('print') !== -1 || desc.indexOf('residue') !== -1) {
		return 'touch_dna';
	}

	// Default to the item's actual type if no keyword match
	return evidenceItem.type;
}

/* ============================================ */
function submitCollectionForm(evidenceIndex) {
	/*
	Reads the collection form fields from the modal and calls
	confirmCollection with the player's input.
	Args:
		evidenceIndex: index in gameState.availableEvidence
	*/
	var labelInput = document.getElementById('sample-label');
	var typeSelect = document.getElementById('evidence-type-select');
	var notesInput = document.getElementById('location-notes');

	// Read form values with fallback defaults
	var label = labelInput ? labelInput.value.trim() : '';
	var evidenceType = typeSelect ? typeSelect.value : 'touch_dna';
	var locationNotes = notesInput ? notesInput.value.trim() : '';

	// Validate that the label is not empty
	if (label.length === 0) {
		label = 'Sample #' + (gameState.collectedSamples.length + 1);
	}

	closeModal();
	confirmCollection(evidenceIndex, label, evidenceType, locationNotes);
}

/* ============================================ */
function confirmCollection(evidenceIndex, label, evidenceType, locationNotes) {
	/*
	Finalizes evidence collection. Creates a sample object, updates
	game state, scores chain of custody, and refreshes the UI.
	Args:
		evidenceIndex: index in gameState.availableEvidence
		label: player-assigned label string
		evidenceType: player-selected evidence type string
		locationNotes: player-entered location notes string
	*/
	var evidenceItem = gameState.availableEvidence[evidenceIndex];

	// Mark the evidence as collected in the available list
	evidenceItem.collected = true;

	// Decrement swab count
	gameState.swabsRemaining--;

	// Determine chain of custody quality based on labeling
	var custodyScore = evaluateChainOfCustody(evidenceItem, label, evidenceType, locationNotes);

	// Build the sample object
	var sample = {
		id: 'sample-' + Date.now() + '-' + evidenceIndex,
		label: label,
		evidenceType: evidenceType,
		actualType: evidenceItem.type,
		locationNotes: locationNotes,
		location: evidenceItem.location,
		quality: evidenceItem.quality,
		contaminated: evidenceItem.contaminated || false,
		chainOfCustody: custodyScore,
		sourceIndex: evidenceIndex,
		collectedAt: gameState.round,
		// Copy over DNA profile data from the evidence for lab analysis
		ownerSuspectId: evidenceItem.ownerSuspectId || null,
		dnaProfile: evidenceItem.dnaProfile || null,
		bloodType: evidenceItem.bloodType || null,
		hairType: evidenceItem.hairType || null,
		mtdnaHaplotype: evidenceItem.mtdnaHaplotype || null
	};

	// Add the sample to the player's collection
	gameState.collectedSamples.push(sample);

	// Log this collection event
	gameState.evidenceLog.push({
		action: 'collected',
		round: gameState.round,
		label: label,
		type: evidenceType,
		actualType: evidenceItem.type,
		location: evidenceItem.location,
		contaminated: sample.contaminated,
		chainOfCustody: custodyScore
	});

	// Award sample handling points
	var handlingPoints = calculateHandlingPoints(sample);
	gameState.currentRoundScore.sampleHandling += handlingPoints;

	// Award chain of custody points
	gameState.currentRoundScore.chainOfCustody += custodyScore;

	// Re-render the scene to show updated state
	renderScenePhase();
}

/* ============================================ */
function evaluateChainOfCustody(evidenceItem, label, evidenceType, locationNotes) {
	/*
	Scores the player's evidence labeling for chain of custody accuracy.
	Better labels earn more points.
	Returns an integer score from 0 to 3.
	Args:
		evidenceItem: the original evidence object
		label: player-assigned label
		evidenceType: player-selected type
		locationNotes: player-entered notes
	*/
	var score = 0;

	// +1 point if the label is descriptive (more than 5 characters)
	if (label.length > 5) {
		score += 1;
	}

	// +1 point if the evidence type matches the actual type
	if (evidenceType === evidenceItem.type) {
		score += 1;
	}

	// +1 point if location notes are provided and non-trivial
	if (locationNotes.length > 3) {
		score += 1;
	}

	return score;
}

/* ============================================ */
function calculateHandlingPoints(sample) {
	/*
	Calculates points awarded for proper sample handling.
	Contaminated samples earn fewer points.
	Returns an integer point value.
	Args:
		sample: the collected sample object
	*/
	var points = 2;

	// Penalty for contamination
	if (sample.contaminated) {
		points = 0;
	}

	// Bonus for high-quality evidence
	if (sample.quality === 'pristine') {
		points += 1;
	}

	return points;
}

/* ============================================ */
function updateEvidenceSidebar() {
	/*
	Updates the #evidence-list sidebar panel with all collected samples.
	Shows label, type, quality, contamination warnings, and custody status.
	*/
	var listEl = document.getElementById('evidence-list');
	if (!listEl) {
		return;
	}

	var samples = gameState.collectedSamples;

	// Show empty state if no samples collected yet
	if (samples.length === 0) {
		listEl.innerHTML = '<p class="empty-state">No evidence collected yet.</p>';
		return;
	}

	var html = '';
	for (var i = 0; i < samples.length; i++) {
		var sample = samples[i];
		html += buildSidebarSampleEntry(sample, i);
	}

	listEl.innerHTML = html;
}

/* ============================================ */
function buildSidebarSampleEntry(sample, index) {
	/*
	Builds HTML for a single sample entry in the evidence sidebar.
	Args:
		sample: the collected sample object
		index: position in collectedSamples array
	Returns HTML string.
	*/
	var html = '';
	var entryClass = 'sidebar-sample';
	if (sample.contaminated) {
		entryClass += ' sample-contaminated';
	}

	html += '<div class="' + entryClass + '">';

	// Sample label
	html += '<div class="sample-label">';
	html += escapeHtml(sample.label);
	html += '</div>';

	// Type tag
	var typeLabel = sample.evidenceType.replace('_', ' ');
	html += '<span class="sample-type-tag tag-' + sample.evidenceType + '">';
	html += typeLabel;
	html += '</span>';

	// Quality indicator
	html += '<span class="sample-quality quality-' + sample.quality + '">';
	html += sample.quality;
	html += '</span>';

	// Contamination warning
	if (sample.contaminated) {
		html += '<div class="contamination-warning">';
		html += '!! CONTAMINATED';
		html += '</div>';
	}

	// Chain of custody status
	var custodyText = 'Unlabeled';
	if (sample.chainOfCustody >= 3) {
		custodyText = 'Fully labeled';
	} else if (sample.chainOfCustody >= 1) {
		custodyText = 'Partially labeled';
	}
	html += '<div class="custody-status custody-' + sample.chainOfCustody + '">';
	html += 'Custody: ' + custodyText;
	html += '</div>';

	html += '</div>';
	return html;
}

/* ============================================ */
function getEvidenceDescription(evidenceType) {
	/*
	Returns a random description string for the given evidence type.
	Falls back to a generic description if the type is unrecognized.
	Args:
		evidenceType: string key from EVIDENCE_TYPES
	*/
	var descriptions = EVIDENCE_DESCRIPTIONS[evidenceType];
	if (!descriptions || descriptions.length === 0) {
		return 'Trace biological evidence found at the scene.';
	}
	var randomIndex = Math.floor(Math.random() * descriptions.length);
	return descriptions[randomIndex];
}

/* ============================================ */
function escapeHtml(text) {
	/*
	Escapes HTML special characters to prevent injection.
	Returns the sanitized string.
	Args:
		text: raw string to escape
	*/
	if (typeof text !== 'string') {
		return '';
	}
	var escaped = text;
	escaped = escaped.replace(/&/g, '&amp;');
	escaped = escaped.replace(/</g, '&lt;');
	escaped = escaped.replace(/>/g, '&gt;');
	escaped = escaped.replace(/"/g, '&quot;');
	escaped = escaped.replace(/'/g, '&#39;');
	return escaped;
}
