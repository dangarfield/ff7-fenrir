import { KUJATA_BASE } from '../data/kernel-fetch-data.js'

const Howler = window.libraries.howler.Howler
const Howl = window.libraries.howler.Howl

const waitUntilMediaCanPlay = async () => {
    return new Promise(async (resolve) => {
        console.log('waitUntilMediaCanPlay: START')
        console.log('waitUntilMediaCanPlay howler', Howler.usingWebAudio, Howler.noAudio)
        const newAudioCtx = new AudioContext()
        console.log('newAudioCtx', newAudioCtx)
        if (newAudioCtx.state !== 'running') {
            window.alert('Please click on the screen to enable audio and video')
        }
        var sound = new Howl({
            src: [`${KUJATA_BASE}/media/sounds/${1}.ogg`],
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

export {
    waitUntilMediaCanPlay
}