/* ============================================ */
/* SECTION 3: DATA GENERATION AND EVIDENCE      */
/* ============================================ */

// Counter for generating unique sample IDs
var _sampleIdCounter = 0;

/* ============================================ */
function generateSampleId() {
	/* Generate a unique evidence sample ID string.
	   Uses an incrementing counter combined with a random suffix. */
	_sampleIdCounter++;
	var randomPart = Math.floor(Math.random() * 9000) + 1000;
	return 'EVD-' + _sampleIdCounter + '-' + randomPart;
}

/* ============================================ */
function pickRandom(arr) {
	/* Return a random element from an array. */
	return arr[Math.floor(Math.random() * arr.length)];
}

/* ============================================ */
function shuffleArray(arr) {
	/* Fisher-Yates shuffle of an array in place. Returns the array. */
	for (var i = arr.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
}

/* ============================================ */
function selectEvidenceQuality() {
	/* Select an evidence quality level based on the current difficulty.
	   Easy = mostly pristine, Medium = mixed, Hard = degraded/trace. */
	var difficulty = gameState.difficulty;
	var roll = Math.random();

	if (difficulty === 'easy') {
		// 70% pristine, 20% degraded, 10% mixed
		if (roll < 0.70) { return 'pristine'; }
		if (roll < 0.90) { return 'degraded'; }
		return 'mixed';
	}
	if (difficulty === 'medium') {
		// 30% pristine, 30% degraded, 30% mixed, 10% trace
		if (roll < 0.30) { return 'pristine'; }
		if (roll < 0.60) { return 'degraded'; }
		if (roll < 0.90) { return 'mixed'; }
		return 'trace';
	}
	// hard
	// 10% pristine, 30% degraded, 35% mixed, 25% trace
	if (roll < 0.10) { return 'pristine'; }
	if (roll < 0.40) { return 'degraded'; }
	if (roll < 0.75) { return 'mixed'; }
	return 'trace';
}

/* ============================================ */
function generateEvidenceItem(sourceCharacterId, type, location, quality) {
	/* Create a single evidence sample object.
	   Args:
	     sourceCharacterId: ID of the character this evidence came from
	     type: one of EVIDENCE_TYPES (blood, touch_dna, hair, saliva, fiber)
	     location: description of where in the room it was found
	     quality: one of EVIDENCE_QUALITY (pristine, degraded, mixed, trace)
	   Returns an evidence object ready for collection. */
	var item = {
		id: generateSampleId(),
		type: type,
		location: location,
		quality: quality,
		contaminated: false,
		labeled: false,
		chainOfCustody: false,
		sourceCharacter: sourceCharacterId,
		mixedWith: null,
		collected: false
	};
	return item;
}

/* ============================================ */
function selectInnocentSuspects(count) {
	/* Pick a number of living non-killer suspects to leave trace evidence.
	   Returns an array of suspect objects. */
	var innocents = [];
	for (var i = 0; i < gameState.suspects.length; i++) {
		var s = gameState.suspects[i];
		if (s.alive && !s.isKiller) {
			innocents.push(s);
		}
	}
	shuffleArray(innocents);
	// Return up to count suspects
	var result = [];
	for (var j = 0; j < Math.min(count, innocents.length); j++) {
		result.push(innocents[j]);
	}
	return result;
}

/* ============================================ */
function generateScene(roundNumber) {
	/* Generate a full crime scene for the given round number.
	   Round 1 always uses 'The Library'. Subsequent rounds pick
	   from rooms not yet used. Generates 4-7 evidence items
	   that always include the killer's DNA, victim DNA, and
	   1-2 innocent suspect traces.
	   Returns: { room, evidenceItems, narrative } */

	// Select a room: round 1 is always The Library
	var room = null;
	if (roundNumber === 1) {
		for (var r = 0; r < MANSION_ROOMS.length; r++) {
			if (MANSION_ROOMS[r].name === 'The Library') {
				room = MANSION_ROOMS[r];
				break;
			}
		}
	}
	// Fallback or later rounds: pick a random room
	if (!room) {
		// Collect rooms used in previous rounds to avoid repeats
		var usedRooms = {};
		for (var h = 0; h < gameState.roundHistory.length; h++) {
			var prevScene = gameState.roundHistory[h].scene;
			if (prevScene && prevScene.room) {
				usedRooms[prevScene.room.name] = true;
			}
		}
		var availableRooms = [];
		for (var a = 0; a < MANSION_ROOMS.length; a++) {
			if (!usedRooms[MANSION_ROOMS[a].name]) {
				availableRooms.push(MANSION_ROOMS[a]);
			}
		}
		// If all rooms used, allow repeats
		if (availableRooms.length === 0) {
			availableRooms = MANSION_ROOMS.slice();
		}
		room = pickRandom(availableRooms);
	}

	var evidenceItems = [];
	var locations = room.evidenceLocations.slice();
	shuffleArray(locations);
	var locationIndex = 0;

	// Determine how many evidence items (4-7)
	var itemCount = 4 + Math.floor(Math.random() * 4);
	// Make sure we do not exceed available locations
	if (itemCount > locations.length) {
		itemCount = locations.length;
	}

	// 1) Always include killer DNA evidence (blood or touch_dna)
	var killerTypes = ['blood', 'touch_dna', 'saliva'];
	var killerEvidenceType = pickRandom(killerTypes);
	var killerQuality = selectEvidenceQuality();
	// On easy mode, killer evidence is always at least degraded (never trace)
	if (gameState.difficulty === 'easy' && killerQuality === 'trace') {
		killerQuality = 'degraded';
	}
	evidenceItems.push(
		generateEvidenceItem(
			gameState.killer.id,
			killerEvidenceType,
			locations[locationIndex],
			killerQuality
		)
	);
	locationIndex++;

	// 2) Always include victim DNA (the victim is Dr. Graves)
	var victimTypes = ['blood', 'saliva'];
	evidenceItems.push(
		generateEvidenceItem(
			gameState.victim.id,
			pickRandom(victimTypes),
			locations[locationIndex],
			'pristine'
		)
	);
	locationIndex++;

	// 3) Add 1-2 innocent suspect traces
	var innocentCount = 1 + Math.floor(Math.random() * 2);
	var innocentSuspects = selectInnocentSuspects(innocentCount);
	for (var n = 0; n < innocentSuspects.length; n++) {
		if (locationIndex >= locations.length) { break; }
		var innocentType = pickRandom(EVIDENCE_TYPES);
		var innocentQuality = selectEvidenceQuality();
		var innocentItem = generateEvidenceItem(
			innocentSuspects[n].id,
			innocentType,
			locations[locationIndex],
			innocentQuality
		);
		// On harder difficulties, some innocent evidence may be mixed with killer
		if (gameState.difficulty === 'hard' && Math.random() < 0.3) {
			innocentItem.quality = 'mixed';
			innocentItem.mixedWith = gameState.killer.id;
		}
		evidenceItems.push(innocentItem);
		locationIndex++;
	}

	// 4) Fill remaining slots with assorted evidence
	while (evidenceItems.length < itemCount && locationIndex < locations.length) {
		// Pick a random source: killer, victim, or an innocent suspect
		var sourcePool = [gameState.killer.id, gameState.victim.id];
		for (var p = 0; p < innocentSuspects.length; p++) {
			sourcePool.push(innocentSuspects[p].id);
		}
		var source = pickRandom(sourcePool);
		var fillerType = pickRandom(EVIDENCE_TYPES);
		var fillerQuality = selectEvidenceQuality();
		evidenceItems.push(
			generateEvidenceItem(
				source,
				fillerType,
				locations[locationIndex],
				fillerQuality
			)
		);
		locationIndex++;
	}

	// Shuffle evidence order so killer's is not always first
	shuffleArray(evidenceItems);

	// Build the narrative text for this scene
	var latestVictimName = 'Dr. Victor Graves';
	if (roundNumber > 1 && gameState.deadCharacters.length > 1) {
		// Latest dead character (most recent victim)
		latestVictimName = gameState.deadCharacters[gameState.deadCharacters.length - 1].name;
	}

	var narrative = '';
	if (roundNumber === 1) {
		narrative += 'You arrive at the Graves mansion to find Dr. Victor Graves ';
		narrative += 'dead in ' + room.name + '. ';
		narrative += room.description + ' ';
		narrative += 'The room shows signs of a struggle. ';
		narrative += 'As the forensic investigator, you must carefully ';
		narrative += 'collect and analyze the evidence to identify the killer ';
		narrative += 'among the dinner party guests.';
	} else {
		narrative += 'The killer has struck again! ' + latestVictimName;
		narrative += ' has been found dead in ' + room.name + '. ';
		narrative += room.description + ' ';
		narrative += 'Time is running out. Examine the new crime scene ';
		narrative += 'and gather more evidence before another guest falls.';
	}

	var scene = {
		room: room,
		evidenceItems: evidenceItems,
		narrative: narrative
	};
	return scene;
}

/* ============================================ */
function getCharacterDNA(characterId) {
	/* Look up a character's full DNA profile from gameState.allCharacters.
	   Returns the character object, or null if not found. */
	for (var i = 0; i < gameState.allCharacters.length; i++) {
		if (gameState.allCharacters[i].id === characterId) {
			return gameState.allCharacters[i];
		}
	}
	return null;
}

/* ============================================ */
function generateBloodTypeResult(sample) {
	/* Generate a blood typing result for a collected sample.
	   Returns an object with the blood type and agglutination reactions
	   for anti-A, anti-B, and anti-D (Rh) reagents.
	   Trace quality samples may give no result. */

	// Trace quality: cannot determine blood type
	if (sample.quality === 'trace') {
		return {
			bloodType: 'Indeterminate',
			agglutination: { antiA: 'N/A', antiB: 'N/A', antiD: 'N/A' }
		};
	}

	var character = getCharacterDNA(sample.sourceCharacter);
	if (!character) {
		return {
			bloodType: 'Unknown',
			agglutination: { antiA: false, antiB: false, antiD: false }
		};
	}

	// Determine Rh factor (positive by default for simplicity)
	// Assign based on blood type letter distribution
	var rhPositive = true;
	// About 15% of population is Rh-negative
	if (character.id === 'jack_the_ripper' || character.id === 'aileen_wuornos') {
		rhPositive = false;
	}

	var bt = character.bloodType;
	var antiA = (bt === 'A' || bt === 'AB');
	var antiB = (bt === 'B' || bt === 'AB');

	var displayType = bt + (rhPositive ? '+' : '-');

	return {
		bloodType: displayType,
		agglutination: {
			antiA: antiA,
			antiB: antiB,
			antiD: rhPositive
		}
	};
}

/* ============================================ */
function generateRFLPResult(sample) {
	/* Generate RFLP gel electrophoresis results for a sample.
	   Returns fragment arrays for each restriction enzyme.
	   Degraded samples may lose some bands.
	   Mixed samples combine fragments from two sources. */

	var character = getCharacterDNA(sample.sourceCharacter);
	if (!character) {
		return { enzymes: {}, error: 'Unknown source' };
	}

	var result = {};
	for (var e = 0; e < RESTRICTION_ENZYMES.length; e++) {
		var enzyme = RESTRICTION_ENZYMES[e];
		var fragments = character.rflpFragments[enzyme].slice();

		// Degraded: randomly remove 1-2 bands
		if (sample.quality === 'degraded' || sample.quality === 'trace') {
			var bandsToRemove = 1 + Math.floor(Math.random() * 2);
			for (var d = 0; d < bandsToRemove && fragments.length > 1; d++) {
				var removeIdx = Math.floor(Math.random() * fragments.length);
				fragments.splice(removeIdx, 1);
			}
		}

		// Trace: may fail entirely for this enzyme
		if (sample.quality === 'trace' && Math.random() < 0.4) {
			fragments = [];
		}

		// Mixed: combine with another character's fragments
		if (sample.quality === 'mixed' && sample.mixedWith) {
			var mixedChar = getCharacterDNA(sample.mixedWith);
			if (mixedChar && mixedChar.rflpFragments[enzyme]) {
				var mixedFrags = mixedChar.rflpFragments[enzyme].slice();
				// Add the mixed fragments
				for (var m = 0; m < mixedFrags.length; m++) {
					fragments.push(mixedFrags[m]);
				}
				// Remove duplicates and sort
				var uniqueMap = {};
				for (var u = 0; u < fragments.length; u++) {
					uniqueMap[fragments[u]] = true;
				}
				fragments = [];
				var fragKeys = Object.keys(uniqueMap);
				for (var f = 0; f < fragKeys.length; f++) {
					fragments.push(parseInt(fragKeys[f], 10));
				}
			}
		}

		// Sort fragments by size (ascending for gel display: small = far)
		fragments.sort(function(a, b) { return a - b; });
		result[enzyme] = fragments;
	}

	return { enzymes: result };
}

/* ============================================ */
function generateSTRResult(sample) {
	/* Generate PCR/STR profiling results for a sample.
	   Returns allele pairs for each CODIS locus.
	   Degraded samples may have locus dropout.
	   Mixed samples show extra alleles. */

	var character = getCharacterDNA(sample.sourceCharacter);
	if (!character) {
		return { loci: {}, error: 'Unknown source' };
	}

	var loci = {};
	var locusNames = Object.keys(STR_LOCI);

	for (var i = 0; i < locusNames.length; i++) {
		var locus = locusNames[i];
		var alleles = character.strProfile[locus].slice();

		// Degraded/trace: chance of locus dropout
		if (sample.quality === 'degraded' && Math.random() < 0.2) {
			alleles = [];
			continue;
		}
		if (sample.quality === 'trace' && Math.random() < 0.5) {
			alleles = [];
			continue;
		}

		// Mixed: add alleles from the mixed source
		if (sample.quality === 'mixed' && sample.mixedWith) {
			var mixedChar = getCharacterDNA(sample.mixedWith);
			if (mixedChar && mixedChar.strProfile[locus]) {
				var mixedAlleles = mixedChar.strProfile[locus].slice();
				for (var j = 0; j < mixedAlleles.length; j++) {
					alleles.push(mixedAlleles[j]);
				}
				// Remove duplicate allele values
				var seen = {};
				var unique = [];
				for (var k = 0; k < alleles.length; k++) {
					if (!seen[alleles[k]]) {
						seen[alleles[k]] = true;
						unique.push(alleles[k]);
					}
				}
				alleles = unique;
			}
		}

		// Sort alleles ascending
		alleles.sort(function(a, b) { return a - b; });
		loci[locus] = alleles;
	}

	return { loci: loci };
}

/* ============================================ */
function generateMtDNAResult(sample) {
	/* Generate mitochondrial DNA analysis result.
	   Returns the haplotype identifier for the sample source.
	   Trace quality has a chance of failure. */

	// Trace: 30% chance of failure
	if (sample.quality === 'trace' && Math.random() < 0.3) {
		return { haplotype: 'Indeterminate', degraded: true };
	}

	var character = getCharacterDNA(sample.sourceCharacter);
	if (!character) {
		return { haplotype: 'Unknown', degraded: false };
	}

	// Mixed samples: mtDNA shows primary contributor only
	// (mtDNA from hair/bone typically shows one haplotype)
	return {
		haplotype: character.mtDNAHaplotype,
		degraded: false
	};
}

/* ============================================ */
function generateRestrictionResult(sample, enzyme) {
	/* Generate restriction enzyme digest results for a specific enzyme.
	   Returns the fragment pattern for that single enzyme.
	   Handles degradation and mixing same as RFLP. */

	var character = getCharacterDNA(sample.sourceCharacter);
	if (!character) {
		return { enzyme: enzyme, fragments: [], error: 'Unknown source' };
	}

	// Check the enzyme is valid
	if (!character.rflpFragments[enzyme]) {
		return { enzyme: enzyme, fragments: [], error: 'No data for enzyme' };
	}

	var fragments = character.rflpFragments[enzyme].slice();

	// Degraded: remove 1 band
	if (sample.quality === 'degraded' || sample.quality === 'trace') {
		if (fragments.length > 1) {
			var removeIdx = Math.floor(Math.random() * fragments.length);
			fragments.splice(removeIdx, 1);
		}
	}

	// Trace: chance of complete failure
	if (sample.quality === 'trace' && Math.random() < 0.4) {
		return { enzyme: enzyme, fragments: [], note: 'Insufficient DNA' };
	}

	// Mixed: add other source's fragments for this enzyme
	if (sample.quality === 'mixed' && sample.mixedWith) {
		var mixedChar = getCharacterDNA(sample.mixedWith);
		if (mixedChar && mixedChar.rflpFragments[enzyme]) {
			var extras = mixedChar.rflpFragments[enzyme].slice();
			for (var i = 0; i < extras.length; i++) {
				fragments.push(extras[i]);
			}
			// Deduplicate
			var uniqueMap = {};
			for (var u = 0; u < fragments.length; u++) {
				uniqueMap[fragments[u]] = true;
			}
			fragments = [];
			var keys = Object.keys(uniqueMap);
			for (var f = 0; f < keys.length; f++) {
				fragments.push(parseInt(keys[f], 10));
			}
		}
	}

	fragments.sort(function(a, b) { return a - b; });
	return { enzyme: enzyme, fragments: fragments };
}

/* ============================================ */
function generateTestResult(sample, testType, includeControl) {
	/* Generate result data for running a forensic test on a sample.
	   Dispatches to the appropriate test-specific generator.
	   Args:
	     sample: a collected evidence item object
	     testType: string key from FORENSIC_TESTS (blood_type, rflp, str, mtdna, restriction)
	     includeControl: boolean, whether a control sample was run alongside
	   Returns a result object with test-specific data and metadata. */

	var result = {
		sampleId: sample.id,
		testType: testType,
		testName: FORENSIC_TESTS[testType] ? FORENSIC_TESTS[testType].name : testType,
		timestamp: Date.now(),
		controlIncluded: includeControl || false,
		sampleQuality: sample.quality,
		contaminated: sample.contaminated,
		data: null
	};

	// Check sample type compatibility
	var testConfig = FORENSIC_TESTS[testType];
	if (testConfig) {
		var compatible = false;
		for (var i = 0; i < testConfig.sampleTypes.length; i++) {
			if (testConfig.sampleTypes[i] === sample.type) {
				compatible = true;
				break;
			}
		}
		if (!compatible) {
			result.data = { error: 'Incompatible sample type for this test' };
			result.success = false;
			return result;
		}
	}

	// Contaminated samples produce unreliable results
	if (sample.contaminated) {
		result.data = { warning: 'Sample was contaminated during collection' };
		result.reliable = false;
	}

	// Dispatch to specific test generator
	switch (testType) {
		case 'blood_type':
			result.data = generateBloodTypeResult(sample);
			break;
		case 'rflp':
			result.data = generateRFLPResult(sample);
			break;
		case 'str':
			result.data = generateSTRResult(sample);
			break;
		case 'mtdna':
			result.data = generateMtDNAResult(sample);
			break;
		case 'restriction':
			// Default to first enzyme if none specified
			result.data = generateRestrictionResult(sample, 'EcoRI');
			break;
		default:
			result.data = { error: 'Unknown test type: ' + testType };
			result.success = false;
			return result;
	}

	result.success = true;

	// Add control result if included
	if (includeControl) {
		result.controlResult = {
			status: 'passed',
			note: 'Positive and negative controls behaved as expected'
		};
	}

	return result;
}
