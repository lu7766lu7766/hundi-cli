const child_process = require("child_process")
const { Client } = require("ssh2")
const dayjs = require("dayjs")
const SftpClient = require("ssh2-sftp-client")

type iConfig = {
  host: string
  port: number
  username: string
  password: string
}

class Ssh {
  private ssh
  private config: iConfig
  constructor(config: iConfig) {
    this.ssh = new Client()
    this.config = config
  }
  exec(command: string) {
    return new Promise((resolve, reject) => {
      this.ssh.exec(command, (err, stream) => {
        if (err) {
          reject(err)
        }
        console.log(`remote command: ${command}`)
        let res: string
        stream
          .on("close", () => {
            stream.end()
            resolve(res + "")
          })
          .on("data", (data: string) => {
            res = data
          })
          .end(["HEAD / HTTP/1.1", "User-Agent: curl/7.27.0", "Host: 127.0.0.1", "Accept: */*", "Connection: close", "", ""].join("\r\n"))
      })
    })
  }

  run(runFn: () => Promise<void>) {
    this.ssh
      .on("ready", async () => {
        console.log("Client :: ready")
        await runFn()
        this.ssh.end()
      })
      .on("error", (err: any) => {
        if (err.code !== "ECONNRESET") {
          console.log("Client :: error", err)
        }
      })
      .on("end", () => {
        console.log("Client :: end")
      })
      .connect(this.config)
  }
}
class Sftp {
  private sftp
  private config: iConfig
  constructor(config: iConfig) {
    this.sftp = new SftpClient()
    this.config = config
  }

  upload(filePath: string, targetPath: string) {
    return new Promise((resolve, reject) => {
      const start_at = dayjs()
      console.log({
        message: "upload start",
        time: start_at.format("YYYY-MM-DD HH:mm:ss"),
      })
      this.sftp
        .connect(this.config)
        .then(async () => {
          this.sftp.on("upload", (info: string) => {
            console.log(info)
          })
          await this.sftp.put(filePath, targetPath)
          console.log({
            message: "upload finished",
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            use_time: dayjs().diff(start_at, "seconds") + " secs",
          })
          await this.sftp.end()
          resolve(1)
        })
        .catch((err: Error) => reject(`sftp error: ${err}`))
    })
  }

  delete(filePath: string) {
    return new Promise((resolve, reject) => {
      this.sftp
        .connect(this.config)
        .then(async () => {
          await this.sftp.delete(filePath)
          await this.sftp.end()
          resolve(1)
        })
        .catch((err: Error) => reject(`sftp error: ${err}`))
    })
  }
}
export class Connection {
  private _ssh
  private _sftp
  constructor(config: iConfig) {
    this._ssh = new Ssh(config)
    this._sftp = new Sftp(config)
  }

  remote() {
    return {
      run: this._ssh.run.bind(this._ssh),
      exec: this._ssh.exec.bind(this._ssh),
      upload: this._sftp.upload.bind(this._sftp),
      delete: this._sftp.delete.bind(this._sftp),
    }
  }

  local() {
    return {
      exec(command: string) {
        return new Promise((resolve, reject) => {
          child_process.exec(command, (error, stdout, stderr) => {
            if (error) {
              reject(`error: ${error.message}`)
            }
            if (stderr) {
              reject(`stderr: ${stderr}`)
            }
            console.log(`local command: ${command}`)
            resolve(stdout)
          })
        })
      },
    }
  }
}
