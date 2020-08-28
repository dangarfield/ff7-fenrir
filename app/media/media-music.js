import { KUJATA_BASE } from '../data/kernel-fetch-data.js'
import { getConfig } from './media-module.js'
const Howl = window.libraries.howler.Howl

let musics = []
let musicMetadata = {
    currentFieldList: [],
    currentFieldMusic: null,
    currentBattleMusic: null,
    currentWorldMusic: null,
    isMusicLocked: false
}

const loadMusic = (i, name) => {
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
    musicMetadata.currentFieldList[i] = name
}

const getMusicUrl = (name) => {
    return `${KUJATA_BASE}/media/music/${name}.ogg`
}


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
    setCurrentFieldMusic('')
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
            setCurrentFieldMusic(music.name)
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
                console.log('play music', music, getConfig().music)
                music.sound.stereo(getConfig().music.pan)
                music.sound.volume(getConfig().music.volume)
                music.sound.rate(getConfig().music.tempo)
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
                setCurrentFieldMusic(music.name)
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
    // console.log('sounds', sounds)

}
const setMusicVolume = (vol) => {
    vol = Math.min(vol, 1)
    vol = Math.max(vol, 0)
    console.log('setMusicVolume', vol)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    getConfig().music.volume = vol
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
    console.log('setMusicVolumeTransition', getConfig().music, fromVol, vol, time)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    getConfig().music.volume = vol
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            if (fromVol === null) {
                fromVol = music.sound.volume()
            }
            console.log('setMusicVolumeTransition ->', music, getConfig().music, fromVol, music.sound.volume(), vol, time)
            music.sound.fade(fromVol, vol, time)
        }
    }
}
const setMusicPan = (pan) => {
    console.log('setMusicPan', pan)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    getConfig().music.pan = pan
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            music.sound.stereo(pan)
        }
    }
}
const setMusicPanTransition = (fromPan, pan, time) => {
    console.log('setMusicPanTransition', getConfig().music, fromPan, pan, time)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    getConfig().music.pan = pan
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            if (fromPan === null) {
                fromPan = music.sound.stereo()
            }
            console.log('setMusicPanTransition ->', music, getConfig().music, fromPan, music.sound.stereo(), pan, time)
            // music.sound.fadePan(fromPan, pan, time)
            // TODO - Implement fadePan
        }
    }
}
const setMusicTempo = (tempo) => {
    console.log('setMusicTempo', tempo)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    getConfig().music.tempo = tempo
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            music.sound.rate(tempo)
        }
    }
}
const setMusicTempoTransition = (fromTempo, tempo, time) => {
    console.log('setMusicTempoTransition', getConfig().music, fromTempo, tempo, time)
    if (musicMetadata.isMusicLocked) { console.log('music is locked'); return }
    getConfig().music.tempo = tempo
    for (let i = 0; i < musics.length; i++) {
        const music = musics[i]
        if (music.sound.playing()) {
            if (fromTempo === null) {
                fromTempo = music.sound.rate()
            }
            console.log('setMusicTempoTransition ->', music, getConfig().music, fromTempo, music.sound.rate(), tempo, time)
            // music.sound.fadeRate(fromTempo, tempo, time)
            // TODO - Implement fadeRate
        }
    }
}
const setCurrentFieldMusicFromId = (id) => {
    setCurrentFieldMusic(musicMetadata.currentFieldList[id])
}
const setCurrentFieldMusic = (name) => {
    musicMetadata.currentFieldMusic = name
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

const resetCurrentFieldMusicList = () => {
    musicMetadata.currentFieldList = []
}
export {
    loadMusic,
    resetCurrentFieldMusicList,
    setBattleMusic,
    playMusic,
    pauseMusic,
    stopMusic,
    lockMusic,
    setCurrentFieldMusicFromId,
    isMusicPlaying,
    resumeMusic,
    setMusicVolume,
    setMusicVolumeTransition,
    setMusicPan,
    setMusicPanTransition,
    setMusicTempo,
    setMusicTempoTransition
}