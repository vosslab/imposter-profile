/* ============================================ */
/* SECTION 4: GAME STATE MACHINE                */
/* ============================================ */

// Global game state - read/written by all modules
let gameState = {
	// Current phase
	phase: PHASE.TITLE,
	difficulty: 'medium',
	round: 1,
	maxRounds: 10,

	// Characters
	victim: null,
	suspects: [],
	killer: null,
	deadCharacters: [],
	allCharacters: [],

	// Current round state
	currentScene: null,
	availableEvidence: [],
	collectedSamples: [],
	swabsRemaining: 0,
	glovesOn: false,
	contaminationEvents: 0,

	// Lab state
	testsRemaining: 0,
	testResults: [],
	currentTestResult: null,

	// Case board state
	suspectNotes: {},
	currentConclusion: '',
	accusationMade: false,
	accusedSuspect: null,

	// Scoring
	totalScore: 0,
	roundScores: [],
	currentRoundScore: {
		sampleHandling: 0,
		chainOfCustody: 0,
		testSelection: 0,
		controlUsage: 0,
		interpretation: 0,
		conclusionQuality: 0,
		contaminationPenalty: 0,
		overclaimingPenalty: 0,
		efficiencyBonus: 0
	},

	// Timer
	timerSeconds: 0,
	timerMax: 0,
	timerRunning: false,
	timerInterval: null,

	// Game history
	roundHistory: [],
	evidenceLog: [],

	// Flags
	gameStarted: false,
	gameOver: false,
	tutorialShown: false
};

/* ============================================ */
function resetGameState() {
	/* Reset game state for a new game. */
	gameState.phase = PHASE.TITLE;
	gameState.round = 1;
	gameState.victim = null;
	gameState.suspects = [];
	gameState.killer = null;
	gameState.deadCharacters = [];
	gameState.allCharacters = [];
	gameState.currentScene = null;
	gameState.availableEvidence = [];
	gameState.collectedSamples = [];
	gameState.swabsRemaining = 0;
	gameState.glovesOn = false;
	gameState.contaminationEvents = 0;
	gameState.testsRemaining = 0;
	gameState.testResults = [];
	gameState.currentTestResult = null;
	gameState.suspectNotes = {};
	gameState.currentConclusion = '';
	gameState.accusationMade = false;
	gameState.accusedSuspect = null;
	gameState.totalScore = 0;
	gameState.roundScores = [];
	gameState.currentRoundScore = {
		sampleHandling: 0,
		chainOfCustody: 0,
		testSelection: 0,
		controlUsage: 0,
		interpretation: 0,
		conclusionQuality: 0,
		contaminationPenalty: 0,
		overclaimingPenalty: 0,
		efficiencyBonus: 0
	};
	gameState.timerSeconds = 0;
	gameState.timerMax = 0;
	gameState.timerRunning = false;
	if (gameState.timerInterval) {
		clearInterval(gameState.timerInterval);
	}
	gameState.timerInterval = null;
	gameState.roundHistory = [];
	gameState.evidenceLog = [];
	gameState.gameStarted = false;
	gameState.gameOver = false;
	gameState.tutorialShown = false;
}

/* ============================================ */
function resetRoundState() {
	/* Reset state for a new round within the same game. */
	gameState.currentScene = null;
	gameState.availableEvidence = [];
	gameState.collectedSamples = [];
	gameState.swabsRemaining = DIFFICULTY_CONFIG[gameState.difficulty].swabsPerRound;
	gameState.glovesOn = false;
	gameState.contaminationEvents = 0;
	gameState.testsRemaining = DIFFICULTY_CONFIG[gameState.difficulty].testsPerRound;
	gameState.currentTestResult = null;
	gameState.currentConclusion = '';
	gameState.currentRoundScore = {
		sampleHandling: 0,
		chainOfCustody: 0,
		testSelection: 0,
		controlUsage: 0,
		interpretation: 0,
		conclusionQuality: 0,
		contaminationPenalty: 0,
		overclaimingPenalty: 0,
		efficiencyBonus: 0
	};
}

/* ============================================ */
function transitionTo(newPhase) {
	/* Transition game state to a new phase and update the UI.
	   Validates transitions and handles phase entry logic. */
	let oldPhase = gameState.phase;
	gameState.phase = newPhase;

	// Stop timer between phases if needed
	if (newPhase === PHASE.ROUND_END || newPhase === PHASE.GAME_OVER || newPhase === PHASE.ACCUSATION) {
		stopTimer();
	}

	// Hide all screens
	let screens = document.querySelectorAll('.screen');
	for (let i = 0; i < screens.length; i++) {
		screens[i].classList.remove('active');
	}

	// Show appropriate screen and render content
	switch (newPhase) {
		case PHASE.TITLE:
			document.getElementById('title-screen').classList.add('active');
			break;

		case PHASE.SETUP:
			document.getElementById('setup-screen').classList.add('active');
			renderSetupScreen();
			break;

		case PHASE.INTRO:
			document.getElementById('intro-screen').classList.add('active');
			renderIntroBriefing();
			break;

		case PHASE.SCENE:
			document.getElementById('game-screen').classList.add('active');
			updatePhaseDisplay('Scene Investigation');
			updatePhaseNav('scene');
			updateSuspectCards();
			updateScoreDisplay();
			updateRoundDisplay();
			renderScenePhase();
			if (!gameState.timerRunning) {
				startTimer(
					DIFFICULTY_CONFIG[gameState.difficulty].timerSeconds,
					onTimerExpired
				);
			}
			break;

		case PHASE.LAB:
			document.getElementById('game-screen').classList.add('active');
			updatePhaseDisplay('Laboratory Analysis');
			updatePhaseNav('lab');
			renderLabPhase();
			break;

		case PHASE.CASE_BOARD:
			document.getElementById('game-screen').classList.add('active');
			updatePhaseDisplay('Case Board');
			updatePhaseNav('board');
			renderCaseBoard();
			break;

		case PHASE.ROUND_END:
			document.getElementById('round-end-screen').classList.add('active');
			renderRoundEnd();
			break;

		case PHASE.ACCUSATION:
			document.getElementById('accusation-screen').classList.add('active');
			renderAccusation();
			break;

		case PHASE.GAME_OVER:
			document.getElementById('game-over-screen').classList.add('active');
			renderGameOver();
			break;
	}
}

/* ============================================ */
function showSetupScreen() {
	/* Transition from title to setup screen. */
	resetGameState();
	transitionTo(PHASE.SETUP);
}

/* ============================================ */
function startCase() {
	/* Validate setup selections and begin the game. */
	let selectedSuspects = getSelectedSuspects();
	if (selectedSuspects.length < 4 || selectedSuspects.length > 6) {
		showModal('Selection Error', '<p>Please select between 4 and 6 suspects.</p>');
		return;
	}

	let difficulty = getSelectedDifficulty();
	gameState.difficulty = difficulty;
	gameState.gameStarted = true;

	// Initialize characters for this game
	initializeCharacters(selectedSuspects);

	// Reset round state before generating scene (resetRoundState clears currentScene)
	resetRoundState();

	// Generate the first crime scene after reset
	gameState.currentScene = generateScene(gameState.round);
	// Populate available evidence from the generated scene
	if (gameState.currentScene && gameState.currentScene.evidenceItems) {
		gameState.availableEvidence = gameState.currentScene.evidenceItems;
	}

	transitionTo(PHASE.INTRO);
}

/* ============================================ */
function enterScenePhase() {
	/* Enter or return to the scene investigation phase. */
	transitionTo(PHASE.SCENE);
}

/* ============================================ */
function enterLabPhase() {
	/* Enter the laboratory analysis phase. */
	if (gameState.collectedSamples.length === 0) {
		showModal('No Samples', '<p>You need to collect at least one evidence sample before running lab tests.</p>');
		return;
	}
	transitionTo(PHASE.LAB);
}

/* ============================================ */
function enterCaseBoard() {
	/* Enter the case board phase. */
	transitionTo(PHASE.CASE_BOARD);
}

/* ============================================ */
function endRound() {
	/* End the current round, calculate score, and advance. */
	stopTimer();
	let roundScore = calculateRoundScore();
	gameState.roundScores.push(roundScore);
	gameState.totalScore += roundScore.total;
	gameState.roundHistory.push({
		round: gameState.round,
		score: roundScore,
		samplesCollected: gameState.collectedSamples.length,
		testsRun: gameState.testResults.length
	});
	transitionTo(PHASE.ROUND_END);
}

/* ============================================ */
function onTimerExpired() {
	/* Called when the round timer hits zero.
	   A suspect dies and the game checks for end conditions. */
	stopTimer();

	// Find a living non-killer suspect to kill
	let aliveSuspects = gameState.suspects.filter(function(s) {
		return s.alive && !s.isKiller;
	});

	if (aliveSuspects.length > 0) {
		// Kill a random living suspect
		let victimIndex = Math.floor(Math.random() * aliveSuspects.length);
		let newVictim = aliveSuspects[victimIndex];
		newVictim.alive = false;
		gameState.deadCharacters.push(newVictim);

		// Count remaining alive suspects (including killer)
		let remaining = gameState.suspects.filter(function(s) {
			return s.alive;
		});

		if (remaining.length <= 2) {
			// Force final accusation
			showModal('Time is up!',
				'<p><strong>' + newVictim.name + '</strong> has been found dead!</p>' +
				'<p>With only ' + remaining.length + ' suspect(s) remaining, you must make your final accusation now.</p>',
				function() {
					closeModal();
					transitionTo(PHASE.ACCUSATION);
				}
			);
		} else {
			// New round with new crime scene
			showModal('Another victim!',
				'<p><strong>' + newVictim.name + '</strong> has been found dead!</p>' +
				'<p>The killer has struck again. A new crime scene awaits investigation.</p>' +
				'<p>Remaining suspects: ' + remaining.length + '</p>',
				function() {
					closeModal();
					advanceToNextRound();
				}
			);
		}
	}
}

/* ============================================ */
function advanceToNextRound() {
	/* Set up and start the next investigation round. */
	// Score current round first
	let roundScore = calculateRoundScore();
	gameState.roundScores.push(roundScore);
	gameState.totalScore += roundScore.total;
	gameState.roundHistory.push({
		round: gameState.round,
		score: roundScore,
		samplesCollected: gameState.collectedSamples.length,
		testsRun: gameState.testResults.length
	});

	gameState.round++;
	resetRoundState();
	gameState.currentScene = generateScene(gameState.round);
	// Populate available evidence from the generated scene
	if (gameState.currentScene && gameState.currentScene.evidenceItems) {
		gameState.availableEvidence = gameState.currentScene.evidenceItems;
	}

	updateRoundDisplay();
	updateScoreDisplay();
	updateSuspectCards();
	transitionTo(PHASE.SCENE);
}

/* ============================================ */
function makeAccusation(suspectId) {
	/* Player accuses a suspect. Check if correct. */
	gameState.accusationMade = true;
	let accused = null;
	for (let i = 0; i < gameState.suspects.length; i++) {
		if (gameState.suspects[i].id === suspectId) {
			accused = gameState.suspects[i];
			break;
		}
	}
	gameState.accusedSuspect = accused;
	gameState.gameOver = true;
	stopTimer();
	transitionTo(PHASE.GAME_OVER);
}

/* ============================================ */
function getAliveSuspects() {
	/* Return array of living suspects. */
	return gameState.suspects.filter(function(s) {
		return s.alive;
	});
}

/* ============================================ */
function getSuspectById(suspectId) {
	/* Find a suspect by their ID string. */
	for (let i = 0; i < gameState.allCharacters.length; i++) {
		if (gameState.allCharacters[i].id === suspectId) {
			return gameState.allCharacters[i];
		}
	}
	return null;
}
