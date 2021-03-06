import { nonstandard } from 'wrtc'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import CommandExists from 'command-exists'

const { RTCAudioSource } = nonstandard

class NodeWebRtcAudioSource extends RTCAudioSource {
  constructor () {
    super()
    this.ps = null
    this.cache = Buffer.alloc(0)
  }

  createTrack () {
    const track = super.createTrack()
    if (this.ps === null) {
      this.start()
    }
    return track
  }

  async start () {
    if (this.ps !== null) {
      this.stop() // stop existing process
    }
    if (process.platform === 'darwin') {
      if (!CommandExists.sync('rec')) {
        throw new Error('Requires sox, please install sox and try again')
      }
      this.ps = spawn('rec', ['-q', '-b', 16, '-r', 48000, '-e', 'signed', '-c', 1, '-t', 'raw', '--buffer', 1920, '-'])
    } else if (process.platform === 'win32') {
      if (!CommandExists.sync('ffmpeg')) {
        throw new Error('Requires ffmpeg, please install ffmpeg and try again')
      }
      const asyncExec = promisify(exec)
      let audioDevice
      try {
        await asyncExec('ffmpeg -list_devices true -f dshow -i dummy')
      } catch (e) {
        const output = e.message
        const match = output.match(/\[dshow @ [0-9a-zA-Z]+?\] DirectShow audio devices[\r\n]+?\[dshow @ [0-9a-zA-Z]+?\] {2}"(.+?)"/)
        audioDevice = match[1]
      }
      this.ps = spawn('ffmpeg', ['-f', 'dshow', '-audio_buffer_size', 50, '-i', `audio=${audioDevice}`,
        '-ac', 1, '-ar', 48000, '-f', 's16le', '-acodec', 'pcm_s16le', '-'])
    } else {
      throw new Error("Doesn't support this operating system")
    }
    this.ps.stdout.on('data', buffer => {
      this.cache = Buffer.concat([this.cache, buffer])
    })
    const processData = () => {
      while (this.cache.length > 960) {
        const buffer = this.cache.slice(0, 960)
        this.cache = this.cache.slice(960)
        const samples = new Int16Array(new Uint8Array(buffer).buffer)
        this.onData({
          bitsPerSample: 16,
          sampleRate: 48000,
          channelCount: 1,
          numberOfFrames: samples.length,
          type: 'data',
          samples
        })
      }
      if (this.ps !== null) {
        setTimeout(() => processData(), 10)
      }
    }
    processData()
  }

  stop () {
    if (this.ps !== null) {
      this.ps.kill('SIGTERM')
      this.ps = null
    }
  }
}

export default NodeWebRtcAudioSource
