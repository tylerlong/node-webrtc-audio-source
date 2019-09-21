import { nonstandard } from 'wrtc'
import { spawn } from 'child_process'

const { RTCAudioSource } = nonstandard

class NodeWebRtcAudioSource extends RTCAudioSource {
  constructor () {
    super()
    this.ps = null
  }

  start () {
    this.stop()
    if (process.platform === 'darwin') {
      this.ps = spawn('rec', ['-q', '-b', 16, '-r', 48000, '-e', 'signed', '-c', 1, '-t', 'raw', '--buffer', 1920, '-'])
    } else if (process.platform === 'win32') {
      this.ps = spawn('sox', ['-q', '-b', 16, '-r', 48000, '-e', 'signed', '-c', 1, '-t', 'waveaudio', '--buffer', 1920, '-d', '-p'])
    } else {
      throw new Error("Doesn't support this operating system")
    }
    this.ps.stdout.on('data', buffer => {
      const uint8Array = new Uint8Array(buffer)
      for (let i = 0; i < uint8Array.length; i += 960) {
        const samples = new Int16Array(uint8Array.slice(i, i + 960).buffer)
        this.onData({
          bitsPerSample: 16,
          sampleRate: 48000,
          channelCount: 1,
          numberOfFrames: samples.length,
          type: 'data',
          samples
        })
      }
    })
  }

  stop () {
    if (this.ps !== null) {
      this.ps.kill('SIGTERM')
      this.ps = null
    }
  }
}

export default NodeWebRtcAudioSource
