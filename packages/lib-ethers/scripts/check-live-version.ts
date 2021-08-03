// RJA NOTE: this file really doesn't do or check anything any longer for EWC deployments. This is because we don't use the lib-ethers deploy scripts, so there are no "deployment JSON files" to even check version against.
// So this script basically just runs, see's no files, and outputs that all deployments match. It's a no-op script for EWC really.
// we do stll use the packages/lib-ethers/live files (which were saved by save-live-version script) to build the UI.

import fs from "fs";
import path from "path";
import "colors";

import { _LiquityDeploymentJSON } from "../src/contracts";

const compareDeployedVersionsTo = (version: string) => {
  let match = true;

  const deployments = fs
    .readdirSync("deployments", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(deploymentDir =>
      fs
        .readdirSync(path.join("deployments", deploymentDir.name), { withFileTypes: true })
        .filter(
          dirent => dirent.isFile() && dirent.name.match(/\.json$/) && dirent.name !== "dev.json"
        )
        .map(deployment => path.join("deployments", deploymentDir.name, deployment.name))
    )
    .reduce((flattenedArray, array) => flattenedArray.concat(array), []);

  for (const deploymentJson of deployments) {
    const deployment = JSON.parse(
      fs.readFileSync(deploymentJson).toString()
    ) as _LiquityDeploymentJSON;

    if (deployment.version !== version) {
      console.error(`${deploymentJson} has version ${deployment.version}`.red);
      match = false;
    }
  }

  return match;
};

const savedLiveVersion = fs.readFileSync(path.join("live", "version")).toString().trim();

console.log(`Saved live version: ${savedLiveVersion}`.cyan);

if (compareDeployedVersionsTo(savedLiveVersion)) {
  console.log("All deployments match saved version.");
} else {
  console.error(
    (
      "All deployments must have the same version, " +
      "and it must match the saved version in 'packages/lib/live/artifacts'."
    ).red
  );
  process.exitCode = 1;
}
