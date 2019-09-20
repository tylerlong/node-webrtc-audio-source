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
import rtcAudioSource from 'node-webrtc-audio-source'

const { RTCAudioSink } = nonstandard

const track = rtcAudioSource.createTrack()
const rtcAudioSink = new RTCAudioSink(track)

rtcAudioSink.ondata = data => {
  // Do something with the received audio samples.
}
```
