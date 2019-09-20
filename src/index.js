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
    this.ps = spawn('rec', ['-q', '-b', 16, '-r', 48000, '-e', 'signed', '-c', 1, '-t', 'raw', '--buffer', 960, '-'])
    this.ps.stdout.on('data', buffer => {
      const samples = new Int16Array(new Uint8Array(buffer).buffer)
      this.onData({
        bitsPerSample: 16,
        sampleRate: 48000,
        channelCount: 1,
        numberOfFrames: samples.length,
        type: 'data',
        samples
      })
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
