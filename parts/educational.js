/* ============================================ */
/* SECTION 9: EDUCATIONAL CONTENT              */
/* ============================================ */

/* ============================================ */
function showHelp(topic) {
	/*
	Shows educational content in a modal dialog.
	Args:
		topic: string identifying the help topic to display
	Supported topics:
		general, blood_type, rflp, str, mtdna, restriction,
		evidence_collection, contamination, controls, interpretation
	*/
	var title = 'Help';
	var content = '';

	switch (topic) {
		case 'general':
			title = 'Forensic Science Overview';
			content = buildGeneralHelp();
			break;

		case 'blood_type':
			title = 'Blood Typing (ABO/Rh System)';
			content = buildBloodTypeHelp();
			break;

		case 'rflp':
			title = 'RFLP Analysis';
			content = buildRFLPHelp();
			break;

		case 'str':
			title = 'PCR/STR Profiling';
			content = buildSTRHelp();
			break;

		case 'mtdna':
			title = 'Mitochondrial DNA Analysis';
			content = buildMtDNAHelp();
			break;

		case 'restriction':
			title = 'Restriction Enzyme Digestion';
			content = buildRestrictionHelp();
			break;

		case 'evidence_collection':
			title = 'Evidence Collection and Chain of Custody';
			content = buildEvidenceCollectionHelp();
			break;

		case 'contamination':
			title = 'Contamination and Its Effects';
			content = buildContaminationHelp();
			break;

		case 'controls':
			title = 'Experimental Controls';
			content = buildControlsHelp();
			break;

		case 'interpretation':
			title = 'Interpreting Results Scientifically';
			content = buildInterpretationHelp();
			break;

		default:
			title = 'Help';
			content = '<p>No help content is available for this topic.</p>';
	}

	showModal(title, content);
}

/* ============================================ */
function buildGeneralHelp() {
	/*
	Returns HTML content for the general forensic science overview.
	*/
	var html = '';
	html += '<h3>How This Game Works</h3>';
	html += '<p>You are a forensic investigator tasked with identifying a killer ';
	html += 'from among the dinner party guests at the Graves mansion. ';
	html += 'Use real forensic techniques to collect and analyze DNA evidence.</p>';

	html += '<h3>Game Phases</h3>';
	html += '<ul>';
	html += '<li><strong>Crime Scene:</strong> Examine the room and collect biological ';
	html += 'evidence using swabs. Always put on gloves first!</li>';
	html += '<li><strong>Laboratory:</strong> Run forensic tests on your collected ';
	html += 'samples. Choose tests appropriate for your evidence type.</li>';
	html += '<li><strong>Case Board:</strong> Review results, assess suspects, ';
	html += 'and write your forensic conclusions.</li>';
	html += '</ul>';

	html += '<h3>Scoring</h3>';
	html += '<p>Your score is based on <em>scientific rigor</em>, not just ';
	html += 'getting the right answer. Points are awarded for:</p>';
	html += '<ul>';
	html += '<li>Proper evidence handling (wearing gloves)</li>';
	html += '<li>Accurate labeling and chain of custody</li>';
	html += '<li>Choosing appropriate tests for sample types</li>';
	html += '<li>Including experimental controls</li>';
	html += '<li>Using proper scientific language in interpretations</li>';
	html += '<li>Writing thorough, evidence-based conclusions</li>';
	html += '</ul>';

	html += '<h3>Tips</h3>';
	html += '<ul>';
	html += '<li>Quality over quantity -- targeted testing beats running every test.</li>';
	html += '<li>Never say "definitely" or "proves" -- forensic science deals ';
	html += 'in probabilities, not certainties.</li>';
	html += '<li>A contaminated sample can still be analyzed, but results ';
	html += 'may be unreliable.</li>';
	html += '<li>If a timer runs out, another suspect dies and the killer ';
	html += 'strikes again at a new location.</li>';
	html += '</ul>';

	return html;
}

/* ============================================ */
function buildBloodTypeHelp() {
	/*
	Returns HTML content explaining blood typing and the ABO system.
	*/
	var html = '';
	html += '<h3>What Is Blood Typing?</h3>';
	html += '<p>Blood typing determines a person\'s ABO blood group and Rh factor ';
	html += 'by testing how blood reacts with specific antibodies.</p>';

	html += '<h3>The ABO System</h3>';
	html += '<p>Red blood cells carry antigens on their surface. The ABO system ';
	html += 'classifies blood based on two antigens: A and B.</p>';
	html += '<table class="help-table">';
	html += '<tr><th>Blood Type</th><th>Antigens</th><th>Anti-A Reaction</th>';
	html += '<th>Anti-B Reaction</th></tr>';
	html += '<tr><td>A</td><td>A antigen</td><td>Agglutination</td><td>None</td></tr>';
	html += '<tr><td>B</td><td>B antigen</td><td>None</td><td>Agglutination</td></tr>';
	html += '<tr><td>AB</td><td>Both A and B</td><td>Agglutination</td>';
	html += '<td>Agglutination</td></tr>';
	html += '<tr><td>O</td><td>Neither</td><td>None</td><td>None</td></tr>';
	html += '</table>';

	html += '<h3>Rh Factor</h3>';
	html += '<p>The Rh factor (also called the D antigen) is either present (+) ';
	html += 'or absent (-). Testing with anti-D serum determines Rh status. ';
	html += 'About 85% of people are Rh-positive.</p>';

	html += '<h3>Forensic Use</h3>';
	html += '<p>Blood typing is a quick exclusionary test. It cannot uniquely ';
	html += 'identify a person (many people share the same blood type), ';
	html += 'but it <em>can</em> exclude suspects whose type does not match ';
	html += 'the evidence. For positive identification, DNA profiling is needed.</p>';

	html += '<h3>Real-World Note</h3>';
	html += '<p>Blood typing was one of the earliest forensic techniques, ';
	html += 'used in criminal cases since the early 1900s. The ABO system was ';
	html += 'discovered by Karl Landsteiner in 1901.</p>';

	return html;
}

/* ============================================ */
function buildRFLPHelp() {
	/*
	Returns HTML content explaining RFLP analysis.
	*/
	var html = '';
	html += '<h3>What Is RFLP?</h3>';
	html += '<p>Restriction Fragment Length Polymorphism (RFLP) analysis is a ';
	html += 'technique that cuts DNA at specific recognition sequences using ';
	html += 'restriction enzymes, then separates the resulting fragments ';
	html += 'by size using gel electrophoresis.</p>';

	html += '<h3>How It Works</h3>';
	html += '<p>Think of RFLP like cutting a long document at every place a ';
	html += 'specific word appears. Different people have the word at different ';
	html += 'positions, so the pieces end up being different sizes. ';
	html += 'By comparing piece sizes, you can tell if two documents ';
	html += '(DNA samples) came from the same source.</p>';
	html += '<ol>';
	html += '<li>DNA is extracted from the sample</li>';
	html += '<li>Restriction enzymes (like EcoRI, BamHI, HindIII) cut the DNA</li>';
	html += '<li>Fragments are separated by size on a gel (smaller fragments ';
	html += 'travel farther)</li>';
	html += '<li>The resulting band pattern is compared between samples</li>';
	html += '</ol>';

	html += '<h3>Interpreting Results</h3>';
	html += '<p>If two samples show the same band pattern for an enzyme, they ';
	html += 'are <em>consistent with</em> coming from the same source. ';
	html += 'Different patterns exclude a match. Degraded DNA may show ';
	html += 'missing bands, making interpretation more difficult.</p>';

	html += '<h3>Limitations</h3>';
	html += '<ul>';
	html += '<li>Requires relatively large amounts of DNA (microgram quantities)</li>';
	html += '<li>DNA must be intact -- degraded samples may give incomplete patterns</li>';
	html += '<li>The process takes longer than newer PCR-based methods</li>';
	html += '</ul>';

	html += '<h3>Real-World Note</h3>';
	html += '<p>RFLP was the first DNA profiling method used in criminal cases, ';
	html += 'introduced by Sir Alec Jeffreys in 1984. It has been largely ';
	html += 'replaced by STR analysis but remains important historically ';
	html += 'and for certain applications.</p>';

	return html;
}

/* ============================================ */
function buildSTRHelp() {
	/*
	Returns HTML content explaining PCR/STR profiling.
	*/
	var html = '';
	html += '<h3>What Is STR Profiling?</h3>';
	html += '<p>Short Tandem Repeat (STR) analysis examines specific regions of ';
	html += 'DNA where a short sequence (typically 2-6 base pairs) is repeated ';
	html += 'in tandem. The number of repeats varies between individuals, ';
	html += 'creating a unique "DNA fingerprint."</p>';

	html += '<h3>PCR Amplification</h3>';
	html += '<p>Before analysis, the target DNA regions are amplified using ';
	html += 'Polymerase Chain Reaction (PCR). PCR creates millions of copies ';
	html += 'from a tiny starting amount, which is why STR can work on ';
	html += 'much smaller samples than RFLP.</p>';

	html += '<h3>CODIS Loci</h3>';
	html += '<p>The FBI\'s Combined DNA Index System (CODIS) uses a standard set ';
	html += 'of STR loci for identification. Each person has two alleles ';
	html += '(variants) per locus -- one inherited from each parent. ';
	html += 'This game tests 8 CODIS loci, including D3S1358, vWA, ';
	html += 'FGA, and others.</p>';

	html += '<h3>Interpreting Results</h3>';
	html += '<ul>';
	html += '<li>Each locus shows two numbers (alleles), one from each parent</li>';
	html += '<li>A match at all loci is extremely strong evidence of identity</li>';
	html += '<li>A mismatch at even one locus can exclude a suspect</li>';
	html += '<li>Extra alleles at a locus may indicate a mixture of DNA ';
	html += 'from multiple people</li>';
	html += '<li>Missing loci ("dropout") can occur with degraded samples</li>';
	html += '</ul>';

	html += '<h3>Real-World Note</h3>';
	html += '<p>STR profiling is the current gold standard in forensic DNA ';
	html += 'identification. A full 20-locus profile has a random match ';
	html += 'probability of approximately 1 in a quintillion for unrelated ';
	html += 'individuals. CODIS contains over 21 million profiles as of 2024.</p>';

	return html;
}

/* ============================================ */
function buildMtDNAHelp() {
	/*
	Returns HTML content explaining mitochondrial DNA analysis.
	*/
	var html = '';
	html += '<h3>What Is Mitochondrial DNA?</h3>';
	html += '<p>Mitochondrial DNA (mtDNA) is a small circular genome found in ';
	html += 'the mitochondria of cells, separate from the nuclear DNA in ';
	html += 'chromosomes. Unlike nuclear DNA, mtDNA is inherited only from ';
	html += 'the mother (maternal inheritance).</p>';

	html += '<h3>Why Use mtDNA?</h3>';
	html += '<ul>';
	html += '<li>Each cell contains hundreds to thousands of copies of mtDNA, ';
	html += 'but only two copies of nuclear DNA</li>';
	html += '<li>This abundance makes mtDNA more likely to survive in degraded ';
	html += 'or old samples</li>';
	html += '<li>Hair shafts (without roots) contain mtDNA but no nuclear DNA, ';
	html += 'making mtDNA the only DNA option for rootless hair evidence</li>';
	html += '<li>Useful for ancient remains, bones, and severely degraded samples</li>';
	html += '</ul>';

	html += '<h3>Haplotypes</h3>';
	html += '<p>mtDNA variants are classified into haplotypes -- groups that ';
	html += 'share specific sequence patterns. Common haplotypes include H, J, ';
	html += 'K, T, U, and others. These haplotypes trace maternal lineages ';
	html += 'and can link individuals to the same maternal line.</p>';

	html += '<h3>Limitations</h3>';
	html += '<ul>';
	html += '<li>Cannot distinguish between individuals who share a maternal ';
	html += 'lineage (siblings, maternal relatives)</li>';
	html += '<li>Less discriminating than STR profiling -- many unrelated ';
	html += 'people share the same haplotype</li>';
	html += '<li>Best used for exclusion or in combination with other tests</li>';
	html += '</ul>';

	html += '<h3>Real-World Note</h3>';
	html += '<p>mtDNA analysis was instrumental in identifying remains from ';
	html += 'mass disasters and historical cases, including the identification ';
	html += 'of the Romanov royal family. It is also used in missing persons ';
	html += 'cases where only degraded remains are available.</p>';

	return html;
}

/* ============================================ */
function buildRestrictionHelp() {
	/*
	Returns HTML content explaining restriction enzyme digestion.
	*/
	var html = '';
	html += '<h3>What Are Restriction Enzymes?</h3>';
	html += '<p>Restriction enzymes are molecular scissors that cut DNA at ';
	html += 'specific recognition sequences. Each enzyme recognizes a unique ';
	html += 'sequence of 4-8 base pairs and cuts at or near that site.</p>';

	html += '<h3>Common Forensic Enzymes</h3>';
	html += '<table class="help-table">';
	html += '<tr><th>Enzyme</th><th>Source</th><th>Recognition Site</th></tr>';
	html += '<tr><td>EcoRI</td><td>E. coli</td><td>GAATTC</td></tr>';
	html += '<tr><td>BamHI</td><td>B. amyloliquefaciens</td><td>GGATCC</td></tr>';
	html += '<tr><td>HindIII</td><td>H. influenzae</td><td>AAGCTT</td></tr>';
	html += '</table>';

	html += '<h3>How It Works</h3>';
	html += '<p>When a restriction enzyme encounters its recognition sequence ';
	html += 'in a DNA strand, it cleaves the phosphodiester bonds, producing ';
	html += 'fragments. Because different individuals have different DNA ';
	html += 'sequences, the number and positions of cut sites vary, ';
	html += 'resulting in different fragment patterns.</p>';

	html += '<h3>Forensic Application</h3>';
	html += '<p>A restriction digest produces a set of fragments that can be ';
	html += 'separated by gel electrophoresis. Comparing fragment patterns ';
	html += 'between a crime scene sample and suspect samples can help ';
	html += 'establish or exclude matches. This is the basis of RFLP analysis.</p>';

	return html;
}

/* ============================================ */
function buildEvidenceCollectionHelp() {
	/*
	Returns HTML content about proper evidence handling.
	*/
	var html = '';
	html += '<h3>Proper Evidence Collection</h3>';
	html += '<p>The integrity of forensic evidence depends entirely on how it ';
	html += 'is collected, labeled, and stored. Improper handling can render ';
	html += 'evidence inadmissible in court or lead to false conclusions.</p>';

	html += '<h3>Key Principles</h3>';
	html += '<ul>';
	html += '<li><strong>Wear gloves:</strong> Always put on fresh gloves before ';
	html += 'touching any evidence. Your own DNA, oils, and skin cells will ';
	html += 'contaminate the sample.</li>';
	html += '<li><strong>Label everything:</strong> Each sample must have a unique ';
	html += 'identifier, the collector\'s name, date, time, and precise ';
	html += 'location where it was found.</li>';
	html += '<li><strong>Document the scene:</strong> Photograph evidence in place ';
	html += 'before collection. Note the surrounding context.</li>';
	html += '<li><strong>Use appropriate tools:</strong> Sterile swabs for biological ';
	html += 'fluids, tweezers for hairs, tape lifts for fibers.</li>';
	html += '</ul>';

	html += '<h3>Chain of Custody</h3>';
	html += '<p>Chain of custody is the documented, unbroken trail showing who ';
	html += 'handled evidence, when, and where, from collection through ';
	html += 'court presentation. Any gap in this chain can be challenged ';
	html += 'by defense attorneys and may lead to evidence being excluded.</p>';

	html += '<h3>In This Game</h3>';
	html += '<p>You earn points for proper handling: wearing gloves, accurately ';
	html += 'labeling your sample type, and recording location notes. ';
	html += 'Forgetting gloves results in contamination penalties.</p>';

	return html;
}

/* ============================================ */
function buildContaminationHelp() {
	/*
	Returns HTML content about contamination and its effects.
	*/
	var html = '';
	html += '<h3>What Is Contamination?</h3>';
	html += '<p>Contamination occurs when foreign DNA or biological material is ';
	html += 'introduced to an evidence sample. This can come from the ';
	html += 'investigator, other evidence, environmental sources, or ';
	html += 'improper laboratory handling.</p>';

	html += '<h3>Sources of Contamination</h3>';
	html += '<ul>';
	html += '<li>Touching evidence without gloves (skin cells, sweat)</li>';
	html += '<li>Talking, coughing, or sneezing over evidence (saliva droplets)</li>';
	html += '<li>Using non-sterile collection tools</li>';
	html += '<li>Cross-contamination between evidence samples</li>';
	html += '<li>Environmental DNA already present at the scene</li>';
	html += '</ul>';

	html += '<h3>Consequences</h3>';
	html += '<ul>';
	html += '<li>Mixed DNA profiles that are difficult or impossible to interpret</li>';
	html += '<li>False positive matches to innocent people</li>';
	html += '<li>Evidence ruled inadmissible in court proceedings</li>';
	html += '<li>Wrongful convictions or failed prosecutions</li>';
	html += '</ul>';

	html += '<h3>Prevention</h3>';
	html += '<p>Always wear gloves, use sterile equipment, change gloves between ';
	html += 'samples, and maintain careful documentation. In this game, ';
	html += 'the single most important step is putting on gloves before ';
	html += 'collecting any evidence.</p>';

	return html;
}

/* ============================================ */
function buildControlsHelp() {
	/*
	Returns HTML content explaining experimental controls.
	*/
	var html = '';
	html += '<h3>Why Controls Matter</h3>';
	html += '<p>Controls are reference samples run alongside your actual test ';
	html += 'to verify that the procedure worked correctly. Without controls, ';
	html += 'you cannot be confident that your results are valid.</p>';

	html += '<h3>Types of Controls</h3>';
	html += '<ul>';
	html += '<li><strong>Positive Control:</strong> A sample known to contain ';
	html += 'the target. If this does not produce a result, the test failed ';
	html += 'and your evidence results are unreliable.</li>';
	html += '<li><strong>Negative Control:</strong> A blank sample that should ';
	html += 'produce no result. If this shows a signal, contamination ';
	html += 'occurred during the test procedure.</li>';
	html += '</ul>';

	html += '<h3>In Forensic Testing</h3>';
	html += '<p>Every forensic DNA test in an accredited laboratory is run with ';
	html += 'both positive and negative controls. Defense attorneys routinely ';
	html += 'challenge results that lack proper controls.</p>';

	html += '<h3>In This Game</h3>';
	html += '<p>When running a test in the lab, you can choose to include a ';
	html += 'control. Including controls costs no extra resources but ';
	html += 'earns significant scoring points for scientific rigor. ';
	html += 'Omitting controls results in a score penalty.</p>';

	return html;
}

/* ============================================ */
function buildInterpretationHelp() {
	/*
	Returns HTML content about interpreting forensic results.
	*/
	var html = '';
	html += '<h3>Scientific Interpretation</h3>';
	html += '<p>Interpreting forensic results requires careful, evidence-based ';
	html += 'language. A forensic scientist must never overstate what the ';
	html += 'evidence shows.</p>';

	html += '<h3>Good Scientific Language</h3>';
	html += '<table class="help-table">';
	html += '<tr><th>Use</th><th>Avoid</th></tr>';
	html += '<tr><td>"consistent with"</td><td>"proves"</td></tr>';
	html += '<tr><td>"cannot be excluded"</td><td>"definitely"</td></tr>';
	html += '<tr><td>"the evidence supports"</td><td>"100% certain"</td></tr>';
	html += '<tr><td>"partial match observed"</td><td>"it is obvious that"</td></tr>';
	html += '<tr><td>"further testing recommended"</td>';
	html += '<td>"without a doubt"</td></tr>';
	html += '</table>';

	html += '<h3>Handling Uncertainty</h3>';
	html += '<p>Degraded samples, partial profiles, and mixed samples all ';
	html += 'introduce uncertainty. A good forensic scientist acknowledges ';
	html += 'these limitations rather than ignoring them. State what the ';
	html += 'evidence shows, what it does not show, and what additional ';
	html += 'testing might clarify.</p>';

	html += '<h3>Common Pitfalls</h3>';
	html += '<ul>';
	html += '<li>Confirmation bias: seeing what you expect rather than what ';
	html += 'the data actually shows</li>';
	html += '<li>Overclaiming: stating certainty beyond what the evidence ';
	html += 'supports</li>';
	html += '<li>Ignoring negative results: a test that excludes a suspect ';
	html += 'is just as important as one that includes them</li>';
	html += '<li>Prosecutor\'s fallacy: confusing "the probability of this ';
	html += 'evidence given innocence" with "the probability of innocence ';
	html += 'given this evidence"</li>';
	html += '</ul>';

	return html;
}

/* ============================================ */
function getTooltip(concept) {
	/*
	Returns a short tooltip text string for inline help.
	Args:
		concept: string key identifying the concept
	Returns a plain text string suitable for title attributes.
	*/
	var tooltips = {
		'allele': 'One of the variant forms of a gene or STR region. '
			+ 'Humans carry two alleles per locus, one from each parent.',

		'locus': 'A specific position on a chromosome where a gene or '
			+ 'marker is located. Plural: loci.',

		'electrophoresis': 'A technique that separates DNA fragments by '
			+ 'size using an electric field applied across a gel matrix. '
			+ 'Smaller fragments migrate farther.',

		'agglutination': 'The clumping of red blood cells when exposed to '
			+ 'an antibody that recognizes antigens on their surface. '
			+ 'Used in blood typing.',

		'restriction_enzyme': 'A protein that cuts DNA at a specific '
			+ 'recognition sequence. Different enzymes cut at different '
			+ 'sequences, producing unique fragment patterns.',

		'fragment': 'A piece of DNA produced by cutting with a restriction '
			+ 'enzyme or other method. Fragment sizes are measured in '
			+ 'base pairs (bp).',

		'haplotype': 'A set of genetic variants inherited together, '
			+ 'typically on the same chromosome or in mitochondrial DNA. '
			+ 'Used to trace ancestry and maternal lineage.',

		'pcr': 'Polymerase Chain Reaction -- a method that amplifies tiny '
			+ 'amounts of DNA into millions of copies, enabling analysis '
			+ 'of trace samples.',

		'codis': 'Combined DNA Index System -- the FBI database of DNA '
			+ 'profiles using standardized STR loci. Used to match '
			+ 'crime scene evidence to known individuals.',

		'chain_of_custody': 'The documented trail of who handled evidence, '
			+ 'when, and where, from crime scene to courtroom. Gaps in '
			+ 'this chain can invalidate evidence.',

		'control_sample': 'A reference sample with a known outcome, run '
			+ 'alongside test samples to verify that the procedure '
			+ 'worked correctly.',

		'degraded': 'DNA that has been damaged by environmental factors '
			+ 'such as heat, humidity, UV light, or bacterial action. '
			+ 'May produce incomplete or missing results.',

		'mixture': 'A sample containing DNA from two or more individuals. '
			+ 'Produces extra alleles at STR loci and complex RFLP '
			+ 'banding patterns, complicating interpretation.'
	};

	if (tooltips[concept]) {
		return tooltips[concept];
	}
	return 'No tooltip available for: ' + concept;
}

/* ============================================ */
function getTestExplanation(testType) {
	/*
	Returns an HTML string explaining what a test does
	and how to interpret the results.
	Used in the lab phase when displaying results.
	Args:
		testType: string key from FORENSIC_TESTS
	Returns HTML string.
	*/
	var html = '';

	switch (testType) {
		case 'blood_type':
			html += '<div class="test-explanation">';
			html += '<h4>Blood Typing Results</h4>';
			html += '<p>This test mixed the sample with anti-A, anti-B, and ';
			html += 'anti-D (Rh) antibodies. Agglutination (clumping) ';
			html += 'indicates the presence of the corresponding antigen.</p>';
			html += '<p><strong>How to read:</strong> A positive reaction ';
			html += 'with anti-A means the blood carries the A antigen. ';
			html += 'Combine reactions to determine the ABO group. ';
			html += 'Blood type alone cannot identify a person but can ';
			html += 'exclude suspects with incompatible types.</p>';
			html += '</div>';
			break;

		case 'rflp':
			html += '<div class="test-explanation">';
			html += '<h4>RFLP Gel Results</h4>';
			html += '<p>DNA was cut with restriction enzymes and separated ';
			html += 'by size on a gel. Each column shows the banding ';
			html += 'pattern for one enzyme.</p>';
			html += '<p><strong>How to read:</strong> Compare band positions ';
			html += 'between your evidence sample and suspect reference ';
			html += 'profiles. Matching bands at the same positions ';
			html += 'indicate consistency. Missing bands may result from ';
			html += 'DNA degradation, not necessarily exclusion.</p>';
			html += '</div>';
			break;

		case 'str':
			html += '<div class="test-explanation">';
			html += '<h4>STR Profile Results</h4>';
			html += '<p>PCR amplified specific CODIS loci and measured the ';
			html += 'number of tandem repeats at each. Each person has ';
			html += 'two alleles per locus.</p>';
			html += '<p><strong>How to read:</strong> Two numbers at each ';
			html += 'locus represent the allele pair. Compare these ';
			html += 'pairs against suspect profiles. All loci must match ';
			html += 'for a positive identification. Empty loci indicate ';
			html += 'dropout from degradation. More than two alleles ';
			html += 'at a locus suggests a DNA mixture.</p>';
			html += '</div>';
			break;

		case 'mtdna':
			html += '<div class="test-explanation">';
			html += '<h4>Mitochondrial DNA Results</h4>';
			html += '<p>The mitochondrial genome was sequenced and assigned ';
			html += 'a haplotype identifier based on known variation.</p>';
			html += '<p><strong>How to read:</strong> A matching haplotype ';
			html += 'means the evidence and suspect share a maternal ';
			html += 'lineage. This is consistent with a match but is ';
			html += 'less discriminating than STR -- many unrelated ';
			html += 'people share the same mtDNA haplotype. Best used ';
			html += 'for exclusion or to complement other tests.</p>';
			html += '</div>';
			break;

		case 'restriction':
			html += '<div class="test-explanation">';
			html += '<h4>Restriction Digest Results</h4>';
			html += '<p>DNA was cut with a specific restriction enzyme and ';
			html += 'the resulting fragments were measured.</p>';
			html += '<p><strong>How to read:</strong> Compare the fragment ';
			html += 'sizes and number of fragments between your evidence ';
			html += 'and suspect profiles. Matching fragment patterns ';
			html += 'support a common source. Extra fragments may ';
			html += 'indicate a mixed sample.</p>';
			html += '</div>';
			break;

		default:
			html += '<div class="test-explanation">';
			html += '<p>No explanation available for this test type.</p>';
			html += '</div>';
	}

	return html;
}

/* ============================================ */
function getEndGameSummary() {
	/*
	Returns HTML summarizing the forensic concepts the player
	encountered during the game. Lists each test type used
	and provides a brief educational note. Mentions strengths
	and areas for improvement.
	*/
	var html = '';

	// Collect all unique test types that were run
	var testTypesUsed = {};
	for (var i = 0; i < gameState.testResults.length; i++) {
		var testType = gameState.testResults[i].testType;
		testTypesUsed[testType] = true;
	}

	var typeKeys = Object.keys(testTypesUsed);

	if (typeKeys.length === 0) {
		html += '<p>No forensic tests were run during this investigation. ';
		html += 'Collecting evidence and running appropriate tests is ';
		html += 'essential for building a forensic case.</p>';
		return html;
	}

	html += '<p>During this investigation, you used the following forensic ';
	html += 'techniques:</p>';
	html += '<ul>';

	for (var t = 0; t < typeKeys.length; t++) {
		var key = typeKeys[t];
		html += '<li>';
		html += '<strong>' + getTestDisplayName(key) + ':</strong> ';
		html += getTestEducationalNote(key);
		html += '</li>';
	}
	html += '</ul>';

	// Summary of evidence handling
	var totalSamples = gameState.collectedSamples.length;
	var totalTests = gameState.testResults.length;
	var contaminated = gameState.contaminationEvents;

	html += '<h3>Investigation Statistics</h3>';
	html += '<ul>';
	html += '<li>Evidence samples collected: ' + totalSamples + '</li>';
	html += '<li>Forensic tests conducted: ' + totalTests + '</li>';
	html += '<li>Contamination events: ' + contaminated + '</li>';
	html += '<li>Rounds completed: ' + gameState.roundHistory.length + '</li>';
	html += '</ul>';

	// Brief takeaway
	if (contaminated === 0) {
		html += '<p>You maintained excellent evidence integrity throughout ';
		html += 'the investigation -- no contamination events occurred.</p>';
	} else {
		html += '<p>Remember: in real forensic work, even a single ';
		html += 'contamination event can compromise an entire case. ';
		html += 'Always prioritize proper evidence handling.</p>';
	}

	return html;
}

/* ============================================ */
function getTestDisplayName(testType) {
	/*
	Returns the human-readable display name for a test type.
	Args:
		testType: string key from FORENSIC_TESTS
	Returns a display name string.
	*/
	if (FORENSIC_TESTS[testType]) {
		return FORENSIC_TESTS[testType].name;
	}
	return testType;
}

/* ============================================ */
function getTestEducationalNote(testType) {
	/*
	Returns a brief educational note about a test type
	for the end-game summary.
	Args:
		testType: string key from FORENSIC_TESTS
	Returns a plain text educational note.
	*/
	var notes = {
		'blood_type': 'Blood typing is one of the oldest forensic tests. '
			+ 'While it cannot uniquely identify a person, it remains '
			+ 'valuable as a rapid exclusionary tool.',

		'rflp': 'RFLP was the first DNA fingerprinting method, pioneered '
			+ 'by Alec Jeffreys in 1984. It requires intact DNA and '
			+ 'larger sample sizes than modern methods.',

		'str': 'STR profiling is the current gold standard in forensic '
			+ 'DNA identification. The CODIS database uses STR loci '
			+ 'to match crime scene evidence nationwide.',

		'mtdna': 'Mitochondrial DNA analysis is essential for degraded '
			+ 'samples and rootless hair. Its maternal inheritance '
			+ 'pattern makes it useful for tracing family lineages.',

		'restriction': 'Restriction enzyme digestion is foundational to '
			+ 'molecular biology and RFLP analysis. Understanding '
			+ 'how enzymes cut DNA at specific sequences is key to '
			+ 'interpreting fragment patterns.'
	};

	if (notes[testType]) {
		return notes[testType];
	}
	return 'A forensic analysis technique used in DNA identification.';
}
