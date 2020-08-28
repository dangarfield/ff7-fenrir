import {
    loadSoundMetadata, preloadCommonSounds, loadSound, playSound, resumeSounds, pauseSounds,
    setSoundVolume, setSoundVolumeTransition, setSoundPan, setSoundPanTransition, setSoundTempo,
    setSoundTempoTransition, stopSounds
} from './media-sound.js'
import {
    loadMusic, resetCurrentFieldMusicList, setBattleMusic, playMusic, pauseMusic, stopMusic,
    resumeMusic, setMusicVolume, setMusicVolumeTransition, setMusicPan, setMusicPanTransition,
    setMusicTempo, setMusicTempoTransition
} from './media-music.js'
import { } from './media-movies.js'






/*
Potential bugs / todo:
- Need to implement fadeRate and fadePan in Howler
- Haven't got the loop offset points for music at all yet, need to get from vorbis metadata
- Have only got loop offset points for sounds in byte intervals rather than milliseconds
- Have guessed a basic loop timing
- Have not tested how channel volume / pan etc effects looped objects when going back to the beginning
- Have not fully tested setting channel volumes then playing sounds after
- Tempo also affects pitch, not sure if this is right or not
- Not sure about tempo change scale, 0x00 -> x1, 0xFF -> x3 ? - (state.sound_format.nSamplesPerSec * (tempo + 480)) / 512
- Haven't looked at battle music, pausing and restarting field after battle etc
- Is battle music always in position 1 (0,1,2 etc...) unless set with BMUSC
*/
let config = {} // set on field selection and global init with setDefaultConfig

// Loading & Config
const getConfig = () => {
    return config
}
const setDefaultMediaConfig = () => {
    const channels = ['channel1', 'channel2', 'channel3', 'channel4', 'channel5', 'music']
    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i]
        config[channel] = {
            name: channel,
            volume: 1,
            pan: 0,
            tempo: 1,
            tempoTransition: 1
        }
    }
    resetCurrentFieldMusicList()
    loadSoundMetadata()
}
const preLoadFieldMediaData = async () => {
    console.log('preLoadFieldMediaData: START')
    setDefaultMediaConfig() // Assuming channel pan, volume through AKAO is reset each field transition
    const musicIds = window.currentField.data.script.akao

    for (let i = 0; i < musicIds.length; i++) {
        loadMusic(i, musicIds[i].name)
    }
    preloadCommonSounds()
    setBattleMusic(1) // Is this always position 1 unless overridden by ? 

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

    // console.log('musicIds', musicIds)
    // console.log('musics', musics)
    // console.log('musicMetadata', musicMetadata)
    // console.log('sounds', sounds)

    console.log('preLoadFieldMediaData: END')
}




// Main actions
const executeAkaoOperation = (akaoOp, p1, p2, p3, p4, p5) => {
    console.log('executeAkaoOperation', akaoOp, p1, p2, p3, p4, p5)
    switch (akaoOp) {
        case 16: case 20: // 0x10 0x14 // Not used in fields
            // Play music [param1=Music ID]
            playMusic(p1)
            break
        case 21: // 0x15 // Not used in fields
            // Unknown Serves no significant function
            break
        case 24: case 25: // 0x18 0x19 // Not used in fields
            // Play music and resume from last position [param1=Music ID]
            playMusic(p1)
            break


        case 32: case 36: // 0x20 0x24
            // Play one sound effect [param1=Panning, param2=Effect ID on channel #1]
            playSound(p2, (p1 / 64) - 1, config.channel1)
            break
        case 33: case 37: // 0x21 0x25
            // Play two sound effects [param1=Panning, param2=Effect ID on channel #1, param3=Effect ID on channel #2]
            playSound(p2, (p1 / 64) - 1, config.channel1)
            playSound(p3, (p1 / 64) - 1, config.channel2)
            break
        case 34: case 38: // 0x22 0x26 // Not used in fields
            // Play three sound effects [param1=Panning, param2=Effect ID on channel #1, param3=Effect ID on channel #2, param4=Effect ID on channel #3]
            playSound(p2, (p1 / 64) - 1, config.channel1)
            playSound(p3, (p1 / 64) - 1, config.channel2)
            playSound(p4, (p1 / 64) - 1, config.channel3)
            break
        case 35: case 39: // 0x23 0x27
            // Play four sound effects [param1=Panning, param2=Effect ID on channel #1, param3=Effect ID on channel #2, param4=Effect ID on channel #3, param5=Effect ID on channel #4]
            playSound(p2, (p1 / 64) - 1, config.channel1)
            playSound(p3, (p1 / 64) - 1, config.channel2)
            playSound(p4, (p1 / 64) - 1, config.channel3)
            playSound(p5, (p1 / 64) - 1, config.channel4)
            break
        case 40: // 0x28
            // Play a sound effect on channel #1 [param1=Panning, param2=Effect ID]
            playSound(p2, (p1 / 64) - 1, config.channel1)
            break
        case 41: // 0x29
            // Play a sound effect on channel #2 [param1=Panning, param2=Effect ID]
            playSound(p2, (p1 / 64) - 1, config.channel2)
            break
        case 42: // 0x2A
            // Play a sound effect on channel #3 [param1=Panning, param2=Effect ID]
            playSound(p2, (p1 / 64) - 1, config.channel3)
            break
        case 43: // 0x2B
            // Play a sound effect on channel #4 [param1=Panning, param2=Effect ID]
            playSound(p2, (p1 / 64) - 1, config.channel4)
            break
        case 48: // 0x30 // Not used in fields
            // Play a sound effect on channel #5 with centre panning
            playSound(p1, 0, config.channel5)
            break


        case 152: // 0x98 // Not used in fields
            // Resumes music and sound effects
            resumeMusic()
            resumeSounds()
            break
        case 153: // 0x99 // Not used in fields
            // Pauses music and sound effects
            pauseMusic()
            pauseSounds()
            break
        case 154: // 0x9A // Not used in fields
            // Resumes only the music
            resumeMusic()
            break
        case 155: // 0x9B // Not used in fields
            // Pauses only the music
            pauseMusic()
            break
        case 156: // 0x9C // Not used in fields
            // Resumes only sound effects
            resumeSounds()
            break
        case 157: // 0x9D // Not used in fields
            // Pauses only sound effects
            pauseSounds()
            break

        case 160: // 0xA0
            // Volume control (channel #1) [param1=Volume]
            setSoundVolume(config.channel1, p1 / 127)
            break
        case 161: // 0xA1
            // Volume control (channel #2) [param1=Volume]
            setSoundVolume(config.channel2, p1 / 127)
            break
        case 162: // 0xA2
            // Volume control (channel #3) [param1=Volume]
            setSoundVolume(config.channel3, p1 / 127)
            break
        case 163: // 0xA3
            // Volume control (channel #4) [param1=Volume]
            setSoundVolume(config.channel4, p1 / 127)
            break

        case 164: // 0xA4
            // Volume transition (channel #1) [param1=Transition time, param2=Target volume]
            setSoundVolumeTransition(config.channel1, p2 / 127, p1 / 60 * 1000)
            break
        case 165: // 0xA5
            // Volume transition (channel #1) [param1=Transition time, param2=Target volume]
            setSoundVolumeTransition(config.channel2, p2 / 127, p1 / 60 * 1000)
            break
        case 166: // 0xA6
            // Volume transition (channel #1) [param1=Transition time, param2=Target volume]
            setSoundVolumeTransition(config.channel3, p2 / 127, p1 / 60 * 1000)
            break
        case 167: // 0xA7
            // Volume transition (channel #1) [param1=Transition time, param2=Target volume]
            setSoundVolumeTransition(config.channel4, p2 / 127, p1 / 60 * 1000)
            break


        case 168: // 0xA8
            // Pan control (channel #1) [param1=Panning]
            setSoundPan(config.channel1, (p1 / 64) - 1)
            break
        case 169: // 0xA9 // Not used in fields
            // Pan control (channel #2) [param1=Panning]
            setSoundPan(config.channel2, (p1 / 64) - 1)
            break
        case 170: // 0xAA
            // Pan control (channel #3) [param1=Panning]
            setSoundPan(config.channel3, (p1 / 64) - 1)
            break
        case 171: // 0xAB // Not used in fields
            // Pan control (channel #4) [param1=Panning]
            setSoundPan(config.channel4, (p1 / 64) - 1)
            break
        case 172: // 0xAC
            // Pan transition (channel #1) [param1=Transition time, param2=Target panning]
            setSoundPanTransition(config.channel1, (p2 / 64) - 1, p1 / 60 * 1000)
            break
        case 173: // 0xAD
            // Pan transition (channel #2) [param1=Transition time, param2=Target panning]
            setSoundPanTransition(config.channel2, (p2 / 64) - 1, p1 / 60 * 1000)
            break
        case 174: // 0xAE
            // Pan transition (channel #3) [param1=Transition time, param2=Target panning]
            setSoundPanTransition(config.channel3, (p2 / 64) - 1, p1 / 60 * 1000)
            break
        case 175: // 0xAF // Not used in fields
            // Pan transition (channel #4) [param1=Transition time, param2=Target panning]
            setSoundPanTransition(config.channel4, (p2 / 64) - 1, p1 / 60 * 1000)
            break

        case 176: // 0xB0
            // Tempo control (channel #1) [param1=Tempo]
            setSoundTempo(config.channel1, (p1 / 127) + 1)
            break
        case 177: // 0xB1
            // Tempo control (channel #2) [param1=Tempo]
            setSoundTempo(config.channel2, (p1 / 127) + 1)
            break
        case 178: // 0xB2
            // Tempo control (channel #3) [param1=Tempo]
            setSoundTempo(config.channel3, (p1 / 127) + 1)
            break
        case 179: // 0xB3
            // Tempo control (channel #4) [param1=Tempo]
            setSoundTempo(config.channel4, (p1 / 127) + 1)
            break
        case 180: // 0xB4
            // Tempo transition (channel #1) [param1=Transition time, param2=Target tempo]
            setSoundTempoTransition(config.channel1, (p2 / 127) + 1, p1 / 60 * 1000)
            break
        case 181: // 0xB5
            // Tempo transition (channel #2) [param1=Transition time, param2=Target tempo]
            setSoundTempoTransition(config.channel2, (p2 / 127) + 1, p1 / 60 * 1000)
            break
        case 182: // 0xB6 // Not used in fields
            // Tempo transition (channel #3) [param1=Transition time, param2=Target tempo]
            setSoundTempoTransition(config.channel3, (p2 / 127) + 1, p1 / 60 * 1000)
            break
        case 183: // 0xB7 // Not used in fields
            // Tempo transition (channel #4) [param1=Transition time, param2=Target tempo]
            setSoundTempoTransition(config.channel4, (p2 / 127) + 1, p1 / 60 * 1000)
            break

        case 184: // 0xB8
            // Volume control for channel #1 to #4 [param1=Volume]
            setSoundVolume(config.channel1, p1 / 127)
            setSoundVolume(config.channel2, p1 / 127)
            setSoundVolume(config.channel3, p1 / 127)
            setSoundVolume(config.channel4, p1 / 127)
            break
        case 185: // 0xB9
            // Volume transition for channel #1 to #4 [param1=Transition time, param2=Target volume]
            setSoundVolumeTransition(config.channel1, p2 / 127, p1 / 60 * 1000)
            setSoundVolumeTransition(config.channel2, p2 / 127, p1 / 60 * 1000)
            setSoundVolumeTransition(config.channel3, p2 / 127, p1 / 60 * 1000)
            setSoundVolumeTransition(config.channel4, p2 / 127, p1 / 60 * 1000)
            break
        case 186: // 0xBA // Not used in fields
            // Pan control for channel #1 to #4 [param1=Panning]
            setSoundPan(config.channel1, (p1 / 64) - 1)
            setSoundPan(config.channel1, (p2 / 64) - 1)
            setSoundPan(config.channel1, (p3 / 64) - 1)
            setSoundPan(config.channel1, (p4 / 64) - 1)
            break
        case 187: // 0xBB // Not used in fields
            // Pan transition for channel #1 to #4 [param1=Transition time, param2=Target panning]
            setSoundPanTransition(config.channel1, (p2 / 64) - 1, p1 / 60 * 1000)
            setSoundPanTransition(config.channel2, (p2 / 64) - 1, p1 / 60 * 1000)
            setSoundPanTransition(config.channel3, (p2 / 64) - 1, p1 / 60 * 1000)
            setSoundPanTransition(config.channel4, (p2 / 64) - 1, p1 / 60 * 1000)
            break
        case 188: // 0xBC // Not used in fields
            // Tempo control for channel #1 to #4 [param1=Tempo]
            setSoundTempo(config.channel1, (p1 / 127) + 1)
            setSoundTempo(config.channel2, (p1 / 127) + 1)
            setSoundTempo(config.channel3, (p1 / 127) + 1)
            setSoundTempo(config.channel4, (p1 / 127) + 1)
            break
        case 189: // 0xBD // Not used in fields
            // Tempo transition for channel #1 to #4 [param1=Transition time, param2=Target tempo]
            setSoundTempoTransition(config.channel1, (p2 / 127) + 1, p1 / 60 * 1000)
            setSoundTempoTransition(config.channel2, (p2 / 127) + 1, p1 / 60 * 1000)
            setSoundTempoTransition(config.channel3, (p2 / 127) + 1, p1 / 60 * 1000)
            setSoundTempoTransition(config.channel4, (p2 / 127) + 1, p1 / 60 * 1000)
            break

        case 192: // 0xC0
            // Music volume [param1=Volume]
            setMusicVolume(p1 / 127)
            break
        case 193: // 0xC1
            // Music volume transition [param1=Transition time, param2=Target volume]
            setMusicVolumeTransition(null, p2 / 127, p1 / 60 * 1000)
            break
        case 194: // 0xC2
            // Music From-To volume transition [param1=Transition time, param2=Starting volume, param3=Ending volume]
            setMusicVolumeTransition(p2 / 127, p3 / 127, p1 / 60 * 1000)
            break

        case 200: // 0xC8
            // Music balance [param1=balance]
            setMusicPan((p1 / 64) - 1)
            break
        case 201: // 0xC9
            // Music balance transition [param1=Transition time, param2=Target balance]
            setMusicPanTransition(null, (p2 / 64) - 1, p1 / 60 * 1000)
            break
        case 202: // 0xCA
            // Music From-To balance transition [param1=Transition time, param2=Starting balance, param3=Ending balance]
            setMusicPanTransition((p2 / 64) - 1, (p3 / 64) - 1, p1 / 60 * 1000)
            break

        case 208: // 0xD0 // Not used in fields
            // Music tempo [param1=Tempo]
            setMusicTempo((p1 / 127) + 1)
            break
        case 209: // 0xD1 // Not used in fields
            // Music tempo transition [param1=Transition time, param2=Target tempo]
            setMusicTempoTransition(null, (p2 / 127) + 1, p1 / 60 * 1000)
            break
        case 210: // 0xD2 // Not used in fields
            // Music From-To tempo transition [param1=Transition time, param2=Starting tempo, param3=Ending tempo]
            setMusicTempoTransition((p2 / 127) + 1, (p3 / 127) + 1, p1 / 60 * 1000)
            break

        case 218: // Is in field, but not in op code docs
            // Find out what this is doing
            break
        case 228: // Is in field, but not in op code docs
            // Find out what this is doing
            break

        case 240: // 0xF0
            // Stop music
            stopMusic()
            break
        case 241: // 0xF1 // Not used in fields
            // Stop sound effects (channel #1 to #4)
            stopSounds() // This also includes 5 too, but can't see it used in the game anyway
            break

        default:
            window.alert('Unknown akaoOp', akaoOp)
            break
    }
}

export {
    preLoadFieldMediaData,
    setDefaultMediaConfig,
    executeAkaoOperation,
    getConfig
}