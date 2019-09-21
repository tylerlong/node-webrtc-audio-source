# node-webrtc-audio-source

[node-webrtc](https://github.com/node-webrtc/node-webrtc) started supporting programmatic audio since version [0.3.6](https://github.com/node-webrtc/node-webrtc/releases/tag/v0.3.6). But it doesn't cover how to get audio stream from microphone.

This library gives you a [RTCAudioSource](https://github.com/node-webrtc/node-webrtc/blob/864bc136e8376c2e47ad5b206aa8c8568256a6b3/docs/nonstandard-apis.md#rtcaudiosource) object which streams audio data from microphone.

## Install

```
yarn add node-webrtc-audio-source wrtc
```

## Usage

```js
import { nonstandard } from 'wrtc'
import RTCAudioSource from 'node-webrtc-audio-source'

const { RTCAudioSink } = nonstandard

const rtcAudioSource  = new RTCAudioSource()
const track = rtcAudioSource.createTrack()
const rtcAudioSink = new RTCAudioSink(track)

rtcAudioSink.ondata = data => {
  // Do something with the received audio samples.
}
rtcAudioSource.start()
setTimeout(() => rtcAudioSource.stop(), 10000) // stop after 10 seconds
```


## How does it work?

### macOS

```
rec -q -b 16 -r 48000 -e signed -c 1 -t raw --buffer 1920 -
```

### Windows

```
ffmpeg -f dshow -audio_buffer_size 50 -i audio="My Microphone Device" -ac 1 -ar 48000 -f s16le -acodec pcm_s16le -
```

#### How to get list of devices

```
ffmpeg -list_devices true -f dshow -i dummy
```
