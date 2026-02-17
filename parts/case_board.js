/* ============================================ */
/* SECTION 7: CASE BOARD PHASE                 */
/* ============================================ */

/* ============================================ */
function renderCaseBoard() {
	/*
	Renders the full case board UI into #main-panel.
	Shows evidence summary, suspect assessments,
	conclusion text area, and action buttons.
	*/
	var mainPanel = document.getElementById('main-panel');
	if (!mainPanel) {
		return;
	}

	var html = '';

	// -- Section 1: Evidence Summary Table --
	html += '<div class="case-board-section">';
	html += '<h2>Evidence Summary</h2>';
	html += buildEvidenceSummaryTable();
	html += '</div>';

	// -- Section 2: Suspect Assessment Cards --
	html += '<div class="case-board-section">';
	html += '<h2>Suspect Assessment</h2>';
	html += buildSuspectAssessmentCards();
	html += '</div>';

	// -- Section 3: Conclusion Text Area --
	html += '<div class="case-board-section">';
	html += '<h2>Forensic Conclusion</h2>';
	html += '<p class="form-hint">';
	html += 'Write your forensic conclusion. Use proper scientific language.';
	html += '</p>';
	html += '<textarea id="conclusion-textarea" ';
	html += 'class="conclusion-input" ';
	html += 'rows="6" ';
	html += 'placeholder="Based on the evidence collected..." ';
	html += 'onchange="updateConclusion(this.value)" ';
	html += 'oninput="updateConclusion(this.value)">';
	// Pre-fill with any saved conclusion text
	html += escapeHtml(gameState.currentConclusion);
	html += '</textarea>';
	html += '</div>';

	// -- Section 4: Action Buttons --
	html += '<div class="case-board-actions">';
	html += '<button class="btn btn-secondary" ';
	html += 'onclick="enterScenePhase()">';
	html += 'Continue Investigating';
	html += '</button>';

	// Only show accusation button if at least 1 test was run
	var testsRun = gameState.testResults.length;
	if (testsRun > 0) {
		html += '<button class="btn btn-accent" ';
		html += 'onclick="transitionTo(PHASE.ACCUSATION)">';
		html += 'Make Accusation';
		html += '</button>';
	}

	html += '<button class="btn btn-primary" ';
	html += 'onclick="endRound()">';
	html += 'End Round';
	html += '</button>';
	html += '</div>';

	mainPanel.innerHTML = html;
}

/* ============================================ */
function buildEvidenceSummaryTable() {
	/*
	Builds an HTML table summarizing all collected samples
	and their test results, with certainty dropdowns.
	Returns HTML string.
	*/
	var samples = gameState.collectedSamples;
	var results = gameState.testResults;

	// Show empty state if no samples collected
	if (samples.length === 0 && results.length === 0) {
		var emptyHtml = '<p class="empty-state">';
		emptyHtml += 'No evidence has been collected yet. ';
		emptyHtml += 'Return to the crime scene to gather samples.';
		emptyHtml += '</p>';
		return emptyHtml;
	}

	var html = '';
	html += '<table class="evidence-summary-table">';
	html += '<thead><tr>';
	html += '<th>Sample Label</th>';
	html += '<th>Type</th>';
	html += '<th>Test Run</th>';
	html += '<th>Result Summary</th>';
	html += '<th>Certainty</th>';
	html += '</tr></thead>';
	html += '<tbody>';

	// Build rows: one per test result, plus untested samples
	var testedSampleIds = {};
	for (var r = 0; r < results.length; r++) {
		var result = results[r];
		testedSampleIds[result.sampleId] = true;

		// Find the matching sample for this result
		var matchingSample = findSampleById(result.sampleId);
		var sampleLabel = matchingSample ? matchingSample.label : result.sampleId;
		var sampleType = matchingSample ? matchingSample.evidenceType : 'unknown';

		html += '<tr>';
		html += '<td>' + escapeHtml(sampleLabel) + '</td>';
		html += '<td>' + escapeHtml(sampleType.replace('_', ' ')) + '</td>';
		html += '<td>' + escapeHtml(result.testName) + '</td>';
		html += '<td>' + buildResultSummaryText(result) + '</td>';
		html += '<td>' + buildCertaintyDropdown(r) + '</td>';
		html += '</tr>';
	}

	// Add rows for samples that have not been tested yet
	for (var s = 0; s < samples.length; s++) {
		if (!testedSampleIds[samples[s].id]) {
			html += '<tr class="untested-row">';
			html += '<td>' + escapeHtml(samples[s].label) + '</td>';
			html += '<td>' + escapeHtml(samples[s].evidenceType.replace('_', ' ')) + '</td>';
			html += '<td>-- Not tested --</td>';
			html += '<td>--</td>';
			html += '<td>--</td>';
			html += '</tr>';
		}
	}

	html += '</tbody></table>';
	return html;
}

/* ============================================ */
function findSampleById(sampleId) {
	/*
	Searches gameState.collectedSamples for a sample matching
	the given ID string.
	Returns the sample object or null.
	*/
	for (var i = 0; i < gameState.collectedSamples.length; i++) {
		if (gameState.collectedSamples[i].id === sampleId) {
			return gameState.collectedSamples[i];
		}
	}
	return null;
}

/* ============================================ */
function buildResultSummaryText(result) {
	/*
	Generates a short human-readable summary of a test result.
	Returns an HTML string.
	Args:
		result: a test result object from gameState.testResults
	*/
	if (!result.success) {
		var errorText = '<span class="result-error">';
		if (result.data && result.data.error) {
			errorText += escapeHtml(result.data.error);
		} else {
			errorText += 'Test failed';
		}
		errorText += '</span>';
		return errorText;
	}

	var summary = '';

	// Add contamination warning if applicable
	if (result.contaminated) {
		summary += '<span class="result-warning">[CONTAMINATED] </span>';
	}

	// Build summary based on test type
	switch (result.testType) {
		case 'blood_type':
			if (result.data && result.data.bloodType) {
				summary += 'Blood Type: <strong>' + escapeHtml(result.data.bloodType) + '</strong>';
			}
			break;

		case 'rflp':
			if (result.data && result.data.enzymes) {
				var enzymeNames = Object.keys(result.data.enzymes);
				var bandCounts = [];
				for (var e = 0; e < enzymeNames.length; e++) {
					var fragCount = result.data.enzymes[enzymeNames[e]].length;
					bandCounts.push(enzymeNames[e] + ': ' + fragCount + ' bands');
				}
				summary += bandCounts.join(', ');
			}
			break;

		case 'str':
			if (result.data && result.data.loci) {
				var lociNames = Object.keys(result.data.loci);
				var activeLoci = 0;
				for (var l = 0; l < lociNames.length; l++) {
					if (result.data.loci[lociNames[l]].length > 0) {
						activeLoci++;
					}
				}
				summary += activeLoci + ' of ' + lociNames.length + ' loci detected';
			}
			break;

		case 'mtdna':
			if (result.data && result.data.haplotype) {
				summary += 'Haplotype: <strong>' + escapeHtml(result.data.haplotype) + '</strong>';
			}
			break;

		case 'restriction':
			if (result.data && result.data.fragments) {
				summary += result.data.enzyme + ': ';
				summary += result.data.fragments.length + ' fragments';
			}
			break;

		default:
			summary += 'Result available';
	}

	// Note if control was included
	if (result.controlIncluded) {
		summary += ' <span class="control-badge">[Control: OK]</span>';
	}

	return summary;
}

/* ============================================ */
function buildCertaintyDropdown(resultIndex) {
	/*
	Builds an HTML select dropdown for certainty level
	associated with a particular test result.
	Args:
		resultIndex: index into gameState.testResults
	Returns HTML string for the dropdown.
	*/
	var html = '<select class="certainty-select" ';
	html += 'onchange="setCertaintyLevel(' + resultIndex + ', this.value)">';
	html += '<option value="">-- Select --</option>';

	for (var c = 0; c < CERTAINTY_LEVELS.length; c++) {
		var level = CERTAINTY_LEVELS[c];
		html += '<option value="' + level.value + '" ';
		html += 'title="' + escapeHtml(level.description) + '">';
		html += escapeHtml(level.label);
		html += '</option>';
	}

	html += '</select>';
	return html;
}

/* ============================================ */
function setCertaintyLevel(resultIndex, certaintyValue) {
	/*
	Stores the player-selected certainty level for a test result.
	Args:
		resultIndex: index into gameState.testResults
		certaintyValue: string value from CERTAINTY_LEVELS
	*/
	if (resultIndex >= 0 && resultIndex < gameState.testResults.length) {
		gameState.testResults[resultIndex].playerCertainty = certaintyValue;
	}
}

/* ============================================ */
function buildSuspectAssessmentCards() {
	/*
	Builds HTML cards for each alive suspect with suspicion
	slider, notes text area, and evidence tags.
	Returns HTML string.
	*/
	var aliveSuspects = getAliveSuspects();

	if (aliveSuspects.length === 0) {
		return '<p class="empty-state">No living suspects remain.</p>';
	}

	var html = '<div class="suspect-assessment-grid">';

	for (var i = 0; i < aliveSuspects.length; i++) {
		var suspect = aliveSuspects[i];
		html += buildSingleSuspectCard(suspect);
	}

	html += '</div>';
	return html;
}

/* ============================================ */
function buildSingleSuspectCard(suspect) {
	/*
	Builds a single suspect assessment card with name, role,
	suspicion slider, notes area, and evidence tags.
	Args:
		suspect: a suspect character object
	Returns HTML string.
	*/
	// Retrieve saved notes for this suspect
	var savedNotes = '';
	var savedSuspicion = 50;
	var notesData = gameState.suspectNotes[suspect.id];
	if (notesData && typeof notesData === 'object') {
		savedNotes = notesData.notes || '';
		savedSuspicion = notesData.suspicion || 50;
	} else if (typeof notesData === 'string') {
		savedNotes = notesData;
	}

	var html = '';
	html += '<div class="suspect-assessment-card" data-suspect-id="' + suspect.id + '">';

	// Name and role header
	html += '<div class="suspect-card-header">';
	html += '<h3>' + escapeHtml(suspect.name) + '</h3>';
	html += '<p class="suspect-role">' + escapeHtml(suspect.role) + '</p>';
	html += '</div>';

	// Suspicion slider (0-100)
	html += '<div class="suspicion-slider-group">';
	html += '<label>Suspicion Level: ';
	html += '<span id="suspicion-value-' + suspect.id + '">' + savedSuspicion + '</span>%';
	html += '</label>';
	html += '<input type="range" ';
	html += 'class="suspicion-slider" ';
	html += 'min="0" max="100" ';
	html += 'value="' + savedSuspicion + '" ';
	html += 'oninput="onSuspicionSliderChange(\'' + suspect.id + '\', this.value)">';
	html += '</div>';

	// Notes text area
	html += '<div class="suspect-notes-group">';
	html += '<label>Investigator Notes:</label>';
	html += '<textarea class="suspect-notes" ';
	html += 'rows="3" ';
	html += 'placeholder="Record observations about this suspect..." ';
	html += 'oninput="updateSuspectAssessment(\'' + suspect.id + '\', \'notes\', this.value)">';
	html += escapeHtml(savedNotes);
	html += '</textarea>';
	html += '</div>';

	// Evidence tags linking to test results involving this suspect
	html += '<div class="evidence-tags">';
	html += buildEvidenceTagsForSuspect(suspect.id);
	html += '</div>';

	html += '</div>';
	return html;
}

/* ============================================ */
function onSuspicionSliderChange(suspectId, value) {
	/*
	Handles the suspicion slider input event. Updates the
	displayed value and stores it in gameState.
	Args:
		suspectId: string ID of the suspect
		value: string slider value (0-100)
	*/
	// Update the displayed percentage
	var valueSpan = document.getElementById('suspicion-value-' + suspectId);
	if (valueSpan) {
		valueSpan.textContent = value;
	}

	// Store in game state
	updateSuspectAssessment(suspectId, 'suspicion', parseInt(value, 10));
}

/* ============================================ */
function buildEvidenceTagsForSuspect(suspectId) {
	/*
	Finds test results that may relate to a suspect and
	renders them as small tag badges.
	Args:
		suspectId: string ID of the suspect
	Returns HTML string with evidence tag badges.
	*/
	var results = gameState.testResults;
	var tags = '';
	var tagCount = 0;

	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		// Find the sample this result belongs to
		var sample = findSampleById(result.sampleId);
		if (!sample) {
			continue;
		}

		// Check if the evidence source matches this suspect
		// (the player does not know the source, but we show the test name)
		tags += '<span class="evidence-tag-badge">';
		tags += escapeHtml(result.testName);
		tags += ' (' + escapeHtml(sample.label) + ')';
		tags += '</span>';
		tagCount++;
	}

	if (tagCount === 0) {
		tags = '<span class="empty-state-inline">No linked evidence</span>';
	}

	return tags;
}

/* ============================================ */
function updateSuspectAssessment(suspectId, field, value) {
	/*
	Updates gameState.suspectNotes for a specific suspect.
	Args:
		suspectId: string ID of the suspect
		field: 'suspicion' (slider value) or 'notes' (text)
		value: the new value to store
	*/
	// Initialize notes object if it is still a plain string
	if (typeof gameState.suspectNotes[suspectId] !== 'object') {
		var oldNotes = gameState.suspectNotes[suspectId] || '';
		gameState.suspectNotes[suspectId] = {
			suspicion: 50,
			notes: oldNotes
		};
	}

	if (field === 'suspicion') {
		gameState.suspectNotes[suspectId].suspicion = value;
	} else if (field === 'notes') {
		gameState.suspectNotes[suspectId].notes = value;
	}
}

/* ============================================ */
function updateConclusion(text) {
	/*
	Saves the player's conclusion text to gameState.
	Args:
		text: string from the conclusion textarea
	*/
	gameState.currentConclusion = text;
}

/* ============================================ */
function renderAccusation() {
	/*
	Renders the accusation screen into #accusation-content.
	Shows all alive suspects as clickable cards with a
	"Who is the killer?" prompt. Clicking a suspect shows
	a confirmation dialog before finalizing.
	*/
	var container = document.getElementById('accusation-content');
	if (!container) {
		return;
	}

	var aliveSuspects = getAliveSuspects();

	var html = '';
	html += '<div class="accusation-prompt">';
	html += '<h3>Who is the killer?</h3>';
	html += '<p>Review the evidence carefully. This decision is final.</p>';
	html += '</div>';

	html += '<div class="accusation-grid">';
	for (var i = 0; i < aliveSuspects.length; i++) {
		var suspect = aliveSuspects[i];
		html += '<div class="accusation-card" ';
		html += 'onclick="confirmAccusation(\'' + suspect.id + '\')">';
		html += '<h3>' + escapeHtml(suspect.name) + '</h3>';
		html += '<p class="suspect-role">' + escapeHtml(suspect.role) + '</p>';
		html += '<p class="suspect-alibi">' + escapeHtml(suspect.alibi) + '</p>';
		html += '<p class="suspect-motive"><strong>Motive:</strong> ';
		html += escapeHtml(suspect.motive) + '</p>';
		html += '</div>';
	}
	html += '</div>';

	// Back button to return to case board
	html += '<div class="accusation-actions">';
	html += '<button class="btn btn-secondary" ';
	html += 'onclick="enterCaseBoard()">';
	html += 'Go Back to Case Board';
	html += '</button>';
	html += '</div>';

	container.innerHTML = html;
}

/* ============================================ */
function confirmAccusation(suspectId) {
	/*
	Shows a confirmation dialog before finalizing an accusation.
	Args:
		suspectId: string ID of the suspect being accused
	*/
	var suspect = getSuspectById(suspectId);
	if (!suspect) {
		return;
	}

	var dialogHtml = '';
	dialogHtml += '<p>You are about to accuse:</p>';
	dialogHtml += '<h3>' + escapeHtml(suspect.name) + '</h3>';
	dialogHtml += '<p><strong>This action cannot be undone.</strong></p>';
	dialogHtml += '<p>Are you sure this person is the killer?</p>';
	dialogHtml += '<div class="confirmation-buttons">';
	dialogHtml += '<button class="btn btn-accent" ';
	dialogHtml += 'onclick="closeModal(); makeAccusation(\'' + suspectId + '\')">';
	dialogHtml += 'Yes, I am certain';
	dialogHtml += '</button>';
	dialogHtml += '<button class="btn btn-secondary" ';
	dialogHtml += 'onclick="closeModal()">';
	dialogHtml += 'No, let me reconsider';
	dialogHtml += '</button>';
	dialogHtml += '</div>';

	showModal('Confirm Accusation', dialogHtml);
}

/* ============================================ */
function renderRoundEnd() {
	/*
	Renders the round end score breakdown into #round-score-content.
	Shows a score card for each category with points earned and
	max possible. Color codes positive (green) and negative (red)
	values. Displays total round score prominently.
	*/
	var container = document.getElementById('round-score-content');
	if (!container) {
		return;
	}

	var roundScore = gameState.roundScores[gameState.roundScores.length - 1];
	if (!roundScore) {
		container.innerHTML = '<p>Error: No score data available.</p>';
		return;
	}

	var html = '';
	html += '<h2>Round ' + gameState.round + ' Complete</h2>';

	html += '<div class="score-card">';
	html += '<table class="score-breakdown-table">';
	html += '<thead><tr>';
	html += '<th>Category</th>';
	html += '<th>Points Earned</th>';
	html += '<th>Max Possible</th>';
	html += '</tr></thead>';
	html += '<tbody>';

	// Score categories with display names
	var categories = [
		{ key: 'sampleHandling', name: 'Sample Handling', max: SCORE_WEIGHTS.sampleHandling },
		{ key: 'chainOfCustody', name: 'Chain of Custody', max: SCORE_WEIGHTS.chainOfCustody },
		{ key: 'testSelection', name: 'Test Selection', max: SCORE_WEIGHTS.testSelection },
		{ key: 'controlUsage', name: 'Control Usage', max: SCORE_WEIGHTS.controlUsage },
		{ key: 'interpretation', name: 'Interpretation', max: SCORE_WEIGHTS.interpretation },
		{ key: 'conclusionQuality', name: 'Conclusion Quality', max: SCORE_WEIGHTS.conclusionQuality },
		{ key: 'contaminationPenalty', name: 'Contamination Penalty', max: SCORE_WEIGHTS.contaminationPenalty },
		{ key: 'efficiencyBonus', name: 'Efficiency Bonus', max: SCORE_WEIGHTS.efficiencyBonus }
	];

	for (var i = 0; i < categories.length; i++) {
		var cat = categories[i];
		var earned = roundScore[cat.key] || 0;
		var colorClass = 'score-neutral';
		if (earned > 0) {
			colorClass = 'score-positive';
		} else if (earned < 0) {
			colorClass = 'score-negative';
		}

		html += '<tr class="' + colorClass + '">';
		html += '<td>' + cat.name + '</td>';
		html += '<td>' + earned + '</td>';
		html += '<td>' + cat.max + '</td>';
		html += '</tr>';
	}

	html += '</tbody></table>';

	// Total score row
	html += '<div class="round-total">';
	html += '<strong>Round Total: ' + roundScore.total + '</strong>';
	html += ' / ' + roundScore.maxPossible + ' possible';
	html += '</div>';
	html += '</div>';

	// Cumulative score
	html += '<div class="cumulative-score">';
	html += '<p>Cumulative Score: <strong>' + gameState.totalScore + '</strong></p>';
	html += '</div>';

	// Action buttons
	html += '<div class="round-end-actions">';

	// Check if game should continue or force final accusation
	var remaining = getAliveSuspects();
	if (remaining.length <= 2) {
		html += '<button class="btn btn-accent" ';
		html += 'onclick="transitionTo(PHASE.ACCUSATION)">';
		html += 'Make Final Accusation';
		html += '</button>';
	} else {
		html += '<button class="btn btn-primary" ';
		html += 'onclick="advanceToNextRound()">';
		html += 'Next Round';
		html += '</button>';
		html += '<button class="btn btn-accent" ';
		html += 'onclick="transitionTo(PHASE.ACCUSATION)">';
		html += 'Make Final Accusation';
		html += '</button>';
	}
	html += '</div>';

	container.innerHTML = html;
}

/* ============================================ */
function renderGameOver() {
	/*
	Renders the game over screen into #game-over-content.
	Shows accusation result reveal, final score breakdown
	across all rounds, letter grade, educational summary,
	methodology feedback, and a Play Again button.
	*/
	var container = document.getElementById('game-over-content');
	if (!container) {
		return;
	}

	var html = '';

	// -- 1. Dramatic accusation reveal --
	var isCorrect = false;
	if (gameState.accusedSuspect && gameState.killer) {
		isCorrect = (gameState.accusedSuspect.id === gameState.killer.id);
	}

	html += '<div class="game-over-reveal">';
	html += '<h2>Case Closed</h2>';
	html += '<div class="killer-reveal">';
	html += '<p class="reveal-label">The killer was:</p>';
	html += '<h3 class="killer-name">' + escapeHtml(gameState.killer.name) + '</h3>';
	html += '<p class="killer-role">' + escapeHtml(gameState.killer.role) + '</p>';
	html += '<p class="killer-motive"><strong>Motive:</strong> ';
	html += escapeHtml(gameState.killer.motive) + '</p>';
	html += '</div>';

	if (isCorrect) {
		html += '<div class="verdict verdict-correct">';
		html += '<h3>Correct!</h3>';
		html += '<p>Your forensic analysis led to the right conclusion. ';
		html += 'Justice has been served.</p>';
		html += '</div>';
	} else {
		html += '<div class="verdict verdict-wrong">';
		html += '<h3>Incorrect</h3>';
		html += '<p>You accused <strong>';
		html += escapeHtml(gameState.accusedSuspect.name);
		html += '</strong>, but the real killer was <strong>';
		html += escapeHtml(gameState.killer.name);
		html += '</strong>.</p>';
		html += '<p>Review the evidence more carefully next time.</p>';
		html += '</div>';
	}
	html += '</div>';

	// -- 2. Final score breakdown across all rounds --
	var finalScore = calculateFinalScore();

	html += '<div class="final-score-section">';
	html += '<h2>Final Score Breakdown</h2>';
	html += '<table class="final-score-table">';
	html += '<thead><tr>';
	html += '<th>Round</th>';
	html += '<th>Score</th>';
	html += '<th>Samples</th>';
	html += '<th>Tests</th>';
	html += '</tr></thead>';
	html += '<tbody>';

	for (var r = 0; r < gameState.roundHistory.length; r++) {
		var rh = gameState.roundHistory[r];
		html += '<tr>';
		html += '<td>Round ' + rh.round + '</td>';
		html += '<td>' + rh.score.total + '</td>';
		html += '<td>' + rh.samplesCollected + '</td>';
		html += '<td>' + rh.testsRun + '</td>';
		html += '</tr>';
	}

	html += '</tbody></table>';

	// Accusation bonus/penalty row
	html += '<div class="accusation-score">';
	html += '<p>Accusation Bonus: <strong>';
	html += finalScore.accusationBonus + '</strong></p>';
	html += '</div>';
	html += '</div>';

	// -- 3. Total score and letter grade --
	var letterGrade = getLetterGrade(finalScore.total, finalScore.maxPossible);

	html += '<div class="total-score-display">';
	html += '<div class="letter-grade grade-' + letterGrade + '">';
	html += letterGrade;
	html += '</div>';
	html += '<div class="total-score-number">';
	html += '<p>Final Score: <strong>' + finalScore.total + '</strong>';
	html += ' / ' + finalScore.maxPossible + '</p>';
	html += '</div>';
	html += '</div>';

	// -- 4. Educational summary --
	html += '<div class="educational-summary">';
	html += '<h2>Forensic Science Summary</h2>';
	html += getEndGameSummary();
	html += '</div>';

	// -- 5. Methodology feedback --
	html += '<div class="methodology-feedback">';
	html += '<h2>Scientific Methodology Review</h2>';
	html += buildMethodologyFeedback(finalScore);
	html += '</div>';

	// -- 6. Play Again button --
	html += '<div class="game-over-actions">';
	html += '<button class="btn btn-primary" ';
	html += 'onclick="showSetupScreen()">';
	html += 'Play Again';
	html += '</button>';
	html += '</div>';

	container.innerHTML = html;
}

/* ============================================ */
function buildMethodologyFeedback(finalScore) {
	/*
	Generates feedback text about the player's scientific
	methodology based on their scoring patterns.
	Args:
		finalScore: result object from calculateFinalScore()
	Returns HTML string with feedback paragraphs.
	*/
	var html = '';
	var strengths = [];
	var improvements = [];

	// Analyze round score averages
	var roundCount = gameState.roundHistory.length;
	if (roundCount === 0) {
		return '<p>No rounds completed for analysis.</p>';
	}

	// Sum up category scores across rounds
	var totals = {
		sampleHandling: 0,
		chainOfCustody: 0,
		testSelection: 0,
		controlUsage: 0,
		interpretation: 0,
		conclusionQuality: 0,
		contaminationPenalty: 0,
		efficiencyBonus: 0
	};

	for (var r = 0; r < gameState.roundScores.length; r++) {
		var rs = gameState.roundScores[r];
		var keys = Object.keys(totals);
		for (var k = 0; k < keys.length; k++) {
			totals[keys[k]] += (rs[keys[k]] || 0);
		}
	}

	// Evaluate each area
	if (totals.sampleHandling > roundCount * 5) {
		strengths.push('Excellent evidence handling technique');
	} else {
		improvements.push('Practice proper evidence handling -- always wear gloves');
	}

	if (totals.chainOfCustody > roundCount * 5) {
		strengths.push('Strong chain of custody documentation');
	} else {
		improvements.push('Improve sample labeling and chain of custody records');
	}

	if (totals.testSelection > roundCount * 7) {
		strengths.push('Good test selection for sample types');
	} else {
		improvements.push('Choose tests that match your sample types more carefully');
	}

	if (totals.controlUsage > roundCount * 7) {
		strengths.push('Consistent use of experimental controls');
	} else {
		improvements.push('Always include positive and negative controls in your tests');
	}

	if (totals.interpretation > roundCount * 10) {
		strengths.push('Strong scientific interpretation of results');
	} else {
		improvements.push('Use more careful, evidence-based language in interpretations');
	}

	if (totals.conclusionQuality > roundCount * 10) {
		strengths.push('Well-reasoned forensic conclusions');
	} else {
		improvements.push('Write more thorough conclusions citing specific evidence');
	}

	if (totals.contaminationPenalty < 0) {
		improvements.push('Reduce contamination events by putting on gloves before collecting');
	}

	// Build output
	if (strengths.length > 0) {
		html += '<h3>Strengths</h3><ul>';
		for (var s = 0; s < strengths.length; s++) {
			html += '<li>' + strengths[s] + '</li>';
		}
		html += '</ul>';
	}

	if (improvements.length > 0) {
		html += '<h3>Areas for Improvement</h3><ul>';
		for (var m = 0; m < improvements.length; m++) {
			html += '<li>' + improvements[m] + '</li>';
		}
		html += '</ul>';
	}

	return html;
}

/* ============================================ */
function getLetterGrade(totalScore, maxPossibleScore) {
	/*
	Returns a letter grade based on percentage of max score.
	A: 90%+, B: 80-89%, C: 70-79%, D: 60-69%, F: below 60%
	Args:
		totalScore: numeric total score earned
		maxPossibleScore: numeric max possible score
	Returns single letter string: A, B, C, D, or F.
	*/
	// Avoid division by zero
	if (maxPossibleScore <= 0) {
		return 'F';
	}

	var percentage = (totalScore / maxPossibleScore) * 100;

	if (percentage >= 90) {
		return 'A';
	}
	if (percentage >= 80) {
		return 'B';
	}
	if (percentage >= 70) {
		return 'C';
	}
	if (percentage >= 60) {
		return 'D';
	}
	return 'F';
}
