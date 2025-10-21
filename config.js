const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}

module.exports = {
  SESSION_ID: process.env.SESSION_ID || "suho~TI13RCgA#I9T67tPJMZtbkmWI0N_5OWpgb4PginmMNWiQFETnCL4",
  ALIVE_MSG: process.env.ALIVE_MSG || "☘️I made bot successful,bot is online ☘️",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/ue4ppc.jpg"
};
