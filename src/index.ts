/**
 * Copyright 2021 Mario Finelli
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as https from "https";
import * as io from "@actions/io";
import * as os from "os";
import * as fs from "fs";
import * as tc from "@actions/tool-cache";
import * as path from 'path'

import { extractVersionFromUrl } from "./util";

const URLBASE = "https://github.com/mvdan/sh";

async function getLatestVersionUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(`${URLBASE}/releases/latest`, (res) => {
      const { statusCode } = res;

      if (statusCode !== 302) {
        reject(
          new Error(`Unable to get latest release (status code: ${statusCode}`),
        );
      } else if (String(res.headers["location"]) === "") {
        reject(
          new Error(
            `Unable to get latest release (location: ${res.headers["location"]})`,
          ),
        );
      } else {
        resolve(String(res.headers["location"]));
      }
    });
  });
}

async function run(): Promise<void> {
  let version = core.getInput("shfmt-version");

  try {
    if (version === "latest") {
      let latestUrl = await getLatestVersionUrl();
      version = extractVersionFromUrl(latestUrl);
      core.info("Downloading shfmt version " + version + " from " + latestUrl);
    }

    let url = `${URLBASE}/releases/download/v${version}`;
    let binName = "shfmt";
    let platform;

    if (process.platform === "win32") {
      platform = "windows";
      binName += ".exe";
    } else if (process.platform === "darwin") {
      platform = "darwin";
    } else {
      platform = "linux";
    }

    let artifact = `shfmt_v${version}_${platform}_amd64`;

    if (process.platform === "win32") {
      artifact += ".exe";
    }

    if (process.platform === "win32") {
      core.info("We're doing the thing...");
      const shfmtPath = await tc.downloadTool(`${url}/${artifact}`);
      core.info(`Download path: ${shfmtPath}`)
      core.info(`Basename: ${path.basename(shfmtPath)}`)
      fs.readdirSync(shfmtPath).forEach(file => {
        core.info("file: " + file)
      })
      core.addPath(shfmtPath);
    } else {
      const binPath = `${os.homedir}/bin`;
      await io.mkdirP(binPath);
      const shfmtPath = await tc.downloadTool(`${url}/${artifact}`);
      await io.mv(shfmtPath, `${binPath}/${binName}`);
      exec.exec("chmod", ["+x", `${binPath}/${binName}`]);
      core.addPath(binPath);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("action failed and didn't return an error type!");
    }
  }
}

run();
