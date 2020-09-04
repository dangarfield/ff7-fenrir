import * as fieldModels from './field-models.js'
import * as fieldAnimations from './field-animations.js'
import { getPlayableCharacterName } from './field-op-codes-party-helper.js'
import { sleep } from '../helpers/helpers.js'

// General placement and init
const CHAR = async (entityName, op) => {
    console.log('CHAR', entityName, op)
    fieldModels.setModelAsEntity(entityName, op.n)
    // Don't need to explicitly do anything as the window.currentField.models has loaded these already
    return {}
}
const PC = async (entityName, op) => {
    console.log('PC', entityName, op)
    fieldModels.setModelAsPlayableCharacter(entityName, getPlayableCharacterName(op.c))
    return {}
}
const XYZI = async (entityName, op) => {
    console.log('XYZI', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const z = op.b3 == 0 ? op.z : getBankData(op.b3, op.z)
    const triangleId = op.b4 == 0 ? op.i : getBankData(op.b4, op.i)
    fieldModels.placeModel(entityName, x, y, z, triangleId)
    return {}
}
const XYI = async (entityName, op) => {
    console.log('XYI', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const triangleId = op.b3 == 0 ? op.i : getBankData(op.b3, op.i)
    fieldModels.placeModel(entityName, x, y, undefined, triangleId)
    return {}
}
const XYZ = async (entityName, op) => {
    console.log('XYZ', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const z = op.b3 == 0 ? op.z : getBankData(op.b3, op.z)
    fieldModels.placeModel(entityName, x, y, z, undefined)
    return {}
}

const VISI = async (entityName, op) => {
    console.log('VISI', entityName, op)
    fieldModels.setModelVisibility(entityName, op.s === 1)
    return {}
}
const DIR = async (entityName, op) => {
    console.log('DIR', entityName, op)
    const direction = op.b == 0 ? op.d : getBankData(op.b, op.d)
    fieldModels.setModelDirection(entityName, direction)
    return {}
}

// Change entity settings
const MSPED = async (entityName, op) => {
    console.log('MSPED', entityName, op)
    const speed = op.b == 0 ? op.s : getBankData(op.b, op.s)
    fieldModels.setModelMovementSpeed(entityName, speed)
    return {}
}
const ASPED = async (entityName, op) => {
    console.log('ASPED', entityName, op)
    const speed = op.b == 0 ? op.s : getBankData(op.b, op.s)
    fieldModels.setModelAnimationSpeed(entityName, speed)
    return {}
}
const TLKON = async (entityName, op) => {
    console.log('TLKON', entityName, op)
    fieldModels.setModelTalkEnabled(entityName, op.s === 0)
    return {}
}
const TALKR = async (entityName, op) => {
    console.log('TALKR', entityName, op)
    const radius = op.b == 0 ? op.r : getBankData(op.b, op.r)
    fieldModels.setModelTalkRadius(entityName, radius)
    return {}
}
const TLKR2 = async (entityName, op) => { // Kujata has TALKR2, will add both to switch case
    console.log('TLKR2', entityName, op)
    const radius = op.b == 0 ? op.r : getBankData(op.b, op.r)
    fieldModels.setModelTalkRadius(entityName, radius)
    return {}
}
const SOLID = async (entityName, op) => {
    console.log('SOLID', entityName, op)
    fieldModels.setModelCollisionEnabled(entityName, op.s === 0)
    return {}
}
const SLIDR = async (entityName, op) => {
    console.log('SLIDR', entityName, op)
    const radius = op.b == 0 ? op.r : getBankData(op.b, op.r)
    fieldModels.setModelCollisionRadius(entityName, radius)
    return {}
}
const SLDR2 = async (entityName, op) => {
    console.log('SLDR2', entityName, op)
    const radius = op.b == 0 ? op.r : getBankData(op.b, op.r)
    fieldModels.setModelCollisionRadius(entityName, radius)
    return {}
}
const CC = async (entityName, op) => {
    console.log('CC', entityName, op)
    await fieldModels.setModelAsLeader(op.e)
    return {}
}
const UC = async (entityName, op) => {
    console.log('UC', entityName, op)
    const canMove = op.s === 0
    fieldModels.setPlayableCharacterCanMove(canMove)
    return {}
}

// Animations
const ANIME1 = async (entityName, op) => {
    console.log('ANIME1', entityName, op)
    await fieldAnimations.playAnimationOnceSyncReset(entityName, op.a, op.s)
    return {}
}
const CANIM1 = async (entityName, op) => {
    console.log('CANIM1', entityName, op)
    await fieldAnimations.playAnimationPartialOnceSyncReset(entityName, op.a, op.s, op.f, op.l)
    return {}
}
const ANIME2 = async (entityName, op) => {
    console.log('ANIME2', entityName, op)
    await fieldAnimations.playAnimationOnceAsyncReset(entityName, op.a, op.s)
    return {}
}
const CANIM2 = async (entityName, op) => {
    console.log('CANIM2', entityName, op)
    await fieldAnimations.playAnimationPartialOnceAsyncReset(entityName, op.a, op.s, op.f, op.l)
    return {}
}
const ANIM_1 = async (entityName, op) => {
    console.log('ANIM!1', entityName, op)
    await fieldAnimations.playAnimationOnceSyncHoldLastFrame(entityName, op.a, op.s)
    return {}
}
const CANM_1 = async (entityName, op) => {
    console.log('CANM!1', entityName, op)
    await fieldAnimations.playAnimationPartialOnceSyncHoldLastFrame(entityName, op.a, op.s, op.f, op.l)
    return {}
}
const ANIM_2 = async (entityName, op) => {
    console.log('ANIM!2', entityName, op)
    await fieldAnimations.playAnimationOnceAsyncHoldLastFrame(entityName, op.a, op.s)
    return {}
}
const CANM_2 = async (entityName, op) => {
    console.log('CANM!2', entityName, op)
    await fieldAnimations.playAnimationPartialOnceAsyncHoldLastFrame(entityName, op.a, op.s, op.f, op.l)
    return {}
}
const DFANM = async (entityName, op) => {
    console.log('DFANM', entityName, op)
    await fieldAnimations.playAnimationLoopedAsync(entityName, op.a, op.s)
    return {}
}

const ANIMB = async (entityName, op) => {
    console.log('ANIMB', entityName, op)
    fieldAnimations.stopAnimationHoldLastFrame(entityName)
    return {}
}

const ANIMW = async (entityName, op) => {
    console.log('ANIMW', entityName, op)
    await fieldAnimations.waitForAnimationToFinish(entityName)
    return {}
}

const CCANM = async (entityName, op) => {
    console.log('CCANM', entityName, op)
    fieldAnimations.setPlayerMovementAnimationId(op.a, op.i)
    return {}
}
setTimeout(async () => {
    console.log('ANIM: STARTED')
    await VISI('av_m', { s: 1 })
    // await ANIME1('av_m', { a: 3, s: 1 })
    // await ANIME2('av_m', { a: 3, s: 1 })
    // await ANIMW('av_m')
    await CANM_2('av_m', { a: 4, s: 1, f: 10, l: 30 })
    // await sleep(1000)
    // await ANIMB('av_m', {})
    // await ANIMW('av_m', {})
    console.log('ANIM: ENDED')
}, 11000)

export {
    UC,
    TLKON,
    PC,
    CHAR,
    DFANM,
    ANIME1,
    VISI,
    XYZI,
    XYI,
    XYZ,
    ANIMW,
    ANIME2,
    ANIM_1,
    CANIM1,
    CANM_1,
    MSPED,
    DIR,
    ANIM_2,
    CANIM2,
    CANM_2,
    ASPED,
    CC,
    TALKR,
    SLIDR,
    SOLID,
    TLKR2,
    SLDR2,
    CCANM,
    ANIMB
}