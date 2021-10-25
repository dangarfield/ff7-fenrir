import { getTestSoundUrl } from '../media/media-sound.js'

const Howler = window.libraries.howler.Howler
const Howl = window.libraries.howler.Howl

const waitUntilMediaCanPlay = async () => {
  return new Promise(async resolve => {
    console.log('waitUntilMediaCanPlay: START')
    console.log(
      'waitUntilMediaCanPlay howler',
      Howler.usingWebAudio,
      Howler.noAudio
    )
    const newAudioCtx = new AudioContext()
    console.log('newAudioCtx', newAudioCtx)
    if (newAudioCtx.state !== 'running') {
      // window.alert('Please click on the screen to enable audio and video')
    }
    const sound = new Howl({
      src: [getTestSoundUrl()],
      volume: 0.1,
      onplayerror: function () {
        console.log('waitUntilMediaCanPlay onplayerror')
        sound.once('unlock', function () {
          console.log('waitUntilMediaCanPlay onplayerror unlock')
          sound.play()
        })
      },
      onplay: function () {
        console.log('waitUntilMediaCanPlay onplay')
        console.log('waitUntilMediaCanPlay: END')
        resolve()
      }
    })
    sound.play()
  })
}

export { waitUntilMediaCanPlay }
