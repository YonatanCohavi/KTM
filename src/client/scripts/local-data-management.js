// Quick utility script to manage leaderboard data locally
// Open browser console (F12) and paste commands below

// 1. Export your local leaderboard cache
console.log("=== Exporting leaderboard cache ===");
const leaderboardCache = localStorage.getItem("leaderboard_cache");
console.log(JSON.parse(leaderboardCache || "[]"));
console.log("Copy the output above and save it");

// 2. Export your own player stats
console.log("=== Exporting your stats ===");
const playerStats = localStorage.getItem("playerStats");
console.log(JSON.parse(playerStats || "{}"));

// 3. Export your browser UUID
console.log("=== Your Browser UUID ===");
console.log(localStorage.getItem("browserUUID"));

// 4. Import leaderboard cache
// Usage: pasteLeaderboardCache(jsonData)
window.pasteLeaderboardCache = function(jsonData) {
  try {
    localStorage.setItem("leaderboard_cache", JSON.stringify(jsonData));
    console.log("✅ Leaderboard cache imported");
  } catch (e) {
    console.error("❌ Import failed:", e);
  }
};

// 5. Import player stats
// Usage: pastePlayerStats(jsonData)
window.pastePlayerStats = function(jsonData) {
  try {
    localStorage.setItem("playerStats", JSON.stringify(jsonData));
    console.log("✅ Player stats imported");
  } catch (e) {
    console.error("❌ Import failed:", e);
  }
};

// 6. Set browser UUID
// Usage: setBrowserUUID("uuid-string-here")
window.setBrowserUUID = function(uuid) {
  try {
    localStorage.setItem("browserUUID", uuid);
    console.log("✅ Browser UUID set to:", uuid);
  } catch (e) {
    console.error("❌ Failed to set UUID:", e);
  }
};

// 7. View all app data
window.viewAllData = function() {
  console.log("=== Player Stats ===");
  console.log(JSON.parse(localStorage.getItem("playerStats") || "{}"));
  console.log("=== Leaderboard Cache ===");
  console.log(JSON.parse(localStorage.getItem("leaderboard_cache") || "[]"));
  console.log("=== Browser UUID ===");
  console.log(localStorage.getItem("browserUUID"));
  console.log("=== Member Weights ===");
  console.log(JSON.parse(localStorage.getItem("memberWeights") || "{}"));
};

// 8. Clear all app data
window.clearAllData = function() {
  if (confirm("Are you sure? This cannot be undone.")) {
    localStorage.clear();
    console.log("✅ All data cleared");
  }
};

console.log("✅ Data management utilities loaded");
console.log("Available commands:");
console.log("  - viewAllData()");
console.log("  - pasteLeaderboardCache(jsonData)");
console.log("  - pastePlayerStats(jsonData)");
console.log("  - setBrowserUUID('uuid')");
console.log("  - clearAllData()");
