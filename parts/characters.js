/* ============================================ */
/* SECTION 2: CHARACTER DEFINITIONS             */
/* ============================================ */

// Victim character - always present in every game
var VICTIM_CHARACTER = {
	id: 'victor_graves',
	name: 'Dr. Victor Graves',
	age: 65,
	role: 'Wealthy criminologist and dinner party host',
	alibi: 'Found dead in the mansion',
	motive: '',
	alive: false,
	isKiller: false,
	isVictim: true,
	bloodType: 'A',
	strProfile: {
		'D3S1358': [15, 17],
		'vWA':     [16, 18],
		'FGA':     [21, 24],
		'D8S1179': [12, 14],
		'D21S11':  [29, 31],
		'D18S51':  [14, 18],
		'D5S818':  [11, 13],
		'TH01':    [7, 9]
	},
	rflpFragments: {
		'EcoRI':   [1200, 2800, 4500, 7200],
		'BamHI':   [900, 3100, 5600, 8400],
		'HindIII': [1500, 3400, 6100]
	},
	mtDNAHaplotype: 'H1a1',
	hairType: 'wavy gray',
	shoeSize: 10
};

// Suspect pool - 6 characters for the player to choose 4-6 from
var CHARACTER_POOL = [
	{
		id: 'ted_bundy',
		name: 'Ted Bundy',
		age: 33,
		role: 'Charming law student with a dark side',
		alibi: 'Claims he was in the library reading case law',
		motive: 'Dr. Graves was about to publish a psychological profile that would expose his true nature',
		alive: true,
		isKiller: false,
		isVictim: false,
		bloodType: 'O',
		strProfile: {
			'D3S1358': [14, 16],
			'vWA':     [17, 19],
			'FGA':     [22, 25],
			'D8S1179': [10, 13],
			'D21S11':  [28, 30],
			'D18S51':  [12, 16],
			'D5S818':  [10, 12],
			'TH01':    [6, 8]
		},
		rflpFragments: {
			'EcoRI':   [1050, 2600, 5100, 7800],
			'BamHI':   [750, 2900, 4800],
			'HindIII': [1800, 3900, 5500, 8200]
		},
		mtDNAHaplotype: 'J1c1',
		hairType: 'straight dark brown',
		shoeSize: 11
	},
	{
		id: 'john_wayne_gacy',
		name: 'John Wayne Gacy',
		age: 37,
		role: 'Jovial entertainer who performs as a clown',
		alibi: 'Claims he was performing card tricks in the parlor for other guests',
		motive: 'Dr. Graves discovered evidence linking him to disappearances in his neighborhood',
		alive: true,
		isKiller: false,
		isVictim: false,
		bloodType: 'A',
		strProfile: {
			'D3S1358': [13, 18],
			'vWA':     [14, 20],
			'FGA':     [19, 27],
			'D8S1179': [8, 15],
			'D21S11':  [25, 33],
			'D18S51':  [9, 21],
			'D5S818':  [8, 14],
			'TH01':    [5, 10]
		},
		rflpFragments: {
			'EcoRI':   [1400, 3200, 6000, 8900, 9800],
			'BamHI':   [1100, 2500, 5200, 7600],
			'HindIII': [2000, 4200, 7000]
		},
		mtDNAHaplotype: 'K1a1',
		hairType: 'curly black',
		shoeSize: 10
	},
	{
		id: 'jack_the_ripper',
		name: 'Jack the Ripper',
		age: 45,
		role: 'Mysterious surgeon with impeccable manners',
		alibi: 'Claims he was examining the wine cellar collection',
		motive: 'Dr. Graves claimed to have identified the Ripper and planned a public reveal',
		alive: true,
		isKiller: false,
		isVictim: false,
		bloodType: 'B',
		strProfile: {
			'D3S1358': [16, 19],
			'vWA':     [12, 22],
			'FGA':     [18, 30],
			'D8S1179': [11, 17],
			'D21S11':  [26, 35],
			'D18S51':  [10, 24],
			'D5S818':  [9, 15],
			'TH01':    [7, 11]
		},
		rflpFragments: {
			'EcoRI':   [800, 2100, 4800, 6500],
			'BamHI':   [1300, 3600, 6300, 9100],
			'HindIII': [1100, 2800, 5000, 7400, 9500]
		},
		mtDNAHaplotype: 'T1a1',
		hairType: 'straight blonde',
		shoeSize: 9
	},
	{
		id: 'charles_manson',
		name: 'Charles Manson',
		age: 40,
		role: 'Charismatic cult leader with a wild stare',
		alibi: 'Claims he was meditating in the garden under the moonlight',
		motive: 'Dr. Graves testified against his followers and had him placed on a watchlist',
		alive: true,
		isKiller: false,
		isVictim: false,
		bloodType: 'O',
		strProfile: {
			'D3S1358': [12, 20],
			'vWA':     [15, 23],
			'FGA':     [20, 28],
			'D8S1179': [9, 16],
			'D21S11':  [27, 36],
			'D18S51':  [11, 19],
			'D5S818':  [7, 11],
			'TH01':    [8, 10]
		},
		rflpFragments: {
			'EcoRI':   [950, 3500, 5800],
			'BamHI':   [1600, 4100, 7300, 9600],
			'HindIII': [1700, 3200, 5900, 8600]
		},
		mtDNAHaplotype: 'U5a1',
		hairType: 'wavy auburn',
		shoeSize: 8
	},
	{
		id: 'jeffrey_dahmer',
		name: 'Jeffrey Dahmer',
		age: 31,
		role: 'Quiet chemist with unsettling calm',
		alibi: 'Claims he was in the kitchen preparing a special dessert',
		motive: 'Dr. Graves was investigating suspicious chemical purchases traced back to him',
		alive: true,
		isKiller: false,
		isVictim: false,
		bloodType: 'A',
		strProfile: {
			'D3S1358': [15, 18],
			'vWA':     [13, 21],
			'FGA':     [23, 29],
			'D8S1179': [7, 18],
			'D21S11':  [24, 32],
			'D18S51':  [8, 22],
			'D5S818':  [12, 16],
			'TH01':    [6, 9]
		},
		rflpFragments: {
			'EcoRI':   [1600, 2400, 4200, 6800, 9200],
			'BamHI':   [850, 3800, 5500],
			'HindIII': [2200, 4600, 6700, 8800]
		},
		mtDNAHaplotype: 'V1a1',
		hairType: 'straight red',
		shoeSize: 12
	},
	{
		id: 'aileen_wuornos',
		name: 'Aileen Wuornos',
		age: 35,
		role: 'Highway drifter with a volatile temper',
		alibi: 'Claims she was on the veranda smoking and watching the rain',
		motive: 'Dr. Graves profiled her for the FBI and she blamed him for years in prison',
		alive: true,
		isKiller: false,
		isVictim: false,
		bloodType: 'AB',
		strProfile: {
			'D3S1358': [13, 17],
			'vWA':     [16, 24],
			'FGA':     [17, 26],
			'D8S1179': [13, 19],
			'D21S11':  [30, 38],
			'D18S51':  [15, 27],
			'D5S818':  [10, 13],
			'TH01':    [5, 7]
		},
		rflpFragments: {
			'EcoRI':   [700, 1900, 3700, 5400],
			'BamHI':   [1200, 2700, 4400, 6900, 9400],
			'HindIII': [1400, 3600, 6400]
		},
		mtDNAHaplotype: 'X2a1',
		hairType: 'curly brown',
		shoeSize: 7
	}
];

/* ============================================ */
function deepCopyCharacter(character) {
	/* Create a deep copy of a character object so the
	   original CHARACTER_POOL is never mutated.
	   Returns a new object with all nested structures copied. */
	var copy = {};
	var keys = Object.keys(character);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var val = character[key];
		if (val === null || val === undefined) {
			copy[key] = val;
		} else if (Array.isArray(val)) {
			// Shallow copy arrays (allele pairs are arrays of numbers)
			copy[key] = val.slice();
		} else if (typeof val === 'object') {
			// Deep copy nested objects (strProfile, rflpFragments)
			copy[key] = {};
			var innerKeys = Object.keys(val);
			for (var j = 0; j < innerKeys.length; j++) {
				var innerVal = val[innerKeys[j]];
				if (Array.isArray(innerVal)) {
					copy[key][innerKeys[j]] = innerVal.slice();
				} else {
					copy[key][innerKeys[j]] = innerVal;
				}
			}
		} else {
			copy[key] = val;
		}
	}
	return copy;
}

/* ============================================ */
function initializeCharacters(selectedSuspectIds) {
	/* Set up characters for a new game.
	   Takes an array of suspect ID strings chosen by the player.
	   Deep-copies characters from the pool, randomly selects one as
	   the killer, and populates all gameState character fields. */

	// Deep copy the victim
	gameState.victim = deepCopyCharacter(VICTIM_CHARACTER);

	// Deep copy selected suspects from the pool
	var selectedSuspects = [];
	for (var i = 0; i < selectedSuspectIds.length; i++) {
		var suspectId = selectedSuspectIds[i];
		for (var j = 0; j < CHARACTER_POOL.length; j++) {
			if (CHARACTER_POOL[j].id === suspectId) {
				selectedSuspects.push(deepCopyCharacter(CHARACTER_POOL[j]));
				break;
			}
		}
	}

	// Randomly pick one suspect as the killer
	var killerIndex = Math.floor(Math.random() * selectedSuspects.length);
	selectedSuspects[killerIndex].isKiller = true;

	// Store in game state
	gameState.suspects = selectedSuspects;
	gameState.killer = selectedSuspects[killerIndex];
	gameState.deadCharacters = [gameState.victim];

	// Build allCharacters list: victim first, then all suspects
	gameState.allCharacters = [gameState.victim];
	for (var k = 0; k < selectedSuspects.length; k++) {
		gameState.allCharacters.push(selectedSuspects[k]);
	}

	// Initialize suspect notes for case board
	gameState.suspectNotes = {};
	for (var m = 0; m < selectedSuspects.length; m++) {
		gameState.suspectNotes[selectedSuspects[m].id] = '';
	}
}
