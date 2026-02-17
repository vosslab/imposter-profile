/* ============================================ */
/* SECTION 1: CONSTANTS AND CONFIGURATION       */
/* ============================================ */

// Game phases - state machine states
const PHASE = {
	TITLE: 'TITLE',
	SETUP: 'SETUP',
	INTRO: 'INTRO',
	SCENE: 'SCENE',
	LAB: 'LAB',
	CASE_BOARD: 'CASE_BOARD',
	ROUND_END: 'ROUND_END',
	ACCUSATION: 'ACCUSATION',
	GAME_OVER: 'GAME_OVER'
};

// Difficulty configurations
const DIFFICULTY_CONFIG = {
	easy: {
		label: 'Easy',
		timerSeconds: 300,
		swabsPerRound: 6,
		testsPerRound: 5,
		evidenceQuality: 'pristine',
		description: 'Generous timer, clear evidence, more resources'
	},
	medium: {
		label: 'Medium',
		timerSeconds: 200,
		swabsPerRound: 4,
		testsPerRound: 3,
		evidenceQuality: 'mixed',
		description: 'Moderate timer, some degradation, standard resources'
	},
	hard: {
		label: 'Hard',
		timerSeconds: 120,
		swabsPerRound: 3,
		testsPerRound: 2,
		evidenceQuality: 'degraded',
		description: 'Short timer, degraded samples, limited resources'
	}
};

// CODIS STR loci with realistic allele ranges
const STR_LOCI = {
	'D3S1358': { min: 12, max: 20 },
	'vWA':     { min: 11, max: 24 },
	'FGA':     { min: 17, max: 33 },
	'D8S1179': { min: 7,  max: 19 },
	'D21S11':  { min: 24, max: 38 },
	'D18S51':  { min: 7,  max: 27 },
	'D5S818':  { min: 7,  max: 16 },
	'TH01':    { min: 5,  max: 11 }
};

// Blood type distribution for realistic generation
const BLOOD_TYPES = ['O', 'A', 'B', 'AB'];
const BLOOD_TYPE_WEIGHTS = [0.44, 0.42, 0.10, 0.04];

// Restriction enzymes used in RFLP analysis
const RESTRICTION_ENZYMES = ['EcoRI', 'BamHI', 'HindIII'];

// Evidence types found at crime scenes
const EVIDENCE_TYPES = ['blood', 'touch_dna', 'hair', 'saliva', 'fiber'];

// Evidence quality levels
const EVIDENCE_QUALITY = ['pristine', 'degraded', 'mixed', 'trace'];

// Available forensic tests
const FORENSIC_TESTS = {
	blood_type: {
		name: 'Blood Typing (ABO/Rh)',
		description: 'Determines blood group using antibody reactions',
		sampleTypes: ['blood'],
		timeMinutes: 5
	},
	rflp: {
		name: 'RFLP Analysis',
		description: 'Restriction Fragment Length Polymorphism - cuts DNA with enzymes and separates by size on a gel',
		sampleTypes: ['blood', 'touch_dna', 'saliva'],
		timeMinutes: 15
	},
	str: {
		name: 'PCR/STR Profiling',
		description: 'Short Tandem Repeat analysis - amplifies and measures repeat regions at specific loci',
		sampleTypes: ['blood', 'touch_dna', 'saliva', 'hair'],
		timeMinutes: 20
	},
	mtdna: {
		name: 'Mitochondrial DNA',
		description: 'Analyzes maternally inherited mtDNA - useful for degraded samples and hair without roots',
		sampleTypes: ['hair', 'touch_dna', 'blood'],
		timeMinutes: 25
	},
	restriction: {
		name: 'Restriction Enzyme Digest',
		description: 'Cuts DNA with a specific enzyme and analyzes the fragment pattern',
		sampleTypes: ['blood', 'touch_dna', 'saliva'],
		timeMinutes: 10
	}
};

// Mansion room descriptions for crime scenes
const MANSION_ROOMS = [
	{
		name: 'The Library',
		description: 'A grand room lined with mahogany bookshelves from floor to ceiling. A large desk sits near the window, papers scattered across it. A crystal whiskey decanter sits half-empty on the side table.',
		evidenceLocations: ['on the desk', 'near the doorknob', 'on the carpet by the fireplace', 'on the whiskey glass', 'on the letter opener', 'caught in the window latch']
	},
	{
		name: 'The Study',
		description: 'A private office with leather chairs and a locked safe in the corner. The room smells of pipe tobacco. A chess board mid-game sits between two armchairs.',
		evidenceLocations: ['on the chess piece', 'near the safe dial', 'on the armchair fabric', 'on the tobacco pipe', 'under the desk lamp', 'on the door handle']
	},
	{
		name: 'The Dining Room',
		description: 'A long table set for eight with fine china and silver cutlery. Several wine glasses remain half-full. One chair is knocked over.',
		evidenceLocations: ['on the wine glass rim', 'on the napkin', 'on the overturned chair', 'under the table edge', 'on the silver knife', 'on the tablecloth stain']
	},
	{
		name: 'The Kitchen',
		description: 'A large commercial-style kitchen with copper pots hanging from the ceiling. The back door is ajar. A cutting board has fresh knife marks.',
		evidenceLocations: ['on the knife handle', 'near the back door', 'on the cutting board', 'on the counter edge', 'on the copper pot handle', 'on the towel rack']
	},
	{
		name: 'The Conservatory',
		description: 'A glass-walled garden room filled with exotic plants and wrought iron furniture. The air is humid. A broken flower pot lies on the stone floor.',
		evidenceLocations: ['on the broken pot shard', 'on the iron chair arm', 'on the glass panel', 'among the soil', 'on the watering can', 'on the stone bench']
	},
	{
		name: 'The Master Bedroom',
		description: 'An opulent room with a four-poster bed and heavy velvet curtains. A vanity mirror is cracked. The bedside drawer is open.',
		evidenceLocations: ['on the bedpost', 'on the cracked mirror frame', 'in the open drawer', 'on the curtain pull', 'on the pillow case', 'on the doorframe']
	}
];

// Scoring weights
const SCORE_WEIGHTS = {
	sampleHandling: 10,
	chainOfCustody: 10,
	testSelection: 15,
	controlUsage: 15,
	interpretation: 20,
	conclusionQuality: 20,
	contaminationPenalty: -15,
	overclaimingPenalty: -10,
	efficiencyBonus: 10
};

// Certainty level descriptors for case board
const CERTAINTY_LEVELS = [
	{ value: 'definitive', label: 'Definitive Match', description: 'All markers match with statistical certainty' },
	{ value: 'strong', label: 'Strong Match', description: 'Multiple markers match, high confidence' },
	{ value: 'partial', label: 'Partial Match', description: 'Some markers match, further testing needed' },
	{ value: 'inconclusive', label: 'Inconclusive', description: 'Results do not support a conclusion' },
	{ value: 'exclusion', label: 'Exclusion', description: 'Profile does not match this individual' },
	{ value: 'mixture', label: 'Mixture Detected', description: 'Multiple contributors present in sample' }
];

// mtDNA haplotype identifiers
const MTDNA_HAPLOTYPES = [
	'H1a1', 'H2a1', 'H3a1', 'J1c1', 'J2a1',
	'K1a1', 'K2a1', 'T1a1', 'T2b1', 'U5a1',
	'V1a1', 'W1a1', 'X2a1', 'I1a1', 'L3e1'
];

// Hair types for physical evidence
const HAIR_TYPES = [
	'straight dark brown', 'wavy auburn', 'curly black',
	'straight blonde', 'wavy gray', 'straight red',
	'curly brown', 'wavy dark brown'
];
