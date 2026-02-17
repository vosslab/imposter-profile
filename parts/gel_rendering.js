/* ============================================ */
/* GEL RENDERING - Canvas Gel Electrophoresis   */
/* ============================================ */

// Standard DNA size marker ladder values in base pairs
var LADDER_SIZES = [200, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000];

// Gel layout constants
var GEL_MARGIN_LEFT = 40;
var GEL_MARGIN_RIGHT = 20;
var GEL_MARGIN_TOP = 50;
var GEL_MARGIN_BOTTOM = 30;
var GEL_BG_COLOR = '#1a1a3e';
var GEL_AREA_COLOR = '#252560';
var BAND_COLOR_R = 136;
var BAND_COLOR_G = 187;
var BAND_COLOR_B = 255;

// Scale range for logarithmic band positioning
var GEL_MIN_SIZE = 200;
var GEL_MAX_SIZE = 15000;

/* ============================================ */
function sizeToY(size, gelTop, gelHeight) {
	/* Convert a DNA fragment size in bp to a vertical Y position
	   on the gel canvas. Larger fragments migrate less and appear
	   near the top; smaller fragments migrate further and appear
	   near the bottom. Uses logarithmic scaling.

	Args:
		size: fragment size in base pairs
		gelTop: pixel Y coordinate of the top of the gel area
		gelHeight: pixel height of the gel area

	Returns:
		number: Y coordinate in canvas pixels
	*/
	// Clamp size to the display range
	var clampedSize = Math.max(GEL_MIN_SIZE, Math.min(GEL_MAX_SIZE, size));
	// Logarithmic interpolation: large at top, small at bottom
	var logRange = Math.log(GEL_MAX_SIZE) - Math.log(GEL_MIN_SIZE);
	var fraction = (Math.log(clampedSize) - Math.log(GEL_MIN_SIZE)) / logRange;
	// Invert so large fragments are at the top
	var y = gelTop + gelHeight * (1.0 - fraction);
	return y;
}

/* ============================================ */
function drawBand(ctx, x, y, width, height, intensity) {
	/* Draw a single gel electrophoresis band with a glow effect.

	Args:
		ctx: canvas 2D rendering context
		x: left edge X coordinate of the band
		y: center Y coordinate of the band
		width: band width in pixels
		height: band height in pixels (typically 3-6)
		intensity: brightness from 0.0 to 1.0
	*/
	// Clamp intensity to valid range
	var alpha = Math.max(0.1, Math.min(1.0, intensity));

	// Outer glow effect using canvas shadow
	ctx.save();
	ctx.shadowColor = 'rgba(' + BAND_COLOR_R + ',' + BAND_COLOR_G + ',' + BAND_COLOR_B + ',' + (alpha * 0.6) + ')';
	ctx.shadowBlur = 6;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	// Draw the band rectangle
	ctx.fillStyle = 'rgba(' + BAND_COLOR_R + ',' + BAND_COLOR_G + ',' + BAND_COLOR_B + ',' + alpha + ')';
	ctx.fillRect(x, y - height / 2, width, height);

	ctx.restore();

	// Draw a brighter center line for sharper visual definition
	var centerAlpha = Math.min(1.0, alpha + 0.2);
	ctx.fillStyle = 'rgba(200, 220, 255, ' + centerAlpha + ')';
	ctx.fillRect(x + 2, y - 1, width - 4, 2);
}

/* ============================================ */
function drawLadder(ctx, x, gelTop, gelHeight, wellWidth) {
	/* Draw the DNA size marker ladder in the leftmost lane.
	   Draws thin bands at each standard size position and labels
	   each band with its size on the left margin.

	Args:
		ctx: canvas 2D rendering context
		x: center X coordinate of the ladder lane
		gelTop: pixel Y of the top of the gel area
		gelHeight: pixel height of the gel area
		wellWidth: width of each lane in pixels
	*/
	var bandWidth = wellWidth * 0.6;
	var bandX = x - bandWidth / 2;

	ctx.font = '9px monospace';
	ctx.fillStyle = '#8899bb';
	ctx.textAlign = 'right';

	for (var i = 0; i < LADDER_SIZES.length; i++) {
		var size = LADDER_SIZES[i];
		var y = sizeToY(size, gelTop, gelHeight);

		// Draw ladder band (thinner than sample bands)
		drawBand(ctx, bandX, y, bandWidth, 3, 0.7);

		// Draw size label on the left margin
		var labelText = '';
		if (size >= 1000) {
			labelText = (size / 1000) + 'kb';
		} else {
			labelText = size + 'bp';
		}
		ctx.fillStyle = '#8899bb';
		ctx.fillText(labelText, GEL_MARGIN_LEFT - 4, y + 3);
	}
}

/* ============================================ */
function drawWell(ctx, x, y, width) {
	/* Draw a sample well marker at the top of a gel lane.

	Args:
		ctx: canvas 2D rendering context
		x: center X coordinate of the well
		y: Y coordinate of the top of the gel area
		width: width of the well in pixels
	*/
	var wellWidth = width * 0.5;
	var wellHeight = 6;

	ctx.fillStyle = '#0a0a2a';
	ctx.fillRect(x - wellWidth / 2, y - wellHeight, wellWidth, wellHeight);

	// Draw a thin border around the well
	ctx.strokeStyle = '#334';
	ctx.lineWidth = 1;
	ctx.strokeRect(x - wellWidth / 2, y - wellHeight, wellWidth, wellHeight);
}

/* ============================================ */
function renderGel(canvasId, lanes, title) {
	/* Main gel rendering function. Draws a complete gel electrophoresis
	   image on the specified canvas element.

	Args:
		canvasId: ID of the canvas element (default 'gel-canvas')
		lanes: array of objects with the shape:
			{ label: string, fragments: [sizes in bp], intensity: number }
		title: string displayed at the top of the gel

	The first lane in the array should be the size marker ladder
	data, or an explicit ladder lane is prepended if lane[0].label
	is not 'Ladder'.
	*/
	if (!canvasId) {
		canvasId = 'gel-canvas';
	}
	var canvas = document.getElementById(canvasId);
	if (!canvas) {
		return;
	}

	// Force canvas dimensions
	canvas.width = 700;
	canvas.height = 450;
	var ctx = canvas.getContext('2d');

	// Calculate gel area dimensions
	var gelLeft = GEL_MARGIN_LEFT;
	var gelTop = GEL_MARGIN_TOP;
	var gelWidth = canvas.width - GEL_MARGIN_LEFT - GEL_MARGIN_RIGHT;
	var gelHeight = canvas.height - GEL_MARGIN_TOP - GEL_MARGIN_BOTTOM;

	// Prepend ladder lane if not already present
	var allLanes = [];
	if (lanes.length === 0 || lanes[0].label !== 'Ladder') {
		allLanes.push({ label: 'Ladder', fragments: LADDER_SIZES.slice(), intensity: 0.7 });
	}
	for (var i = 0; i < lanes.length; i++) {
		allLanes.push(lanes[i]);
	}

	// Calculate lane spacing
	var numLanes = allLanes.length;
	var laneWidth = gelWidth / numLanes;

	// Step 1: Fill background
	ctx.fillStyle = GEL_BG_COLOR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Step 2: Draw the gel area rectangle
	ctx.fillStyle = GEL_AREA_COLOR;
	ctx.fillRect(gelLeft, gelTop, gelWidth, gelHeight);

	// Draw thin gel border
	ctx.strokeStyle = '#334466';
	ctx.lineWidth = 1;
	ctx.strokeRect(gelLeft, gelTop, gelWidth, gelHeight);

	// Step 3: Draw lane separator lines
	ctx.strokeStyle = 'rgba(50, 60, 90, 0.4)';
	ctx.lineWidth = 1;
	for (var laneIdx = 1; laneIdx < numLanes; laneIdx++) {
		var separatorX = gelLeft + laneIdx * laneWidth;
		ctx.beginPath();
		ctx.moveTo(separatorX, gelTop);
		ctx.lineTo(separatorX, gelTop + gelHeight);
		ctx.stroke();
	}

	// Step 4: Draw wells and bands for each lane
	for (var laneNum = 0; laneNum < numLanes; laneNum++) {
		var lane = allLanes[laneNum];
		var laneCenterX = gelLeft + laneNum * laneWidth + laneWidth / 2;

		// Draw the well at the top
		drawWell(ctx, laneCenterX, gelTop, laneWidth);

		// Draw bands for this lane
		var bandWidth = laneWidth * 0.55;
		var bandX = laneCenterX - bandWidth / 2;
		var laneIntensity = (lane.intensity !== undefined) ? lane.intensity : 0.9;

		if (laneNum === 0 && lane.label === 'Ladder') {
			// Use the dedicated ladder drawing function
			drawLadder(ctx, laneCenterX, gelTop, gelHeight, laneWidth);
		} else {
			// Draw sample bands
			var fragments = lane.fragments || [];
			for (var fragIdx = 0; fragIdx < fragments.length; fragIdx++) {
				var fragSize = fragments[fragIdx];
				var bandY = sizeToY(fragSize, gelTop, gelHeight);
				// Slight variation in band thickness for realism
				var bandHeight = 4 + Math.random() * 2;
				drawBand(ctx, bandX, bandY, bandWidth, bandHeight, laneIntensity);
			}
		}
	}

	// Step 5: Draw lane labels at top
	ctx.font = 'bold 10px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#aabbdd';
	for (var labelIdx = 0; labelIdx < numLanes; labelIdx++) {
		var labelX = gelLeft + labelIdx * laneWidth + laneWidth / 2;
		var labelY = gelTop - 10;
		var labelText = allLanes[labelIdx].label || ('Lane ' + (labelIdx + 1));
		// Truncate long labels
		if (labelText.length > 12) {
			labelText = labelText.substring(0, 11) + '...';
		}
		ctx.fillText(labelText, labelX, labelY);
	}

	// Step 6: Draw title at the very top
	if (title) {
		ctx.font = 'bold 14px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ccddff';
		ctx.fillText(title, canvas.width / 2, 18);
	}

	// Step 7: Draw a subtle gradient overlay at the bottom for depth
	var gradient = ctx.createLinearGradient(0, gelTop + gelHeight - 20, 0, gelTop + gelHeight);
	gradient.addColorStop(0, 'rgba(10, 10, 30, 0)');
	gradient.addColorStop(1, 'rgba(10, 10, 30, 0.3)');
	ctx.fillStyle = gradient;
	ctx.fillRect(gelLeft, gelTop + gelHeight - 20, gelWidth, 20);
}

/* ============================================ */
function renderRestrictionGel(canvasId, sampleFragments, suspectFragments, enzyme) {
	/* Render a simplified gel for restriction enzyme digest analysis.
	   Shows a ladder lane, the evidence sample lane, and one or more
	   suspect reference lanes.

	Args:
		canvasId: ID of the canvas element
		sampleFragments: array of fragment sizes (bp) for the evidence sample
		suspectFragments: object mapping suspect names to fragment arrays,
			e.g. { 'Ted Bundy': [800, 1500, 3000], ... }
		enzyme: name of the restriction enzyme used (for the title)
	*/
	var lanes = [];

	// Evidence sample lane
	lanes.push({
		label: 'Evidence',
		fragments: sampleFragments,
		intensity: 0.9
	});

	// Suspect reference lanes
	var suspectNames = Object.keys(suspectFragments);
	for (var i = 0; i < suspectNames.length; i++) {
		var name = suspectNames[i];
		// Use first name only for compact label
		var shortName = name.split(' ')[0];
		lanes.push({
			label: shortName,
			fragments: suspectFragments[name],
			intensity: 0.85
		});
	}

	var gelTitle = 'Restriction Digest - ' + enzyme;
	renderGel(canvasId, lanes, gelTitle);
}

/* ============================================ */
function renderSTRChart(canvasId, strData, title) {
	/* Draw an STR electropherogram-style bar chart showing allele
	   peaks grouped by locus. Each locus shows one or two peaks
	   at the corresponding repeat number positions.

	Args:
		canvasId: ID of the canvas element (default 'gel-canvas')
		strData: object mapping locus names to allele arrays,
			e.g. { 'D3S1358': [14, 16], 'vWA': [17, 19], ... }
		title: chart title string
	*/
	if (!canvasId) {
		canvasId = 'gel-canvas';
	}
	var canvas = document.getElementById(canvasId);
	if (!canvas) {
		return;
	}

	canvas.width = 700;
	canvas.height = 450;
	var ctx = canvas.getContext('2d');

	// Chart area constants
	var chartLeft = 60;
	var chartTop = 50;
	var chartRight = 680;
	var chartBottom = 400;
	var chartWidth = chartRight - chartLeft;
	var chartHeight = chartBottom - chartTop;

	// Color palette for locus groups
	var locusColors = [
		'#4488ff', '#44cc88', '#ff8844', '#cc44ff',
		'#ffcc44', '#44dddd', '#ff4488', '#88ff44'
	];

	// Gather locus names
	var lociNames = Object.keys(strData);
	var numLoci = lociNames.length;
	if (numLoci === 0) {
		return;
	}

	// Background
	ctx.fillStyle = '#0d0d2b';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Chart background
	ctx.fillStyle = '#141438';
	ctx.fillRect(chartLeft, chartTop, chartWidth, chartHeight);

	// Draw title
	if (title) {
		ctx.font = 'bold 14px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ccddff';
		ctx.fillText(title, canvas.width / 2, 24);
	}

	// Y-axis label
	ctx.save();
	ctx.translate(16, chartTop + chartHeight / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.font = '11px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#8899bb';
	ctx.fillText('Relative Fluorescence (RFU)', 0, 0);
	ctx.restore();

	// Y-axis gridlines
	ctx.strokeStyle = 'rgba(80, 100, 140, 0.3)';
	ctx.lineWidth = 1;
	for (var gridIdx = 0; gridIdx <= 4; gridIdx++) {
		var gridY = chartTop + (chartHeight * gridIdx / 4);
		ctx.beginPath();
		ctx.moveTo(chartLeft, gridY);
		ctx.lineTo(chartRight, gridY);
		ctx.stroke();
	}

	// Calculate locus group widths
	var locusGroupWidth = chartWidth / numLoci;

	for (var locIdx = 0; locIdx < numLoci; locIdx++) {
		var locusName = lociNames[locIdx];
		var alleles = strData[locusName];
		var color = locusColors[locIdx % locusColors.length];
		var groupLeft = chartLeft + locIdx * locusGroupWidth;
		var groupCenter = groupLeft + locusGroupWidth / 2;

		// Draw locus separator line
		if (locIdx > 0) {
			ctx.strokeStyle = 'rgba(60, 70, 100, 0.5)';
			ctx.lineWidth = 1;
			ctx.setLineDash([3, 3]);
			ctx.beginPath();
			ctx.moveTo(groupLeft, chartTop);
			ctx.lineTo(groupLeft, chartBottom);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		// Draw locus name label at bottom
		ctx.font = 'bold 9px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillStyle = color;
		ctx.fillText(locusName, groupCenter, chartBottom + 16);

		// Draw allele peaks
		if (!alleles || alleles.length === 0) {
			continue;
		}

		var peakWidth = Math.max(8, locusGroupWidth / 5);
		var peakSpacing = peakWidth + 6;

		// Center the peaks within the group
		var totalPeakWidth = alleles.length * peakSpacing - 6;
		var peakStartX = groupCenter - totalPeakWidth / 2;

		for (var alleleIdx = 0; alleleIdx < alleles.length; alleleIdx++) {
			var alleleValue = alleles[alleleIdx];
			// Simulate peak height (random variation for realism)
			var peakHeightFraction = 0.6 + Math.random() * 0.35;
			var peakHeight = chartHeight * peakHeightFraction;
			var peakX = peakStartX + alleleIdx * peakSpacing;
			var peakY = chartBottom - peakHeight;

			// Draw peak as a filled triangle/curve
			ctx.beginPath();
			ctx.moveTo(peakX, chartBottom);
			// Left side of peak
			ctx.quadraticCurveTo(peakX + peakWidth * 0.25, peakY + peakHeight * 0.2, peakX + peakWidth / 2, peakY);
			// Right side of peak
			ctx.quadraticCurveTo(peakX + peakWidth * 0.75, peakY + peakHeight * 0.2, peakX + peakWidth, chartBottom);
			ctx.closePath();

			// Fill with semi-transparent color
			ctx.fillStyle = color;
			ctx.globalAlpha = 0.7;
			ctx.fill();
			ctx.globalAlpha = 1.0;

			// Draw peak outline
			ctx.strokeStyle = color;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(peakX, chartBottom);
			ctx.quadraticCurveTo(peakX + peakWidth * 0.25, peakY + peakHeight * 0.2, peakX + peakWidth / 2, peakY);
			ctx.quadraticCurveTo(peakX + peakWidth * 0.75, peakY + peakHeight * 0.2, peakX + peakWidth, chartBottom);
			ctx.stroke();

			// Label the allele number at the peak top
			ctx.font = 'bold 10px monospace';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#ffffff';
			ctx.fillText(String(alleleValue), peakX + peakWidth / 2, peakY - 6);
		}
	}

	// Draw X-axis baseline
	ctx.strokeStyle = '#667799';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(chartLeft, chartBottom);
	ctx.lineTo(chartRight, chartBottom);
	ctx.stroke();

	// Draw Y-axis line
	ctx.beginPath();
	ctx.moveTo(chartLeft, chartTop);
	ctx.lineTo(chartLeft, chartBottom);
	ctx.stroke();
}

/* ============================================ */
function showGelInModal(lanes, title) {
	/* Render a gel on the hidden canvas and display the resulting
	   image in the game modal for a larger view.

	Args:
		lanes: array of lane objects for renderGel()
		title: gel title string
	*/
	var canvas = document.getElementById('gel-canvas');
	if (!canvas) {
		return;
	}

	// Make canvas visible temporarily for rendering
	canvas.style.display = 'block';
	renderGel('gel-canvas', lanes, title);

	// Capture the canvas content as a data URL image
	var imageUrl = canvas.toDataURL('image/png');
	canvas.style.display = 'none';

	// Build modal content with the gel image
	var modalHtml = '';
	modalHtml += '<h3>' + title + '</h3>';
	modalHtml += '<div style="text-align: center;">';
	modalHtml += '<img src="' + imageUrl + '" style="max-width: 100%; border: 1px solid #334466; border-radius: 4px;" alt="Gel electrophoresis result">';
	modalHtml += '</div>';
	modalHtml += '<p style="color: #8899bb; font-size: 0.85em; margin-top: 8px;">';
	modalHtml += 'Larger fragments (top) migrate less. Smaller fragments (bottom) migrate further through the gel.';
	modalHtml += '</p>';

	showModal('Gel Electrophoresis', modalHtml);
}

/* ============================================ */
function getGelAsImage() {
	/* Capture the current content of the gel canvas as a data URL
	   string for embedding in test results or saving.

	Returns:
		string: PNG data URL of the gel canvas content, or empty
			string if canvas is not available
	*/
	var canvas = document.getElementById('gel-canvas');
	if (!canvas) {
		return '';
	}
	return canvas.toDataURL('image/png');
}
