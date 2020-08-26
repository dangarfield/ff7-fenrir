import { KUJATA_BASE } from '../data/kernel-fetch-data.js'
import { sleep } from '../helpers/helpers.js'
const Howl = window.libraries.howler.Howl
const Howler = window.libraries.howler.Howler

let config = {} // set on field selection and global init with setDefaultConfig
let sounds = []
let music = []

const setDefaultMediaConfig = () => {
    const channels = ['channel1', 'channel2', 'channel3', 'channel4', 'channel5', 'music']
    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i]
        config[channel] = {
            volume: 1,
            pan: 0,
            tempo: 1,
            tempoTransition: 1
        }
    }
}
const getSoundUrl = (id) => {
    return `${KUJATA_BASE}/media/sounds/${id}.ogg`
}
const preloadCommonSounds = () => {
    // TODO - Things like menu sounds, door sounds, save collision sound, anything not as a op code
    loadSound(1)
    loadSound(2)
    loadSound(3)
    loadSound(4)
}
const loadSound = (id) => {
    if (sounds.filter(s => s.id === id).length > 0) {
        return
    }
    const soundItem = {
        url: getSoundUrl(id),
        id: id,
    }
    soundItem.sound = new Howl({ src: [soundItem.url] })
    soundItem.sound.once('load', function () {
        // console.log(' - sound loaded', soundItem)
    })
    soundItem.sound.on('end', function () {
        console.log(' - sound ended', soundItem)
    })
    sounds.push(soundItem)
}
const preLoadFieldMediaData = async () => {
    console.log('preLoadFieldMediaData: START')
    setDefaultMediaConfig() // Assuming channel pan, volume through AKAO is reset each field transition
    const musicIds = window.currentField.data.script.akao.filter(m => m.name !== 'none').map((m, i) => {
        return {
            url: `${KUJATA_BASE}/media/music/${m.name}.ogg`,
            id: m.name
        }
    })
    preloadCommonSounds()

    for (let i = 0; i < window.currentField.data.script.entities.length; i++) {
        const entity = window.currentField.data.script.entities[i]
        for (let j = 0; j < entity.scripts.length; j++) {
            const script = entity.scripts[j]
            for (let k = 0; k < script.ops.length; k++) {
                const op = script.ops[k]
                if (op.op === 'AKAO2') {
                    // Not sure what to do here yet...

                } else if (op.op === 'SOUND') {
                    // Not sure to do about sound 0 as there are lots in the scripts but not the files
                    if (op.i !== 0) { loadSound(op.i) }

                } else if (op.op === 'AKAO') { // Just preload all param2-5 for simplicity
                    if (op.p2 !== 0) { loadSound(op.p2) }
                    if (op.p3 !== 0) { loadSound(op.p3) }
                    if (op.p4 !== 0) { loadSound(op.p4) }
                    if (op.p5 !== 0) { loadSound(op.p5) }
                }
            }
        }
    }

    console.log('musicIds', musicIds)
    console.log('sounds', sounds)

    console.log('preLoadFieldMediaData: END')
}

const playSound = (id, pan) => {
    const soundItem = sounds.filter(s => s.id === id)[0]
    console.log('playSound', soundItem)
    soundItem.sound.stereo(pan)
    soundItem.sound.play()
    // TODO - Decode the wav and see if looping is present or not
}

export {
    preLoadFieldMediaData,
    playSound,
    setDefaultMediaConfig
}