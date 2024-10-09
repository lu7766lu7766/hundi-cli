#!/usr/bin/env node

import { program } from "commander"
import { Connection } from "../lib/connection"
import { tgSendText } from "../lib/telegram"
const path = require("path")

program
  .version("1.0.0")
  .description("HunDi bundle cli")
  .requiredOption("-H --host <type>", "required ssh Host")
  .requiredOption("-U --username <type>", "required ssh UserName")
  .requiredOption("-P --password <type>", "required ssh Password")
  .requiredOption("-p --port <type>", "required ssh Port")
  .requiredOption("-n --project-name <type>", "required project name, etc: 41 or df or 76 or 76dev or 76rc")
  .requiredOption("-f --project-folder <type>", "required project folder, etc: 41c or df or web")
  .requiredOption("-s --server-root <type>", "required server root, etc: www or /var/www/html")
  .option("-u --upload-folder <type>", "required upload folder, etc: download, default .", ".")
  .option("-d --dist-folder <type>", "required dist folder name, etc: dist or df, default: dist", "dist")
  .option("-r --url <type>", "it will unzip to remote if without value, or just send message. etc: https://domain.com")
  .option("-t --tg-key <type>", "Telegram Bot Key")
  .option("-c --tg-chat-id <type>", "Telegram chat id")
  .parse(process.argv)

const options = program.opts()
console.log(options)

const { host, port, username, password, projectName, projectFolder, distFolder, serverRoot, uploadFolder, url, tgKey, tgChatId } = options
const conn = new Connection({
  host,
  port,
  username,
  password,
})

const zipName = `${projectFolder}.zip`
const uploadFilePath = path.join(serverRoot, uploadFolder, zipName).toString()

conn.remote().run(async () => {
  await conn.local().exec(`${distFolder !== distFolder ? `mv ${distFolder} ${projectFolder} &&` : ""}  zip -r ${zipName} ${projectFolder}`)
  await conn.remote().exec(`cd ${serverRoot}/${uploadFolder} && rm -rf ${zipName}`)
  await conn.remote().upload(zipName, uploadFilePath)
  const tgSender = tgSendText(tgKey, tgChatId)
  if (!url) {
    // unzip
    await conn.remote().exec(`cd ${serverRoot} && rm -rf ./${projectFolder}/* && unzip ${uploadFilePath} -d .`)
    tgSender?.(`${projectName} deployed!`)
  } else {
    // prod
    tgSender?.(`${projectName} uploaded!\n${url}/${path.join(uploadFolder, zipName).toString()}`)
  }
})
