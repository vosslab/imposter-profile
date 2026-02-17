#!/bin/bash
# Build forensic_detective.html from parts
# Concatenates CSS, HTML, and JS modules into a single self-contained file

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
PARTS="${REPO_ROOT}/parts"
OUTPUT="${REPO_ROOT}/forensic_detective.html"

echo "Building forensic_detective.html from parts..."

# Start with head
cat "${PARTS}/head.html" > "${OUTPUT}"

# Inline CSS
echo "<style>" >> "${OUTPUT}"
cat "${PARTS}/style.css" >> "${OUTPUT}"
echo "</style>" >> "${OUTPUT}"
echo "</head>" >> "${OUTPUT}"

# Body structure
echo "<body>" >> "${OUTPUT}"
cat "${PARTS}/body.html" >> "${OUTPUT}"

# Inline JS - order matters for variable declarations
echo "<script>" >> "${OUTPUT}"

JS_FILES=(
	"constants.js"
	"characters.js"
	"data_generation.js"
	"game_state.js"
	"timer.js"
	"scene_phase.js"
	"lab_phase.js"
	"gel_rendering.js"
	"case_board.js"
	"scoring.js"
	"educational.js"
	"ui_rendering.js"
	"save_load.js"
	"init.js"
)

for js_file in "${JS_FILES[@]}"; do
	if [ -f "${PARTS}/${js_file}" ]; then
		echo "" >> "${OUTPUT}"
		echo "/* ============================================ */" >> "${OUTPUT}"
		echo "/* ${js_file} */" >> "${OUTPUT}"
		echo "/* ============================================ */" >> "${OUTPUT}"
		echo "" >> "${OUTPUT}"
		cat "${PARTS}/${js_file}" >> "${OUTPUT}"
	else
		echo "WARNING: Missing ${PARTS}/${js_file}" >&2
	fi
done

echo "</script>" >> "${OUTPUT}"

# Close tags
cat "${PARTS}/tail.html" >> "${OUTPUT}"

echo "Built ${OUTPUT} successfully"
wc -l "${OUTPUT}"
