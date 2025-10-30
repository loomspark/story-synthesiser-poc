// Load the dataset from seed.json
const seedData = require("./seed.json");

/**
 * Get the first object in the dataset
 * @returns {object|null} - The first JSON object or null if dataset is empty
 */
function getFirstEntry() {
  if (Array.isArray(seedData) && seedData.length > 0) {
    return seedData[0];
  }
  return null;
}

// Example usage:
const firstEntry = getFirstEntry();

if (firstEntry) {
  const payload = JSON.stringify(firstEntry);
  console.log("Prepared JSON payload:", payload);

  // Example placeholder for API call:
  /*
  fetch("https://api.olama.com/endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload
  })
    .then(res => res.json())
    .then(data => console.log("Response:", data))
    .catch(err => console.error("Error:", err));
  */
}