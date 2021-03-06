// NOTE: This file kind of should be part of the contracts package. That is where the contracts are coming from and being set also, since we don't use the lib-ethers deploy scripts for EWC
// but I'm leaving the file here as it was created by Liquity. Just note that check-live-version.ts was looking at the version of the lib-ethers deploy output JSON file, which we don't use any more.
// but we do still use this script to copy all latest contract artifacts to the lib-ethers/live dir for UI build.
import fs from "fs-extra";
import path from "path";

const artifactsDir = path.join("..", "contracts", "artifacts");
const contractsDir = path.join(artifactsDir, "contracts");
const liveDir = "live";

// *.json, except *.dbg.json
const jsonFileFilter = /(?<!\.dbg)\.json$/;

const recursivelyListFilesInDir = (dir: string): [string, string][] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(dirent =>
      dirent.isDirectory()
        ? recursivelyListFilesInDir(path.join(dir, dirent.name))
        : [[dir, dirent.name]]
    );

const jsonFiles = recursivelyListFilesInDir(contractsDir).filter(([, file]) =>
  jsonFileFilter.test(file)
);

fs.removeSync(liveDir);
fs.mkdirSync(liveDir);

//console.log("save-live-version...");
//console.log("artifactsDir=", artifactsDir);
//console.log("liveDir=" + liveDir);
// console.log("jsonFiles=" + jsonFiles);
//console.log("src=" + path.join(artifactsDir, "version"));
//console.log("dest=" + path.join(liveDir, "version"));
fs.copyFileSync(path.join(artifactsDir, "version"), path.join(liveDir, "version"));
jsonFiles.forEach(([dir, file]) => fs.copyFileSync(path.join(dir, file), path.join(liveDir, file)));
