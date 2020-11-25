import { sleep } from '../helpers/helpers.js'
import { setCameraPosition, calculateViewClippingPointFromVector3 } from './field-scene.js'
import { getBankData, setBankData } from '../data/savemap.js'
import {
    TweenType, tweenCameraPosition, getCurrentCameraPosition,
    executeShake, removeFollowMeFromAllModels, scrollToEntity
} from './field-op-codes-camera-media-helper.js'
import { fadeOperation, nfadeOperation, waitForFade } from './field-fader.js'

import { executeAkaoOperation } from '../media/media-module.js'
import { playSound } from '../media/media-sound.js'
import { playMusic, pauseMusic, stopMusic, lockMusic, setBattleMusic, setCurrentFieldMusicFromId, isMusicPlaying } from '../media/media-music.js'
import { setNextMovie, playNextMovie, getCurrentMovieFrame, stopCurrentMovie, activateMovieCam } from '../media/media-movies.js'

const NFADE = async (op) => {
    console.log('NFADE', op)
    const r = op.b1 == 0 ? op.r : getBankData(op.b1, op.r)
    const g = op.b2 == 0 ? op.g : getBankData(op.b2, op.g)
    const b = op.b3 == 0 ? op.b : getBankData(op.b3, op.b)
    await nfadeOperation(op.t, r, g, b, op.s)
    return {}
}
const SHAKE = async (op) => { // TODO: Lots of improvements
    console.log('SHAKE:', op)
    // I've updated lots here: http://wiki.ffrtt.ru/index.php?title=FF7/Field/Script/Opcodes/5E_SHAKE
    executeShake({
        type: op.t,
        x: { amplitude: op.xA, frames: op.xF },
        y: { amplitude: op.yA, frames: op.yF }
    })

    // Note: Tweens from this tween group need to be removed on scene change. field-actions.js -> stopFieldSceneAnimating()
    return {}
}
const SCRLO = async (op) => {
    console.log('SCRLO', op, 'THIS OP CODE IS NOT IN USE')
    return {}
}

const SCRLC = async (op) => { // Scroll to party member?
    // Lots of assumptions here. No docs. Looks like its async and then SCRLW is called before it continues
    // Looks like it has speed, tween type and potentially member party params
    // I'm just assuming that it is going to the playableCharacter position for now
    console.log('SCRLC', op)
    window.currentField.fieldCameraFollowPlayer = false
    removeFollowMeFromAllModels()
    const speed = op.p1 == 0 ? op.p2 : getBankData(op.p1, op.p2)
    let tweenType = TweenType.Instant
    if (op.p4 === 1) {
        tweenType = TweenType.Instant
    } else if (op.p4 === 2) {
        tweenType = TweenType.Linear
    } else if (op.p4 === 3) {
        tweenType = TweenType.Smooth
    }
    let relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
    console.log('SCRLC smooth?', op, getCurrentCameraPosition(), relativeToCamera)
    tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, tweenType, speed)
    return {}
}
const SCRLA = async (op) => { // Scroll to entity // CHAR -> adds model.userData.entityId = entity script array i
    console.log('SCRLA', op)
    window.currentField.fieldCameraFollowPlayer = false
    removeFollowMeFromAllModels()
    const speed = op.b == 0 ? op.s : getBankData(op.b, op.s)
    let tweenType = TweenType.Instant
    if (op.t === 1) {
        tweenType = TweenType.Instant
    } else if (op.t === 2) {
        tweenType = TweenType.Linear
    } else if (op.t === 3) {
        tweenType = TweenType.Smooth
    }

    scrollToEntity(op.e, tweenType, speed) // async
    return {}

}
const SCR2D = async (op) => { // Scroll to position instantly
    console.log('SCR2D', op)
    window.currentField.fieldCameraFollowPlayer = false
    removeFollowMeFromAllModels()
    const targetX = op.b1 == 0 ? op.targetX : getBankData(op.b1, op.targetX)
    const targetY = op.b2 == 0 ? op.targetY : getBankData(op.b2, op.targetY) // In frames

    const to = {
        x: (window.currentField.metaData.assetDimensions.width / 2) - targetX,
        y: (window.currentField.metaData.assetDimensions.height / 2) - targetY
    }
    // await sleep(2000)
    console.log('SCR2D instant', op, getCurrentCameraPosition(), to)
    await tweenCameraPosition(getCurrentCameraPosition(), to, TweenType.Instant, 1)
    return {}
}
const SCRCC = async (op) => { // Scroll to leader
    console.log('SCRCC', op)
    removeFollowMeFromAllModels()
    let relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
    console.log('SCRCC smooth?', op, getCurrentCameraPosition(), relativeToCamera)
    await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, TweenType.Smooth, 30)
    window.currentField.fieldCameraFollowPlayer = true
    return {}
}
const SCR2DC = async (op) => { // Scroll to position with smooth tween
    console.log('SCR2DC', op)
    window.currentField.fieldCameraFollowPlayer = false
    removeFollowMeFromAllModels()
    const targetX = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const targetY = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const speed = op.b3 == 0 ? op.s : getBankData(op.b3, op.s)

    const to = {
        x: (window.currentField.metaData.assetDimensions.width / 2) - targetX,
        y: (window.currentField.metaData.assetDimensions.height / 2) - targetY
    }
    // await sleep(2000)
    console.log('SCR2DC smooth', op, getCurrentCameraPosition(), to)
    tweenCameraPosition(getCurrentCameraPosition(), to, TweenType.Smooth, speed) // Not await mds7plr1 cloud script 5
    return {}
}
const SCRLW = async (op) => { // Wait for scrolling
    console.log('SCRLW', op)
    // Note: I have made all of the scrolls sync execution and haven't been convinced otherwise therefore, this
    // should just work. If I need to make selective scoll op codes sync, then just add a isScrolling 
    while (window.currentField.isScrolling) {
        await sleep(1000 / 60 * 10) // Sleep for 1/6 of a second
    }
    return {}
}
const SCR2DL = async (op) => { // Scroll to position with linear tween
    console.log('SCR2DL', op)
    window.currentField.fieldCameraFollowPlayer = false
    removeFollowMeFromAllModels()
    const targetX = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const targetY = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const speed = op.b3 == 0 ? op.s : getBankData(op.b3, op.s)

    const to = {
        x: (window.currentField.metaData.assetDimensions.width / 2) - targetX,
        y: (window.currentField.metaData.assetDimensions.height / 2) - targetY
    }
    // await sleep(2000)
    console.log('SCR2DL linear', op, getCurrentCameraPosition(), to)
    tweenCameraPosition(getCurrentCameraPosition(), to, TweenType.Linear, speed)
    return {}
}
const FADE = async (op) => {
    console.log('FADE', op)
    const r = op.b1 == 0 ? op.r : getBankData(op.b1, op.r)
    const g = op.b2 == 0 ? op.g : getBankData(op.b2, op.g)
    const b = op.b3 == 0 ? op.b : getBankData(op.b3, op.b)
    // Generally can ignore op.a, as this consistently attribute within a
    // certain search type and implemented below
    await fadeOperation(op.t, r, g, b, op.s)
    return {}
}
const FADEW = async (op) => {
    console.log('FADEW', op)
    await waitForFade()
    return {}
}

const SCRLP = async (op) => {
    console.log('SCRLP', op)
    window.currentField.fieldCameraFollowPlayer = false
    removeFollowMeFromAllModels()
    const speed = op.b == 0 ? op.s : getBankData(op.b, op.s)
    let tweenType = TweenType.Instant
    if (op.t === 1) {
        tweenType = TweenType.Instant
    } else if (op.t === 2) {
        tweenType = TweenType.Linear
    } else if (op.t === 3) {
        tweenType = TweenType.Smooth
    }

    const memberName = window.data.savemap.party.members[op.e]
    console.log('memberName', memberName)
    const entities = window.currentField.models.filter(m => m.userData.characterName === memberName)
    console.log('entities', entities)
    if (entities.length > 0 && memberName !== undefined) {
        const entity = entities[0]
        let relativeToCamera = calculateViewClippingPointFromVector3(entity.scene.position)
        console.log('SCRLP smooth?', op, getCurrentCameraPosition(), relativeToCamera)
        await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, tweenType, speed)
        return {}
    } else {
        console.log('SCRLP no entity or members, centering on screen')
        const centre = {
            x: window.currentField.metaData.assetDimensions.width / 2,
            y: window.currentField.metaData.assetDimensions.height / 2
        }
        await tweenCameraPosition(getCurrentCameraPosition(), centre, tweenType, speed)
        return {}
    }

}

const MUSIC = async (op) => {
    playMusic(op.id)
    return {}
}
const SOUND = async (op) => {
    const pan = (op.d / 64) - 1
    console.log('SOUND', op, pan)
    playSound(op.i, pan)
    return {}
}

const AKAO = async (op) => {
    console.log('AKAO', op)
    executeAkaoOperation(op.akaoOp, op.p1, op.p2, op.p3, op.p4, op.p5)
    return {}
}
const AKAO2 = async (op) => {
    console.log('AKAO2', op)
    executeAkaoOperation(op.akaoOp, op.p1, op.p2, op.p3, op.p4, op.p5)
    return {}
}
const MUSVM = async (op) => {
    console.log('MUSVM', op)
    // No instances of this in fields
    return {}
}
const MULCK = async (op) => {
    console.log('MULCK', op)
    // No instances of this in fields
    lockMusic(op.s === 1)
    return {}
}
const BMUSC = async (op) => {
    console.log('BMUSC', op)
    setBattleMusic(op.id)
    return {}
}
const CHMPH = async (op) => {
    console.log('CHMPH', op)
    // No instances of this in fields
    return {}
}
const CHMST = async (op) => {
    console.log('CHMST', op)//b,a
    const isPlaying = isMusicPlaying()
    setBankData(op.b, op.a, isPlaying)
    await sleep(1000 / 30) // Pause for 1 frame because this is typically in a loop
    return {}
}
const MUSVT = async (op) => {
    console.log('MUSVT', op)
    pauseMusic()
    playMusic(op.id, true)
    return {}
}
const FMUSC = async (op) => {
    console.log('FMUSC', op)
    setCurrentFieldMusicFromId(op.p)
    return {}
}
const CMUSC = async (op) => {
    console.log('CMUSC', op)
    // combination of p2 =24 and p3 > 0 (eg, 30) lead to a fade out of the playing music and a fade in of op.i music
    // i = position of yado (sleep) song, p2, fade out time?, p3 fade in time?
    if (op.p3 > 0) {
        stopMusic(1000 / 30 * op.p2) // Fade out
        await sleep(1000 / 30 * op.p2) // Doesn't appear to cross fade
        playMusic(op.i, false, 1000 / 30 * op.p3) // i = position of yado (sleep) song, p2, fade out time?, p3 fade in time?
    } else {
        stopMusic()
        playMusic(op.i, true)
    }

    return {}
}
// setTimeout(async () => {
//     await MUSIC({ id: 0 })
//     await AKAO({ akaoOp: 32, p1: 64, p2: 2, p3: 0, p4: 0, p5: 0 })
//     await sleep(1000 / 30 * 30 * 3)

//     await SOUND({ i: 1, d: 0 })
//     await CMUSC({ i: 4, p1: 0, p2: 20, p3: 30, p4: 0, p5: 0, p6: 0 })
//     // await CMUSC({ i: 1, p1: 0, p2: 20, p3: 0, p4: 0, p5: 0, p6: 0 })
// }, 9000)


const PMVIE = async (op) => {
    console.log('PMVIE', op)
    setNextMovie(op.m)
    return {}
}
const MOVIE = async (op) => {
    console.log('MOVIE', op)
    if (window.location.href.includes('localhost') && window.currentField.name === 'md1stin') {
        // Disable initial movie for testing purposes
    } else {
        await playNextMovie()
    }

    return {}
}
const BGMOVIE = async (op) => {
    console.log('BGMOVIE', op)
    await stopCurrentMovie() // Temp disabled for testing md1stin
    return {}
}

const MVIEF = async (op) => {
    console.log('MVIEF', op)
    const frame = getCurrentMovieFrame()
    if (window.location.href.includes('localhost') && window.currentField.name === 'md1stin') {
        setBankData(op.b, op.a, 700) // Disable initial movie for testing purposes
    } else {
        setBankData(op.b, op.a, frame) // Execute properly
    }
    console.log('MVIEF frame -', frame, 'set to', op.b, op.a)
    await sleep(1000 / 30) // Pause for 1 frame because this is typically in a loop
    return {}
}
const MVCAM = async (op) => {
    console.log('MVCAM', op)
    await activateMovieCam(op.s === 0)
    return {}
}
export {
    NFADE,
    SHAKE,
    SCRLO,
    SCRLC,
    SCRLA,
    SCR2D,
    SCRCC,
    SCR2DC,
    SCRLW,
    SCR2DL,
    FADE,
    FADEW,
    SCRLP,
    AKAO2,
    MUSIC,
    SOUND,
    AKAO,
    MUSVT,
    MUSVM,
    MULCK,
    BMUSC,
    CHMPH,
    PMVIE,
    MOVIE,
    MVIEF,
    MVCAM,
    FMUSC,
    CMUSC,
    CHMST,

    BGMOVIE
}