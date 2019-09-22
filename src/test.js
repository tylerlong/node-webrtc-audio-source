import { nonstandard } from 'wrtc'
import fs from 'fs'

import RTCAudioSource from './index'

const { RTCAudioSink } = nonstandard

const audioPath = 'audio.raw'
if (fs.existsSync(audioPath)) {
  fs.unlinkSync(audioPath)
}
const audioStream = fs.createWriteStream(audioPath, { flags: 'a' })

const rtcAudioSource = new RTCAudioSource()
const track = rtcAudioSource.createTrack()
const rtcAudioSink = new RTCAudioSink(track)
rtcAudioSink.ondata = data => {
  audioStream.write(Buffer.from(data.samples.buffer))
}
