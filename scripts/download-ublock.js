#!/usr/bin/env node

const https = require("https");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const DEST = path.join(__dirname, "..", "extensions", "ublock-origin");

if (fs.existsSync(path.join(DEST, "manifest.json"))) {
  console.log("uBlock Origin already present, skipping download.");
  process.exit(0);
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "kenku-fm-setup" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return resolve(get(res.headers.location));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  console.log("Fetching latest uBlock Origin release info...");
  const releaseData = await get(
    "https://api.github.com/repos/gorhill/uBlock/releases/latest"
  );
  const release = JSON.parse(releaseData.toString());

  const asset = release.assets.find((a) => a.name === "uBlock0.chromium.zip");
  if (!asset) {
    throw new Error("Could not find uBlock0.chromium.zip in latest release");
  }

  console.log(`Downloading uBlock Origin ${release.tag_name}...`);
  const zipBuffer = await get(asset.browser_download_url);

  const tmpZip = path.join(os.tmpdir(), "ublock-origin.zip");
  fs.writeFileSync(tmpZip, zipBuffer);

  fs.mkdirSync(DEST, { recursive: true });

  if (process.platform === "win32") {
    execSync(
      `powershell -command "Expand-Archive -Force '${tmpZip}' '${DEST}'"`,
      { stdio: "inherit" }
    );
  } else {
    execSync(`unzip -o "${tmpZip}" -d "${DEST}"`, { stdio: "inherit" });
  }

  fs.unlinkSync(tmpZip);
  console.log(`uBlock Origin ${release.tag_name} installed to extensions/ublock-origin/`);
}

main().catch((e) => {
  console.warn("Warning: Failed to download uBlock Origin:", e.message);
  console.warn("Run 'npm run download-ublock' manually when network is available.");
  // Exit 0 so npm install isn't blocked
  process.exit(0);
});
