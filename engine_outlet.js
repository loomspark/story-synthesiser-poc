const fs = require("fs");

// Load datasets
const seedData = require("./seed.json");
const storyData = require("./story.json");

/**
 * Get the first entry from seed.json
 * and merge in story data (title + body_text).
 * @returns {object|null} - Combined JSON object
 */
function getCombinedData() {
  if (!Array.isArray(seedData) || seedData.length === 0) {
    return null;
  }

  // Clone the first entry
  const firstEntry = { ...seedData[0] };

  // Merge story fields into the story object
  firstEntry.story = {
    ...firstEntry.story,
    title: storyData.title,
    body_text: storyData.body_text
  };

  return firstEntry;
}

/**
 * Write combined data to a new JSON file
 * @param {string} outputFile - Path for the new JSON file
 */
function writeCombinedData(outputFile) {
  const combined = getCombinedData();
  if (!combined) {
    console.error("No data found in seed.json");
    return;
  }

  fs.writeFileSync(outputFile, JSON.stringify(combined, null, 2), "utf-8");
  console.log(`Combined data written to ${outputFile}`);
}

// Run it
writeCombinedData("combined.json");