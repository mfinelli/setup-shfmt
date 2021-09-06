import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as https from 'https'
import * as io from '@actions/io'
import * as os from 'os'
import * as tc from '@actions/tool-cache'

import {extractVersionFromUrl} from './util'

const URLBASE = 'https://github.com/mvdan/sh'

async function getLatestVersionUrl(): Promise<string> {
  core.info('in latest version url')
  return new Promise((resolve, reject) => {
    core.info(`url:${URLBASE}/releases/latest`)
    https.get(`${URLBASE}/releases/latest`, (res) => {
      const { statusCode } = res

      if (statusCode !== 302 ) {
        reject(new Error(`Unable to get latest release (status code: ${statusCode}`))
      } else if (String(res.headers['location']) === '') {
        reject(new Error(`Unable to get latest release (location: ${res.headers['location']})`))
      } else {
        resolve(String(res.headers['location']))
      }
    })
  })
}

async function run(): Promise<void> {
  core.info("in main run")
  let version = core.getInput('shfmt-version')
  core.info("passed version: " + version)

  try {
    if ( version === 'latest') {
      let latestUrl = await getLatestVersionUrl()
      core.info("latest url:" + latestUrl)
      version = extractVersionFromUrl(latestUrl)
      core.info("version:" + version)
    }

    let url = `${URLBASE}/releases/download/v${version}`
    let binName = "shfmt"
    let platform

    if(process.platform === 'win32') {
      platform = 'windows'
      binName += '.exe'
    } else if (process.platform === 'darwin') {
      platform = 'darwin'
    } else {
      platform = 'linux'
    }

    let artifact = `shfmt_v${version}_${platform}_amd64`

    if (process.platform === 'win32') {
      artifact += '.exe'
    }

    core.info("artifact:" + artifact)

    const binPath = `${os.homedir}/bin`
    await io.mkdirP(binPath)
    const shfmtPath = await tc.downloadTool(`${url}/${artifact}`)
    await io.mv(shfmtPath, `${binPath}/${binName}`)
    exec.exec("chmod", ["+x", `${binPath}/${binName}`])
    core.addPath(binPath)
  } catch(error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed("action failed and didn't return an error type!")
    }
  }
}

run()
