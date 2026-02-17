/* ============================================ */
/* SECTION 8: SCORING ENGINE                   */
/* ============================================ */

// Scientific language keywords for interpretation scoring
var GOOD_SCIENCE_KEYWORDS = [
	'consistent with', 'match', 'exclude', 'pattern',
	'supports', 'indicates', 'correlates', 'compatible'
];

var CAUTIOUS_SCIENCE_KEYWORDS = [
	'inconclusive', 'further testing', 'partial', 'degraded',
	'insufficient', 'cannot determine', 'limited', 'possible'
];

var OVERCLAIMING_KEYWORDS = [
	'definitely', 'proves', '100%', 'certainly',
	'without a doubt', 'guaranteed', 'absolute', 'undeniable',
	'no question', 'obviously'
];

var EVIDENCE_REFERENCE_KEYWORDS = [
	'sample', 'blood', 'dna', 'hair', 'saliva', 'fiber',
	'fragment', 'locus', 'loci', 'allele', 'band', 'haplotype',
	'type', 'profile', 'result', 'test'
];

var REASONING_KEYWORDS = [
	'because', 'therefore', 'however', 'although',
	'suggests', 'indicates', 'based on', 'given that',
	'considering', 'while', 'since', 'combined with'
];

var UNCERTAINTY_KEYWORDS = [
	'likely', 'unlikely', 'probable', 'possible',
	'may', 'might', 'could', 'suggests',
	'consistent with', 'cannot exclude', 'appears to'
];

/* ============================================ */
function calculateRoundScore() {
	/*
	Evaluates the player's work this round and returns
	a score object with all categories and total.
	Scoring rewards scientific rigor, not just correct answers.
	Returns: {
		sampleHandling, chainOfCustody, testSelection,
		controlUsage, interpretation, conclusionQuality,
		contaminationPenalty, efficiencyBonus,
		total, maxPossible
	}
	*/
	var score = {
		sampleHandling: 0,
		chainOfCustody: 0,
		testSelection: 0,
		controlUsage: 0,
		interpretation: 0,
		conclusionQuality: 0,
		contaminationPenalty: 0,
		efficiencyBonus: 0,
		total: 0,
		maxPossible: 0
	};

	// -- 1. Sample Handling (0 to SCORE_WEIGHTS.sampleHandling) --
	// +2 per sample collected with gloves on
	// -3 per sample collected without gloves (contaminated)
	var samples = gameState.collectedSamples;
	for (var s = 0; s < samples.length; s++) {
		if (samples[s].contaminated) {
			score.sampleHandling -= 3;
		} else {
			score.sampleHandling += 2;
		}
	}
	score.sampleHandling = clampScore(score.sampleHandling, 0, SCORE_WEIGHTS.sampleHandling);

	// -- 2. Chain of Custody (0 to SCORE_WEIGHTS.chainOfCustody) --
	// +2 per sample with matching label (type matches actual type)
	// +1 per sample with location notes
	for (var c = 0; c < samples.length; c++) {
		// Check if player-selected evidence type matches actual type
		if (samples[c].evidenceType === samples[c].actualType) {
			score.chainOfCustody += 2;
		}
		// Check if location notes were provided
		if (samples[c].locationNotes && samples[c].locationNotes.length > 3) {
			score.chainOfCustody += 1;
		}
	}
	score.chainOfCustody = clampScore(score.chainOfCustody, 0, SCORE_WEIGHTS.chainOfCustody);

	// -- 3. Test Selection (0 to SCORE_WEIGHTS.testSelection) --
	// +5 per test run on compatible sample type
	// -3 per test run on incompatible sample type
	var results = gameState.testResults;
	for (var t = 0; t < results.length; t++) {
		var result = results[t];
		if (result.success) {
			score.testSelection += 5;
		} else if (result.data && result.data.error &&
			result.data.error.indexOf('Incompatible') !== -1) {
			// Incompatible sample type penalty
			score.testSelection -= 3;
		}
	}
	score.testSelection = clampScore(score.testSelection, 0, SCORE_WEIGHTS.testSelection);

	// -- 4. Control Usage (0 to SCORE_WEIGHTS.controlUsage) --
	// +5 per test with control included
	// -2 per test without control
	for (var u = 0; u < results.length; u++) {
		if (results[u].controlIncluded) {
			score.controlUsage += 5;
		} else {
			score.controlUsage -= 2;
		}
	}
	score.controlUsage = clampScore(score.controlUsage, 0, SCORE_WEIGHTS.controlUsage);

	// -- 5. Interpretation (0 to SCORE_WEIGHTS.interpretation) --
	// Scan interpretation text from test results for scientific keywords
	var interpretationTotal = 0;
	for (var p = 0; p < results.length; p++) {
		if (results[p].playerInterpretation) {
			var evalResult = evaluateInterpretation(results[p].playerInterpretation);
			interpretationTotal += evalResult.score;
		}
	}
	score.interpretation = clampScore(interpretationTotal, 0, SCORE_WEIGHTS.interpretation);

	// -- 6. Conclusion Quality (0 to SCORE_WEIGHTS.conclusionQuality) --
	var conclusionEval = evaluateConclusion(gameState.currentConclusion);
	score.conclusionQuality = clampScore(conclusionEval.score, 0, SCORE_WEIGHTS.conclusionQuality);

	// -- 7. Contamination Penalty --
	// -3 per contamination event
	var contaminationPenalty = gameState.contaminationEvents * -3;
	// Cap uses absolute value of the weight (weight is already negative)
	score.contaminationPenalty = clampScore(
		contaminationPenalty,
		SCORE_WEIGHTS.contaminationPenalty,
		0
	);

	// -- 8. Efficiency Bonus --
	// +2 per unused swab (rewarding minimal collection)
	// +2 per unused test (rewarding targeted testing)
	var unusedSwabs = gameState.swabsRemaining;
	var unusedTests = gameState.testsRemaining;
	score.efficiencyBonus = (unusedSwabs * 2) + (unusedTests * 2);
	score.efficiencyBonus = clampScore(score.efficiencyBonus, 0, SCORE_WEIGHTS.efficiencyBonus);

	// -- Calculate total and max possible --
	score.total = score.sampleHandling
		+ score.chainOfCustody
		+ score.testSelection
		+ score.controlUsage
		+ score.interpretation
		+ score.conclusionQuality
		+ score.contaminationPenalty
		+ score.efficiencyBonus;

	// Max possible is the sum of all positive weight caps
	score.maxPossible = SCORE_WEIGHTS.sampleHandling
		+ SCORE_WEIGHTS.chainOfCustody
		+ SCORE_WEIGHTS.testSelection
		+ SCORE_WEIGHTS.controlUsage
		+ SCORE_WEIGHTS.interpretation
		+ SCORE_WEIGHTS.conclusionQuality
		+ SCORE_WEIGHTS.efficiencyBonus;

	return score;
}

/* ============================================ */
function clampScore(value, minVal, maxVal) {
	/*
	Restricts a numeric value to the given range.
	Args:
		value: number to clamp
		minVal: minimum allowed value
		maxVal: maximum allowed value
	Returns the clamped number.
	*/
	if (value < minVal) {
		return minVal;
	}
	if (value > maxVal) {
		return maxVal;
	}
	return value;
}

/* ============================================ */
function evaluateInterpretation(text) {
	/*
	Scores a single interpretation string for scientific
	language quality.
	Args:
		text: the player-written interpretation string
	Returns: { score: number, feedback: string }
	*/
	var result = { score: 0, feedback: '' };

	if (!text || text.length === 0) {
		result.feedback = 'No interpretation provided.';
		return result;
	}

	var lowerText = text.toLowerCase();
	var feedbackParts = [];

	// Check for good scientific keywords (+3 each)
	var goodCount = 0;
	for (var g = 0; g < GOOD_SCIENCE_KEYWORDS.length; g++) {
		if (lowerText.indexOf(GOOD_SCIENCE_KEYWORDS[g]) !== -1) {
			goodCount++;
			result.score += 3;
		}
	}
	if (goodCount > 0) {
		feedbackParts.push('Good use of scientific terminology (' + goodCount + ' terms)');
	}

	// Check for cautious/careful keywords (+2 each)
	var cautiousCount = 0;
	for (var c = 0; c < CAUTIOUS_SCIENCE_KEYWORDS.length; c++) {
		if (lowerText.indexOf(CAUTIOUS_SCIENCE_KEYWORDS[c]) !== -1) {
			cautiousCount++;
			result.score += 2;
		}
	}
	if (cautiousCount > 0) {
		feedbackParts.push('Appropriate caution in language (' + cautiousCount + ' terms)');
	}

	// Check for overclaiming keywords (-3 each)
	var overclaimCount = 0;
	for (var o = 0; o < OVERCLAIMING_KEYWORDS.length; o++) {
		if (lowerText.indexOf(OVERCLAIMING_KEYWORDS[o]) !== -1) {
			overclaimCount++;
			result.score -= 3;
		}
	}
	if (overclaimCount > 0) {
		feedbackParts.push('Warning: overclaiming detected (' + overclaimCount + ' instances)');
	}

	// Minimum score of 0 for individual interpretations
	if (result.score < 0) {
		result.score = 0;
	}

	// Build feedback string
	if (feedbackParts.length > 0) {
		result.feedback = feedbackParts.join('. ') + '.';
	} else {
		result.feedback = 'Consider using more precise scientific language.';
	}

	return result;
}

/* ============================================ */
function evaluateConclusion(text) {
	/*
	Scores the overall forensic conclusion text.
	Args:
		text: the player-written conclusion string
	Returns: { score: number, feedback: string, isOverclaiming: boolean }
	*/
	var result = { score: 0, feedback: '', isOverclaiming: false };

	if (!text || text.length === 0) {
		result.feedback = 'No conclusion was written. A forensic report always includes a conclusion.';
		return result;
	}

	var lowerText = text.toLowerCase();
	var feedbackParts = [];

	// +5 for mentioning specific evidence
	var evidenceRefCount = 0;
	for (var e = 0; e < EVIDENCE_REFERENCE_KEYWORDS.length; e++) {
		if (lowerText.indexOf(EVIDENCE_REFERENCE_KEYWORDS[e]) !== -1) {
			evidenceRefCount++;
		}
	}
	if (evidenceRefCount >= 2) {
		result.score += 5;
		feedbackParts.push('Good references to specific evidence');
	} else if (evidenceRefCount === 1) {
		result.score += 2;
		feedbackParts.push('Some evidence references, but could be more specific');
	} else {
		feedbackParts.push('Conclusion should reference specific evidence collected');
	}

	// +5 for proper uncertainty language
	var uncertaintyCount = 0;
	for (var u = 0; u < UNCERTAINTY_KEYWORDS.length; u++) {
		if (lowerText.indexOf(UNCERTAINTY_KEYWORDS[u]) !== -1) {
			uncertaintyCount++;
		}
	}
	if (uncertaintyCount >= 2) {
		result.score += 5;
		feedbackParts.push('Appropriate use of uncertainty language');
	} else if (uncertaintyCount === 1) {
		result.score += 2;
		feedbackParts.push('Some uncertainty acknowledged');
	} else {
		feedbackParts.push('Forensic conclusions should express appropriate uncertainty');
	}

	// +5 for logical reasoning words
	var reasoningCount = 0;
	for (var r = 0; r < REASONING_KEYWORDS.length; r++) {
		if (lowerText.indexOf(REASONING_KEYWORDS[r]) !== -1) {
			reasoningCount++;
		}
	}
	if (reasoningCount >= 2) {
		result.score += 5;
		feedbackParts.push('Strong logical reasoning');
	} else if (reasoningCount === 1) {
		result.score += 2;
		feedbackParts.push('Some logical structure present');
	} else {
		feedbackParts.push('Add reasoning that connects evidence to conclusion');
	}

	// -5 for overclaiming
	var overclaimCount = 0;
	for (var o = 0; o < OVERCLAIMING_KEYWORDS.length; o++) {
		if (lowerText.indexOf(OVERCLAIMING_KEYWORDS[o]) !== -1) {
			overclaimCount++;
		}
	}
	if (overclaimCount > 0) {
		result.score -= 5;
		result.isOverclaiming = true;
		feedbackParts.push('WARNING: Avoid absolute statements in forensic conclusions');
	}

	// Bonus for length (substantive conclusions)
	if (text.length > 200) {
		result.score += 3;
		feedbackParts.push('Thorough analysis');
	} else if (text.length > 100) {
		result.score += 1;
	}

	// Floor at 0
	if (result.score < 0) {
		result.score = 0;
	}

	result.feedback = feedbackParts.join('. ') + '.';
	return result;
}

/* ============================================ */
function calculateFinalScore() {
	/*
	Calculates the complete final game score.
	Sums all round scores and adds bonus/penalty for
	accusation correctness.
	Returns: {
		roundTotal, accusationBonus, total, maxPossible,
		isCorrectAccusation
	}
	*/
	// Sum round scores
	var roundTotal = 0;
	var roundMaxTotal = 0;
	for (var i = 0; i < gameState.roundScores.length; i++) {
		roundTotal += gameState.roundScores[i].total;
		roundMaxTotal += gameState.roundScores[i].maxPossible;
	}

	// Accusation bonus/penalty
	var accusationBonus = 0;
	var isCorrect = false;

	if (gameState.accusationMade && gameState.accusedSuspect && gameState.killer) {
		isCorrect = (gameState.accusedSuspect.id === gameState.killer.id);

		if (isCorrect) {
			// +20 base bonus for correct accusation
			accusationBonus = 20;

			// +10 additional if player had strong evidence
			// (ran at least 3 tests with controls)
			var testsWithControls = 0;
			for (var t = 0; t < gameState.testResults.length; t++) {
				if (gameState.testResults[t].controlIncluded) {
					testsWithControls++;
				}
			}
			if (testsWithControls >= 3) {
				accusationBonus += 10;
			}
		} else {
			// -10 penalty for wrong accusation
			accusationBonus = -10;
		}
	}

	// Max possible includes accusation bonus
	var maxPossible = roundMaxTotal + 30;

	var total = roundTotal + accusationBonus;

	var finalResult = {
		roundTotal: roundTotal,
		accusationBonus: accusationBonus,
		total: total,
		maxPossible: maxPossible,
		isCorrectAccusation: isCorrect
	};
	return finalResult;
}
