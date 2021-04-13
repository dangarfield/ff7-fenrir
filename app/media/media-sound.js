import { KUJATA_BASE } from '../data/kernel-fetch-data.js'
import { getSoundMetadata } from '../data/media-fetch-data.js'
import { getConfig } from './media-module.js'
const Howl = window.libraries.howler.Howl

let soundMetadata
let sounds = []

let COMMON_SOUNDS = {
  OPTION: 1,
  SELECT: 2,
  ERROR: 3,
  BACK: 4,
  TURN: 21,
  BATTLE_SWIRL: 43
}
const preloadCommonSounds = () => {
  // TODO - Things like menu sounds, door sounds, save collision sound, anything not as a op code
  loadSound(COMMON_SOUNDS.OPTION)
  loadSound(COMMON_SOUNDS.SELECT)
  loadSound(COMMON_SOUNDS.ERROR)
  loadSound(COMMON_SOUNDS.BACK)
  loadSound(COMMON_SOUNDS.TURN)
  loadSound(COMMON_SOUNDS.BATTLE_SWIRL)
}
const getSoundUrl = id => {
  return `${KUJATA_BASE}/media/sounds/${id}.ogg`
}
const getTestSoundUrl = () => {
  return getSoundUrl(COMMON_SOUNDS.OPTION)
}
const loadSoundMetadata = async () => {
  if (soundMetadata === undefined) {
    soundMetadata = await getSoundMetadata()
    console.log('soundMetadata', soundMetadata)
  }
}
const loadSound = id => {
  if (sounds.filter(s => s.id === id).length > 0) {
    return
  }
  const mediaItem = {
    url: getSoundUrl(id),
    id: id,
    loop: soundMetadata.filter(s => s.name === id)[0].loop
  }
  let howlParams = { src: [mediaItem.url] }
  if (mediaItem.loop) {
    howlParams.sprite = {}
    howlParams.sprite[`${id}Loop`] = [100, 200]
  }
  mediaItem.sound = new Howl(howlParams)
  mediaItem.sound.once('load', function () {
    console.log(' - sound loaded', mediaItem)
    if (mediaItem.sound._sprite && mediaItem.sound._sprite[`${id}Loop`]) {
      mediaItem.sound._sprite[`${id}Loop`] = [
        // TODO - Extract the correct loop positions from metadata values
        100,
        mediaItem.sound._duration * 1000 - 300
      ]
      console.log(' - loop updated loaded', mediaItem)
    }
  })
  mediaItem.sound.on('end', function () {
    console.log(' - sound ended', mediaItem)
    delete mediaItem.channel
    console.log(' - sound ended cleared list', mediaItem)
  })
  sounds.push(mediaItem)
}
const playCommonSound = sound => {
  playSound(sound, 0, getConfig().channel1)
}
const playSound = (id, pan, channelData) => {
  try {
    if (id === 0) {
      stopSounds()
      return
    }
    if (channelData === undefined) {
      channelData = getConfig().channel1
    }

    const mediaItems = sounds.filter(s => s.id === id)
    if (mediaItems.length === 0) {
      // window.alert('No sound with id', id)
      return
    }
    const mediaItem = mediaItems[0]
    console.log('playSound', mediaItem, mediaItem.loop, pan, channelData)
    mediaItem.sound.stereo(pan) // channel.pan override?!
    mediaItem.sound.volume(channelData.volume)

    if (mediaItem.sound.playing()) {
      console.log('playSound ALREADY PLAYING')
    } else if (mediaItem.loop) {
      mediaItem.sound.loop(true)
      console.log('play loop')
      mediaItem.sound.play(`${id}Loop`)
    } else {
      console.log('play normal')
      mediaItem.sound.rate(channelData.tempo) // TODO - This doesn't work with looped sounds, need to investigate
      mediaItem.sound.play()
    }
    // watch out for multiple invocations

    mediaItem.channel = channelData.name
  } catch (error) {
    console.log('error', error)
  }
}

const pauseSounds = () => {
  console.log('pause sounds')
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.sound.playing()) {
      console.log('pause sound ->', sound)
      sound.sound.pause()
      sound.paused = true
    }
  }
}
const stopSounds = () => {
  console.log('stop sounds')
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.sound.playing()) {
      console.log('stop sound ->', sound)
      sound.sound.stop()
    }
  }
}
const resumeSounds = () => {
  console.log('resume sounds')
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.paused) {
      console.log('resume sound ->', sound)
      sound.sound.play()
      delete sound.paused
    }
  }
}

const setSoundVolume = (channel, vol) => {
  vol = Math.min(vol, 1)
  vol = Math.max(vol, 0)
  console.log('setSoundVolume', channel, vol)
  channel.volume = vol
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.channel === channel.name) {
      sound.sound.volume(vol)
    }
  }
}
const setSoundVolumeTransition = (channel, vol, time) => {
  vol = Math.min(vol, 1)
  vol = Math.max(vol, 0)
  console.log('setSoundVolumeTransition', channel, vol, time)
  channel.volume = vol
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.channel === channel.name) {
      console.log(
        'setSoundVolumeTransition ->',
        sound,
        channel,
        sound.sound.volume(),
        vol,
        time
      )
      sound.sound.fade(sound.sound.volume(), vol, time)
    }
  }
}
const setSoundPan = (channel, pan) => {
  console.log('setSoundVolume', channel, pan)
  channel.pan = pan
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.channel === channel.name) {
      sound.sound.stereo(pan)
    }
  }
}
const setSoundPanTransition = (channel, pan, time) => {
  console.log('setSoundPanTransition', channel, pan, time)
  channel.pan = pan
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.channel === channel.name) {
      console.log(
        'setSoundPanTransition ->',
        sound,
        channel,
        sound.sound.stereo(),
        pan,
        time
      )
      // sound.sound.fadePan(sound.sound.stereo(), pan, time)
      // TODO - Implement fadePan
    }
  }
}
const setSoundTempo = (channel, tempo) => {
  console.log('setSoundTempo', channel, tempo)
  channel.tempo = tempo
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.channel === channel.name) {
      sound.sound.rate(tempo)
    }
  }
}
const setSoundTempoTransition = (channel, tempo, time) => {
  console.log('setSoundTempoTransition', channel, tempo, time)
  channel.tempo = tempo
  for (let i = 0; i < sounds.length; i++) {
    const sound = sounds[i]
    if (sound.channel === channel.name) {
      console.log(
        'setSoundTempoTransition ->',
        sound,
        channel,
        sound.sound.stereo(),
        tempo,
        time
      )
      // sound.sound.fadeRate(sound.sound.stereo(), tempo, time)
      // TODO - Implement fadeRate
    }
  }
}
export {
  loadSoundMetadata,
  preloadCommonSounds,
  loadSound,
  playSound,
  playCommonSound,
  resumeSounds,
  pauseSounds,
  setSoundVolume,
  setSoundVolumeTransition,
  setSoundPan,
  setSoundPanTransition,
  setSoundTempo,
  setSoundTempoTransition,
  stopSounds,
  COMMON_SOUNDS,
  getTestSoundUrl
}
