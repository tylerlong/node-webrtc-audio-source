import { nonstandard } from 'wrtc'
import { spawn } from 'child_process'

const { RTCAudioSource } = nonstandard

class NodeWebRtcAudioSource extends RTCAudioSource {
  constructor () {
    super()
    this.ps = null
    this.cache = Buffer.alloc(0)
    this.stopped = false
  }

  start () {
    this.stopped = false
    if (process.platform === 'darwin') {
      this.ps = spawn('rec', ['-q', '-b', 16, '-r', 48000, '-e', 'signed', '-c', 1, '-t', 'raw', '--buffer', 1920, '-'])
    } else if (process.platform === 'win32') {
      this.ps = spawn('ffmpeg', ['-f', 'dshow', '-audio_buffer_size', 50, '-i', 'audio=MyMic (Realtek Audio)',
        '-ac', 1, '-ar', 48000, '-ab', '16k', '-f', 's16le', '-acodec', 'pcm_s16le', '-'])
    } else {
      throw new Error("Doesn't support this operating system")
    }

    this.ps.stderr.on('data', b => {
      // console.log(b.toString())
    })
    this.ps.stdout.on('data', buffer => {
      // console.log(buffer.length, this.cache.length)
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
      if (!this.stopped) {
        setTimeout(() => processData(), 10)
      }
    }
    processData()
  }

  stop () {
    if (this.ps !== null) {
      this.stopped = true
      this.ps.kill('SIGTERM')
      this.ps = null
    }
  }
}

export default NodeWebRtcAudioSource
