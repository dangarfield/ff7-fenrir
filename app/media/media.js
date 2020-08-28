import { KUJATA_BASE } from '../data/kernel-fetch-data.js'
import { getSoundMetadata } from '../data/media-fetch-data.js'
import { sleep } from '../helpers/helpers.js'

const Howl = window.libraries.howler.Howl
const Howler = window.libraries.howler.Howler

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
*/
let config = {} // set on field selection and global init with setDefaultConfig
let sounds = []
let musics = []
let soundMetadata
let musicMetadata = {
    currentFieldList: [],
    currentFieldMusic: null,
    currentBattleMusic: null,
    currentWorldMusic: null,
    isMusicLocked: false
}

// Loading & Config
const loadSoundMetadata = async () => {
    soundMetadata = await getSoundMetadata()
    console.log('soundMetadata', soundMetadata)
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
}
const getSoundUrl = (id) => {
    return `${KUJATA_BASE}/media/sounds/${id}.ogg`
}
const getMusicUrl = (name) => {
    return `${KUJATA_BASE}/media/music/${name}.ogg`
}
const preloadCommonSounds = () => {
    // TODO - Things like menu sounds, door sounds, save collision sound, anything not as a op code
    loadSound(1)
    loadSound(2)
    loadSound(3)
    loadSound(4)
    loadSound(5)
    loadSound(6)
}
const loadSound = (id) => {
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

            mediaItem.sound._sprite[`${id}Loop`] = [ // Ideally this would be set by our metadata values
                100,
                (mediaItem.sound._duration * 1000) - 300
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
const loadMusic = (name) => {
    if (musics.filter(s => s.name === name).length > 0 || name === 'none') {
        return
    }
    const mediaItem = {
        url: getMusicUrl(name),
        name: name
    }
    mediaItem.sound = new Howl({ src: [mediaItem.url] })
    mediaItem.sound.loop(true)

    mediaItem.sound.once('load', function () {
        console.log(' - music loaded', mediaItem)
        // There are no fflp flags in the music oggs, it's not looping perfectly...
    })
    mediaItem.sound.on('end', function () {
        console.log(' - music ended', mediaItem)
    })
    musics.push(mediaItem)
}
const preLoadFieldMediaData = async () => {
    console.log('preLoadFieldMediaData: START')
    setDefaultMediaConfig() // Assuming channel pan, volume through AKAO is reset each field transition
    const musicIds = window.currentField.data.script.akao
    musicMetadata.currentFieldList = []

    for (let i = 0; i < musicIds.length; i++) {
        loadMusic(musicIds[i].name)
        musicMetadata.currentFieldList[i] = musicIds[i].name
    }
    preloadCommonSounds()
    setBattleMusic(1)

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
    console.log('musics', musics)
    console.log('musicMetadata', musicMetadata)
    console.log('sounds', sounds)

    console.log('preLoadFieldMediaData: END')
}

// Sounds

const playSound = (id, pan, channelData) => {
    if (id === 0) {
        stopSounds()
        return
    }
    if (channelData === undefined) {
        channelData = config.channel1
    }

    const mediaItems = sounds.filter(s => s.id === id)
    if (mediaItems.length === 0) {
        window.alert('No sound with id', id)
        return
    }
    const mediaItem = mediaItems[0]

    console.log('playSound', mediaItem, mediaItem.loop, pan, channelData)
    mediaItem.sound.stereo(pan) // channel.pan override?!
    mediaItem.sound.volume(channelData.volume)
    mediaItem.sound.rate(channelData.tempo)
    if (mediaItem.loop) {
        mediaItem.sound.loop(true)
        console.log('play loop')
        mediaItem.sound.play(`${id}Loop`)
    } else {
        console.log('play normal')
        mediaItem.sound.play()
    }
    // watch out for multiple invocations
    mediaItem.channel = channelData.name
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
            console.log('setSoundVolumeTransition ->', sound, channel, sound.sound.volume(), vol, time)
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
            console.log('setSoundPanTransition ->', sound, channel, sound.sound.stereo(), pan, time)
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
            console.log('setSoundTempoTransition ->', sound, channel, sound.sound.stereo(), tempo, time)
            // sound.sound.fadeRate(sound.sound.stereo(), tempo, time)
            // TODO - Implement fadeRate
        }
    }
}

// Music
const pauseMusic = () => {
    console.log('pause music')
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            console.log('pause music ->', music)
            music.sound.pause()
            music.paused = true
            break
        }
    }
}
const stopMusic = (fadeOutTime) => {
    console.log('stop music')
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            console.log('stop music ->', music)
            if (fadeOutTime === undefined) {
                music.sound.stop()
            } else {
                music.sound.fade(music.sound.volume(), 0, fadeOutTime)
                setTimeout(() => {
                    music.sound.stop()
                }, fadeOutTime)
            }

        }
    }
    musicMetadata.currentFieldMusic = ''
}
const resumeMusic = () => {
    console.log('resume music')
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.paused) {
            console.log('resume music ->', music, music.sound.volume())
            music.sound.play()
            music.sound.fade(0, music.sound.volume(), 500) // Has a little fade on resume...
            delete music.paused
            musicMetadata.currentFieldMusic = music.name
            break
        }
    }
}
const playMusic = (id, noLoop, fadeInTime) => {
    const name = musicMetadata.currentFieldList[id]
    console.log('playMusic', id, name, noLoop, fadeInTime)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        console.log('music', i, music)
        if (music.name === name) {
            if (!music.sound.playing()) {
                console.log('play music', music, config.music)
                music.sound.stereo(config.music.pan)
                music.sound.volume(config.music.volume)
                music.sound.rate(config.music.tempo)
                music.sound.play()
                if (noLoop) {
                    music.sound.loop(false)
                } else {
                    music.sound.loop(true)
                }
                if (music.paused) {
                    music.sound.fade(0, music.sound.volume(), 500) // Has a little fade on resume...
                    delete music.paused
                }
                if (fadeInTime) {
                    music.sound.fade(0, music.sound.volume(), 1500)
                }
                musicMetadata.currentFieldMusic = music.name
            } else {
                console.log('keep music playing', music)
            }
        } else {
            if (music.sound.playing()) {
                console.log('stop music', music)
                music.sound.stop()
            }
        }
    }

    console.log('musics', musics)
    console.log('musicMetadata', musicMetadata)
    console.log('sounds', sounds)

}
const setMusicVolume = (vol) => {
    vol = Math.min(vol, 1)
    vol = Math.max(vol, 0)
    console.log('setMusicVolume', vol)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    config.music.volume = vol
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            music.sound.volume(vol)
        }
    }
}
const setMusicVolumeTransition = (fromVol, vol, time) => {
    if (fromVol === null) {
        fromVol = Math.min(fromVol, 1)
        fromVol = Math.max(fromVol, 0)
    }
    vol = Math.min(vol, 1)
    vol = Math.max(vol, 0)
    console.log('setMusicVolumeTransition', config.music, fromVol, vol, time)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    config.music.volume = vol
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            if (fromVol === null) {
                fromVol = music.sound.volume()
            }
            console.log('setMusicVolumeTransition ->', music, config.music, fromVol, music.sound.volume(), vol, time)
            music.sound.fade(fromVol, vol, time)
        }
    }
}
const setMusicPan = (pan) => {
    console.log('setMusicPan', pan)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    config.music.pan = pan
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            music.sound.stereo(pan)
        }
    }
}
const setMusicPanTransition = (fromPan, pan, time) => {
    console.log('setMusicPanTransition', config.music, fromPan, pan, time)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    config.music.pan = pan
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            if (fromPan === null) {
                fromPan = music.sound.stereo()
            }
            console.log('setMusicPanTransition ->', music, config.music, fromPan, music.sound.stereo(), pan, time)
            // music.sound.fadePan(fromPan, pan, time)
            // TODO - Implement fadePan
        }
    }
}
const setMusicTempo = (tempo) => {
    console.log('setMusicTempo', tempo)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    config.music.tempo = tempo
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            music.sound.rate(tempo)
        }
    }
}
const setMusicTempoTransition = (fromTempo, tempo, time) => {
    console.log('setMusicTempoTransition', config.music, fromTempo, tempo, time)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    config.music.tempo = tempo
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            if (fromTempo === null) {
                fromTempo = music.sound.rate()
            }
            console.log('setMusicTempoTransition ->', music, config.music, fromTempo, music.sound.rate(), tempo, time)
            // music.sound.fadeRate(fromTempo, tempo, time)
            // TODO - Implement fadeRate
        }
    }
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

const lockMusic = (isMusicLocked) => {
    console.log('lockMusic', isMusicLocked)
    musicMetadata.isMusicLocked = isMusicLocked
}
const setBattleMusic = (id) => {
    console.log('setBattleMusic', id)
    const name = musicMetadata.currentFieldList[id]
    musicMetadata.currentBattleMusic = name
    console.log('musicMetadata', musicMetadata)
}
const isMusicPlaying = () => {
    let isPlaying = 0
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            isPlaying = 1
            break
        }
    }
    console.log('isMusicPlaying', isPlaying)
    return isPlaying
}
export {
    preLoadFieldMediaData,
    setDefaultMediaConfig,
    loadSoundMetadata,
    playSound,
    playMusic,
    pauseMusic,
    stopMusic,
    lockMusic,
    setBattleMusic,
    executeAkaoOperation,
    isMusicPlaying
}