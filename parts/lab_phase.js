/* ============================================ */
/* LAB PHASE - Laboratory Analysis Phase        */
/* ============================================ */

/* ============================================ */
function renderLabPhase() {
	/* Render the laboratory analysis phase UI into #main-panel.
	   Shows test controls (sample selector, test type, control checkbox),
	   the run-test button, and a scrollable list of previous results.
	   Also updates the evidence sidebar with lab results. */
	var panel = document.getElementById('main-panel');
	if (!panel) {
		return;
	}

	var html = '';
	html += '<div id="lab-phase-container">';

	// Header with tests remaining counter
	html += '<div class="lab-header">';
	html += '<h2>Laboratory Analysis</h2>';
	html += '<p class="resource-counter">Tests remaining: <strong id="tests-remaining-count">';
	html += gameState.testsRemaining + '</strong></p>';
	html += '</div>';

	// Test controls section
	html += '<div class="lab-controls">';

	// Sample selector dropdown
	html += '<div class="lab-control-row">';
	html += '<label for="sample-select">Sample:</label>';
	html += '<select id="sample-select" onchange="onSampleSelected()">';
	html += '<option value="">-- Select a sample --</option>';
	for (var i = 0; i < gameState.collectedSamples.length; i++) {
		var sample = gameState.collectedSamples[i];
		// Build a readable label from sample properties
		var sampleLabel = buildSampleLabel(sample, i);
		html += '<option value="' + i + '">' + sampleLabel + '</option>';
	}
	html += '</select>';
	html += '</div>';

	// Test type selector dropdown (populated based on sample selection)
	html += '<div class="lab-control-row">';
	html += '<label for="test-select">Test Type:</label>';
	html += '<select id="test-select" disabled>';
	html += '<option value="">-- Select a sample first --</option>';
	html += '</select>';
	html += '</div>';

	// Include control sample checkbox
	html += '<div class="lab-control-row">';
	html += '<label>';
	html += '<input type="checkbox" id="control-checkbox" checked> ';
	html += 'Include Control Sample';
	html += '</label>';
	html += '<span class="hint-text">(Recommended for quality assurance)</span>';
	html += '</div>';

	// Run Test button
	html += '<div class="lab-control-row">';
	html += '<button id="btn-run-test" class="btn btn-primary" onclick="runTest()">Run Test</button>';
	html += '</div>';

	html += '</div>';

	// Active result display area
	html += '<div id="lab-result-display">';
	html += '<p class="empty-state">Select a sample and test type, then click Run Test.</p>';
	html += '</div>';

	// Previously run test results (scrollable)
	html += '<div id="previous-results">';
	html += '<h3>Previous Results</h3>';
	html += '<div id="previous-results-list">';
	if (gameState.testResults.length === 0) {
		html += '<p class="empty-state">No tests run yet this round.</p>';
	} else {
		// Render existing results in reverse order (newest first)
		for (var j = gameState.testResults.length - 1; j >= 0; j--) {
			html += buildPreviousResultCard(gameState.testResults[j], j);
		}
	}
	html += '</div>';
	html += '</div>';

	html += '</div>';
	panel.innerHTML = html;

	// Update sidebar
	updateLabResultsSidebar();
}

/* ============================================ */
function buildSampleLabel(sample, index) {
	/* Build a human-readable label for a collected evidence sample.

	Args:
		sample: sample object from gameState.collectedSamples
		index: numeric index of the sample

	Returns:
		string: descriptive label for dropdown display
	*/
	var typeLabel = sample.type || 'unknown';
	// Convert underscores to spaces for display
	typeLabel = typeLabel.replace(/_/g, ' ');
	var location = sample.location || '';
	var label = '#' + (index + 1) + ': ' + typeLabel;
	if (location) {
		label += ' (' + location + ')';
	}
	return label;
}

/* ============================================ */
function buildPreviousResultCard(result, index) {
	/* Build an HTML card summarizing a previously run test result.

	Args:
		result: test result object from gameState.testResults
		index: index in the testResults array

	Returns:
		string: HTML string for the result card
	*/
	var card = '';
	card += '<div class="result-card" id="result-card-' + index + '">';
	card += '<div class="result-card-header">';

	// Test type name
	var testInfo = FORENSIC_TESTS[result.testType];
	var testName = testInfo ? testInfo.name : result.testType;
	card += '<strong>' + testName + '</strong>';

	// Sample info
	var sampleDesc = result.sampleType || 'unknown';
	sampleDesc = sampleDesc.replace(/_/g, ' ');
	card += ' <span class="result-meta">(' + sampleDesc + ')</span>';
	card += '</div>';

	// Brief summary of the result
	card += '<div class="result-card-body">';
	card += '<p>' + getResultSummaryText(result) + '</p>';

	// Show stored interpretation if any
	if (result.interpretation) {
		card += '<p class="result-interpretation"><em>Interpretation: ';
		card += escapeHtml(result.interpretation) + '</em></p>';
	}

	card += '</div>';
	card += '</div>';
	return card;
}

/* ============================================ */
function getResultSummaryText(result) {
	/* Generate a short summary text for a test result.

	Args:
		result: test result object

	Returns:
		string: brief human-readable summary
	*/
	if (!result) {
		return 'No data available.';
	}

	var summary = '';
	switch (result.testType) {
		case 'blood_type':
			summary = 'Blood type: ' + (result.bloodType || '?');
			if (result.rhFactor !== undefined) {
				summary += (result.rhFactor ? '+' : '-');
			}
			break;
		case 'rflp':
			var fragCount = result.fragments ? result.fragments.length : 0;
			summary = 'RFLP analysis: ' + fragCount + ' fragments detected';
			if (result.enzyme) {
				summary += ' (enzyme: ' + result.enzyme + ')';
			}
			break;
		case 'str':
			var lociCount = result.strProfile ? Object.keys(result.strProfile).length : 0;
			summary = 'STR profile: ' + lociCount + ' loci analyzed';
			break;
		case 'mtdna':
			summary = 'mtDNA haplotype: ' + (result.haplotype || '?');
			break;
		case 'restriction':
			var rFragCount = result.fragments ? result.fragments.length : 0;
			summary = 'Restriction digest: ' + rFragCount + ' fragments';
			if (result.enzyme) {
				summary += ' (' + result.enzyme + ')';
			}
			break;
		default:
			summary = 'Test completed.';
	}
	return summary;
}

/* escapeHtml is defined in scene_phase.js (loaded before this file) */

/* ============================================ */
function onSampleSelected() {
	/* Handle sample selection change. Populates the test type
	   dropdown with only the tests compatible with the selected
	   sample's evidence type. */
	var sampleSelect = document.getElementById('sample-select');
	var testSelect = document.getElementById('test-select');
	if (!sampleSelect || !testSelect) {
		return;
	}

	var sampleIndex = sampleSelect.value;
	if (sampleIndex === '') {
		// No sample selected; disable test dropdown
		testSelect.disabled = true;
		testSelect.innerHTML = '<option value="">-- Select a sample first --</option>';
		return;
	}

	var sample = gameState.collectedSamples[parseInt(sampleIndex, 10)];
	if (!sample) {
		return;
	}

	var sampleType = sample.type || '';

	// Build test options filtered by sample compatibility
	var optionsHtml = '<option value="">-- Select a test --</option>';
	var testKeys = Object.keys(FORENSIC_TESTS);
	var hasOptions = false;

	for (var i = 0; i < testKeys.length; i++) {
		var testKey = testKeys[i];
		var testDef = FORENSIC_TESTS[testKey];
		// Check if this test supports the sample type
		var compatible = false;
		for (var j = 0; j < testDef.sampleTypes.length; j++) {
			if (testDef.sampleTypes[j] === sampleType) {
				compatible = true;
				break;
			}
		}
		if (compatible) {
			optionsHtml += '<option value="' + testKey + '">' + testDef.name + '</option>';
			hasOptions = true;
		}
	}

	if (!hasOptions) {
		optionsHtml = '<option value="">No compatible tests for this sample type</option>';
	}

	testSelect.innerHTML = optionsHtml;
	testSelect.disabled = !hasOptions;
}

/* ============================================ */
function runTest() {
	/* Execute a forensic test on the selected sample. Validates
	   inputs, decrements remaining tests, generates the result,
	   scores the choices, and renders the output. Called when the
	   Run Test button is clicked. */

	// Validate: tests remaining
	if (gameState.testsRemaining <= 0) {
		showModal('No Tests Remaining',
			'<p>You have used all available tests for this round.</p>' +
			'<p>Proceed to the Case Board to evaluate your evidence.</p>');
		return;
	}

	// Validate: sample selected
	var sampleSelect = document.getElementById('sample-select');
	if (!sampleSelect || sampleSelect.value === '') {
		showModal('No Sample Selected', '<p>Please select a sample to test.</p>');
		return;
	}

	// Validate: test type selected
	var testSelect = document.getElementById('test-select');
	if (!testSelect || testSelect.value === '') {
		showModal('No Test Selected', '<p>Please select a test type to run.</p>');
		return;
	}

	var sampleIndex = parseInt(sampleSelect.value, 10);
	var sample = gameState.collectedSamples[sampleIndex];
	var testType = testSelect.value;
	var controlCheckbox = document.getElementById('control-checkbox');
	var includeControl = controlCheckbox ? controlCheckbox.checked : false;

	// Decrement tests remaining
	gameState.testsRemaining--;
	var countDisplay = document.getElementById('tests-remaining-count');
	if (countDisplay) {
		countDisplay.textContent = gameState.testsRemaining;
	}

	// Generate the test result using data_generation module
	var result = generateTestResult(sample, testType, includeControl);

	// Store result in game state
	result.sampleIndex = sampleIndex;
	result.interpretation = '';
	gameState.testResults.push(result);
	gameState.currentTestResult = result;

	// Score: test selection appropriateness
	scoreTestSelection(sample, testType);

	// Score: control usage
	if (includeControl) {
		gameState.currentRoundScore.controlUsage += SCORE_WEIGHTS.controlUsage;
	}

	// Display the result
	displayTestResult(result);

	// Show the interpretation form below the result
	var resultIndex = gameState.testResults.length - 1;
	showInterpretationForm(resultIndex);

	// Update previous results list
	updatePreviousResultsList();

	// Update sidebar
	updateLabResultsSidebar();
}

/* ============================================ */
function scoreTestSelection(sample, testType) {
	/* Award points for selecting an appropriate test for the
	   given sample type. More informative tests earn more points.

	Args:
		sample: the evidence sample object
		testType: string key from FORENSIC_TESTS
	*/
	var sampleType = sample.type || '';
	var testDef = FORENSIC_TESTS[testType];
	if (!testDef) {
		return;
	}

	// Check if the test is compatible with the sample type
	var isCompatible = false;
	for (var i = 0; i < testDef.sampleTypes.length; i++) {
		if (testDef.sampleTypes[i] === sampleType) {
			isCompatible = true;
			break;
		}
	}

	if (isCompatible) {
		// Award points based on test informativeness
		var points = 0;
		switch (testType) {
			case 'str':
				// Most discriminating test
				points = SCORE_WEIGHTS.testSelection;
				break;
			case 'rflp':
				// Highly discriminating
				points = Math.floor(SCORE_WEIGHTS.testSelection * 0.8);
				break;
			case 'restriction':
				// Moderately useful
				points = Math.floor(SCORE_WEIGHTS.testSelection * 0.6);
				break;
			case 'blood_type':
				// Limited discrimination (many people share types)
				points = Math.floor(SCORE_WEIGHTS.testSelection * 0.4);
				break;
			case 'mtdna':
				// Useful for degraded/hair only
				if (sampleType === 'hair') {
					points = SCORE_WEIGHTS.testSelection;
				} else {
					points = Math.floor(SCORE_WEIGHTS.testSelection * 0.5);
				}
				break;
			default:
				points = Math.floor(SCORE_WEIGHTS.testSelection * 0.3);
		}
		gameState.currentRoundScore.testSelection += points;
	}
}

/* ============================================ */
function displayTestResult(result) {
	/* Render a test result in the lab result display area using
	   the appropriate visualization method for the test type.

	Args:
		result: test result object from generateTestResult()
	*/
	if (!result) {
		return;
	}

	switch (result.testType) {
		case 'blood_type':
			displayBloodTypeResult(result);
			break;
		case 'rflp':
			displayRFLPResult(result);
			break;
		case 'str':
			displaySTRResult(result);
			break;
		case 'mtdna':
			displayMtDNAResult(result);
			break;
		case 'restriction':
			displayRestrictionResult(result);
			break;
		default:
			displayGenericResult(result);
	}
}

/* ============================================ */
function displayBloodTypeResult(result) {
	/* Render a blood typing result as four agglutination wells
	   using HTML and CSS. Each well shows either clumped dots
	   (positive/agglutinated) or evenly distributed dots (negative).

	Args:
		result: blood typing test result object with fields:
			bloodType, rhFactor, agglutination
	*/
	var display = document.getElementById('lab-result-display');
	if (!display) {
		return;
	}

	var bloodType = result.bloodType || '?';
	var rhFactor = result.rhFactor;

	// Determine which antibodies react
	var antiAPositive = (bloodType === 'A' || bloodType === 'AB');
	var antiBPositive = (bloodType === 'B' || bloodType === 'AB');
	var antiDPositive = (rhFactor === true);

	var html = '';
	html += '<div class="blood-type-result">';
	html += '<h3>Blood Typing Result (ABO/Rh)</h3>';

	// Four wells row
	html += '<div class="blood-wells-row">';

	// Anti-A well
	html += buildBloodWellHtml('Anti-A', antiAPositive);
	// Anti-B well
	html += buildBloodWellHtml('Anti-B', antiBPositive);
	// Anti-D (Rh) well
	html += buildBloodWellHtml('Anti-D (Rh)', antiDPositive);
	// Control well (should always be negative)
	html += buildBloodWellHtml('Control', false);

	html += '</div>';

	// Interpretation guide
	html += '<div class="blood-type-guide">';
	html += '<p><strong>Result:</strong> Type <strong>' + bloodType;
	html += (rhFactor ? '+' : '-') + '</strong></p>';
	html += '<p class="hint-text">Agglutination (clumping) indicates a positive reaction.</p>';
	html += '</div>';

	html += '</div>';
	display.innerHTML = html;
}

/* ============================================ */
function buildBloodWellHtml(label, isPositive) {
	/* Build HTML for a single blood typing well showing either
	   agglutinated (clumped) or smooth (non-reactive) pattern.

	Args:
		label: antibody name for the well label
		isPositive: boolean, true if agglutination occurred

	Returns:
		string: HTML for the well element
	*/
	var wellClass = isPositive ? 'blood-well agglutinated' : 'blood-well smooth';
	var html = '';
	html += '<div class="' + wellClass + '">';
	html += '<div class="well-label">' + label + '</div>';
	html += '<div class="well-circle">';

	if (isPositive) {
		// Draw clumped dots for positive reaction
		html += '<div class="clump-pattern">';
		for (var i = 0; i < 12; i++) {
			// Position clumped dots in irregular clusters
			var top = 20 + Math.floor(i / 4) * 22 + (i % 2) * 5;
			var left = 15 + (i % 4) * 18 + (i % 3) * 3;
			html += '<span class="dot clumped" style="top:' + top + 'px;left:' + left + 'px;"></span>';
		}
		html += '</div>';
	} else {
		// Draw evenly distributed dots for negative reaction
		html += '<div class="smooth-pattern">';
		for (var j = 0; j < 16; j++) {
			var sTop = 10 + Math.floor(j / 4) * 20;
			var sLeft = 10 + (j % 4) * 20;
			html += '<span class="dot smooth" style="top:' + sTop + 'px;left:' + sLeft + 'px;"></span>';
		}
		html += '</div>';
	}

	html += '</div>';
	html += '<div class="well-result">' + (isPositive ? '+' : '-') + '</div>';
	html += '</div>';
	return html;
}

/* ============================================ */
function displayRFLPResult(result) {
	/* Render an RFLP analysis result as a gel electrophoresis image.
	   Shows the evidence sample alongside suspect reference profiles.

	Args:
		result: RFLP test result object with fields:
			fragments, enzyme, suspectProfiles, controlFragments
	*/
	var display = document.getElementById('lab-result-display');
	if (!display) {
		return;
	}

	var html = '';
	html += '<div class="rflp-result">';
	html += '<h3>RFLP Gel Electrophoresis</h3>';

	// Canvas container for inline gel display
	html += '<div class="gel-container">';
	html += '<canvas id="rflp-inline-canvas" width="700" height="450"></canvas>';
	html += '</div>';

	// Enlarge button
	html += '<button class="btn btn-small" onclick="showRFLPGelModal()">Enlarge Gel</button>';

	// Enzyme info
	html += '<p class="result-meta">Enzyme used: <strong>';
	html += (result.enzyme || 'EcoRI') + '</strong></p>';

	html += '</div>';
	display.innerHTML = html;

	// Build lanes for gel rendering
	var lanes = buildRFLPLanes(result);
	var gelTitle = 'RFLP Analysis - ' + (result.enzyme || 'EcoRI');
	renderGel('rflp-inline-canvas', lanes, gelTitle);

	// Store lanes for modal enlargement
	gameState._lastRFLPLanes = lanes;
	gameState._lastRFLPTitle = gelTitle;
}

/* ============================================ */
function buildRFLPLanes(result) {
	/* Build lane data for RFLP gel rendering from a test result.

	Args:
		result: RFLP test result object

	Returns:
		array: lane objects for renderGel()
	*/
	var lanes = [];

	// Evidence sample lane
	lanes.push({
		label: 'Evidence',
		fragments: result.fragments || [],
		intensity: 0.9
	});

	// Control lane if included
	if (result.controlFragments) {
		lanes.push({
			label: 'Control',
			fragments: result.controlFragments,
			intensity: 0.7
		});
	}

	// Suspect reference lanes
	if (result.suspectProfiles) {
		var suspectIds = Object.keys(result.suspectProfiles);
		for (var i = 0; i < suspectIds.length; i++) {
			var suspectId = suspectIds[i];
			var suspect = getSuspectById(suspectId);
			var suspectName = suspect ? suspect.name.split(' ')[0] : suspectId;
			lanes.push({
				label: suspectName,
				fragments: result.suspectProfiles[suspectId],
				intensity: 0.85
			});
		}
	}

	return lanes;
}

/* ============================================ */
function showRFLPGelModal() {
	/* Show the last rendered RFLP gel in an enlarged modal view. */
	if (gameState._lastRFLPLanes && gameState._lastRFLPTitle) {
		showGelInModal(gameState._lastRFLPLanes, gameState._lastRFLPTitle);
	}
}

/* ============================================ */
function displaySTRResult(result) {
	/* Render an STR profiling result as a bar chart of allele peaks
	   using the gel canvas repurposed as a chart area.

	Args:
		result: STR test result object with fields:
			strProfile (object mapping locus to allele arrays)
	*/
	var display = document.getElementById('lab-result-display');
	if (!display) {
		return;
	}

	var html = '';
	html += '<div class="str-result">';
	html += '<h3>PCR/STR Profiling Result</h3>';

	// Inline canvas for STR chart
	html += '<div class="gel-container">';
	html += '<canvas id="str-inline-canvas" width="700" height="450"></canvas>';
	html += '</div>';

	// Profile summary table
	html += '<div class="str-profile-table">';
	html += '<table>';
	html += '<tr><th>Locus</th><th>Allele 1</th><th>Allele 2</th></tr>';

	var strProfile = result.strProfile || {};
	var loci = Object.keys(strProfile);
	for (var i = 0; i < loci.length; i++) {
		var locus = loci[i];
		var alleles = strProfile[locus];
		var a1 = (alleles && alleles.length > 0) ? alleles[0] : '-';
		var a2 = (alleles && alleles.length > 1) ? alleles[1] : '-';
		html += '<tr>';
		html += '<td>' + locus + '</td>';
		html += '<td>' + a1 + '</td>';
		html += '<td>' + a2 + '</td>';
		html += '</tr>';
	}

	html += '</table>';
	html += '</div>';

	html += '</div>';
	display.innerHTML = html;

	// Render the STR chart on the inline canvas
	var chartTitle = 'STR Electropherogram';
	renderSTRChart('str-inline-canvas', strProfile, chartTitle);
}

/* ============================================ */
function displayMtDNAResult(result) {
	/* Render a mitochondrial DNA analysis result as a text/HTML
	   display showing the haplotype identifier and relevant notes.

	Args:
		result: mtDNA test result object with fields:
			haplotype, haplogroup
	*/
	var display = document.getElementById('lab-result-display');
	if (!display) {
		return;
	}

	var haplotype = result.haplotype || 'Unknown';

	var html = '';
	html += '<div class="mtdna-result">';
	html += '<h3>Mitochondrial DNA Analysis</h3>';

	// Haplotype display card
	html += '<div class="mtdna-card">';
	html += '<div class="mtdna-haplotype">';
	html += '<span class="mtdna-label">Haplotype:</span> ';
	html += '<span class="mtdna-value">' + haplotype + '</span>';
	html += '</div>';

	// Haplogroup info if available
	if (result.haplogroup) {
		html += '<div class="mtdna-haplogroup">';
		html += '<span class="mtdna-label">Haplogroup:</span> ';
		html += '<span class="mtdna-value">' + result.haplogroup + '</span>';
		html += '</div>';
	}

	html += '</div>';

	// Educational note about maternal inheritance
	html += '<div class="mtdna-note">';
	html += '<p><strong>Note:</strong> Mitochondrial DNA is inherited ';
	html += 'exclusively from the mother. All individuals sharing the same ';
	html += 'maternal lineage will have identical mtDNA haplotypes. This ';
	html += 'means mtDNA cannot distinguish between maternally related ';
	html += 'individuals, but it can <em>exclude</em> individuals who do ';
	html += 'not share the same maternal line.</p>';
	html += '<p class="hint-text">mtDNA is especially useful for degraded ';
	html += 'samples and hair without roots, where nuclear DNA may be ';
	html += 'unavailable.</p>';
	html += '</div>';

	html += '</div>';
	display.innerHTML = html;
}

/* ============================================ */
function displayRestrictionResult(result) {
	/* Render a restriction enzyme digest result as a simplified gel.

	Args:
		result: restriction digest test result with fields:
			fragments, enzyme, suspectProfiles
	*/
	var display = document.getElementById('lab-result-display');
	if (!display) {
		return;
	}

	var enzyme = result.enzyme || 'EcoRI';

	var html = '';
	html += '<div class="restriction-result">';
	html += '<h3>Restriction Enzyme Digest</h3>';

	// Inline canvas
	html += '<div class="gel-container">';
	html += '<canvas id="restriction-inline-canvas" width="700" height="450"></canvas>';
	html += '</div>';

	// Enzyme info
	html += '<p class="result-meta">Enzyme: <strong>' + enzyme + '</strong></p>';
	html += '<p class="hint-text">Compare band patterns between the evidence ';
	html += 'and suspect lanes. Matching patterns indicate the same DNA source.</p>';

	html += '</div>';
	display.innerHTML = html;

	// Build suspect fragments map for the restriction gel
	var suspectFragments = {};
	if (result.suspectProfiles) {
		var suspectIds = Object.keys(result.suspectProfiles);
		for (var i = 0; i < suspectIds.length; i++) {
			var sid = suspectIds[i];
			var suspect = getSuspectById(sid);
			var name = suspect ? suspect.name : sid;
			suspectFragments[name] = result.suspectProfiles[sid];
		}
	}

	var sampleFragments = result.fragments || [];
	renderRestrictionGel('restriction-inline-canvas', sampleFragments, suspectFragments, enzyme);
}

/* ============================================ */
function displayGenericResult(result) {
	/* Fallback display for unrecognized test types.

	Args:
		result: test result object
	*/
	var display = document.getElementById('lab-result-display');
	if (!display) {
		return;
	}

	var html = '';
	html += '<div class="generic-result">';
	html += '<h3>Test Result</h3>';
	html += '<p>' + getResultSummaryText(result) + '</p>';
	html += '</div>';
	display.innerHTML = html;
}

/* ============================================ */
function showInterpretationForm(resultIndex) {
	/* Display a textarea form below the test result visualization
	   for the player to write their interpretation of the result.

	Args:
		resultIndex: index of the test result in gameState.testResults
	*/
	var display = document.getElementById('lab-result-display');
	if (!display) {
		return;
	}

	var html = '';
	html += '<div class="interpretation-form" id="interpretation-form">';
	html += '<h4>Interpret Results</h4>';
	html += '<p class="hint-text">Describe what you observe. Do the patterns ';
	html += 'match any suspects? Use terms like "match", "exclude", ';
	html += '"consistent", "inconclusive", or "partial" for best results.</p>';
	html += '<textarea id="interpretation-text" rows="4" ';
	html += 'placeholder="Write your interpretation of the test results here..."></textarea>';
	html += '<button class="btn btn-primary" onclick="submitInterpretation(' + resultIndex + ')">Submit Interpretation</button>';
	html += '</div>';

	// Append the form to the display area
	display.innerHTML += html;
}

/* ============================================ */
function submitInterpretation(resultIndex, interpretationText) {
	/* Save the player's interpretation for a test result and
	   award scoring points based on the quality of the language.
	   Good forensic terms earn points. Overclaiming loses points.

	Args:
		resultIndex: index in gameState.testResults
		interpretationText: optional string; if not provided, reads from textarea
	*/
	// Read from textarea if text not passed directly
	if (!interpretationText) {
		var textarea = document.getElementById('interpretation-text');
		if (!textarea) {
			return;
		}
		interpretationText = textarea.value.trim();
	}

	if (interpretationText.length === 0) {
		showModal('Empty Interpretation',
			'<p>Please write an interpretation before submitting.</p>');
		return;
	}

	// Store the interpretation with the test result
	if (resultIndex >= 0 && resultIndex < gameState.testResults.length) {
		gameState.testResults[resultIndex].interpretation = interpretationText;
	}

	// Score the interpretation based on keyword analysis
	var points = scoreInterpretation(interpretationText);
	gameState.currentRoundScore.interpretation += points;

	// Remove the form and show confirmation
	var form = document.getElementById('interpretation-form');
	if (form) {
		var confirmHtml = '';
		confirmHtml += '<div class="interpretation-saved">';
		confirmHtml += '<p><strong>Interpretation saved.</strong>';
		if (points > 0) {
			confirmHtml += ' (+' + points + ' points)</p>';
		} else if (points < 0) {
			confirmHtml += ' (' + points + ' points - avoid overclaiming)</p>';
		} else {
			confirmHtml += '</p>';
		}
		confirmHtml += '<p class="hint-text"><em>' + escapeHtml(interpretationText) + '</em></p>';
		confirmHtml += '</div>';
		form.innerHTML = confirmHtml;
	}

	// Update sidebar and previous results
	updateLabResultsSidebar();
	updatePreviousResultsList();
}

/* ============================================ */
function scoreInterpretation(text) {
	/* Evaluate interpretation text and return a score based on
	   the presence of good forensic language vs overclaiming.

	Args:
		text: the player's interpretation string

	Returns:
		number: positive or negative score adjustment
	*/
	var lowerText = text.toLowerCase();
	var score = 0;

	// Good forensic keywords (earn points)
	var goodKeywords = ['match', 'exclude', 'consistent', 'inconclusive', 'partial', 'degraded'];
	for (var i = 0; i < goodKeywords.length; i++) {
		if (lowerText.indexOf(goodKeywords[i]) !== -1) {
			score += 3;
		}
	}

	// Overclaiming keywords (lose points)
	var badKeywords = ['definitely', 'proves', '100%', 'certain', 'no doubt', 'absolute'];
	for (var j = 0; j < badKeywords.length; j++) {
		if (lowerText.indexOf(badKeywords[j]) !== -1) {
			score -= 4;
			// Also apply the overclaiming penalty to the round score
			gameState.currentRoundScore.overclaimingPenalty += SCORE_WEIGHTS.overclaimingPenalty;
		}
	}

	// Cap the positive score at the interpretation weight
	score = Math.min(score, SCORE_WEIGHTS.interpretation);
	return score;
}

/* ============================================ */
function updatePreviousResultsList() {
	/* Refresh the previous results scrollable list in the lab UI
	   with the latest test results from the game state. */
	var listContainer = document.getElementById('previous-results-list');
	if (!listContainer) {
		return;
	}

	if (gameState.testResults.length === 0) {
		listContainer.innerHTML = '<p class="empty-state">No tests run yet this round.</p>';
		return;
	}

	var html = '';
	// Render in reverse order so newest results appear first
	for (var i = gameState.testResults.length - 1; i >= 0; i--) {
		html += buildPreviousResultCard(gameState.testResults[i], i);
	}
	listContainer.innerHTML = html;
}

/* ============================================ */
function updateLabResultsSidebar() {
	/* Update the #results-list element in the evidence sidebar
	   with a summary of all test results run this round. */
	var resultsList = document.getElementById('results-list');
	var summaryContainer = document.getElementById('lab-results-summary');
	if (!resultsList) {
		return;
	}

	if (gameState.testResults.length === 0) {
		// Hide the lab results section if no tests have been run
		if (summaryContainer) {
			summaryContainer.style.display = 'none';
		}
		return;
	}

	// Show the lab results section
	if (summaryContainer) {
		summaryContainer.style.display = 'block';
	}

	var html = '';
	for (var i = 0; i < gameState.testResults.length; i++) {
		var result = gameState.testResults[i];
		var testInfo = FORENSIC_TESTS[result.testType];
		var testName = testInfo ? testInfo.name : result.testType;
		var sampleType = (result.sampleType || '').replace(/_/g, ' ');

		html += '<div class="sidebar-result-item">';
		html += '<strong>' + testName + '</strong>';
		html += '<br><span class="result-meta">' + sampleType + '</span>';
		html += '<br><span class="result-meta">' + getResultSummaryText(result) + '</span>';
		html += '</div>';
	}

	resultsList.innerHTML = html;
}
