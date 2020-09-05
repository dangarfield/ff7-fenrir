import * as fieldModels from './field-models.js'
import * as fieldAnimations from './field-animations.js'
import * as fieldMovement from './field-movement.js'
import { getPlayableCharacterName } from './field-op-codes-party-helper.js'
import { sleep } from '../helpers/helpers.js'
import { getBankData, setBankData } from '../data/savemap.js'

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


// Turn and rotation
const TURNGEN = async (entityName, op) => {
    console.log('TURNGEN', entityName, op)
    const direction = op.b == 0 ? op.r : getBankData(op.b, op.r)
    await fieldModels.turnModel(entityName, direction, op.d, op.s, op.t)
    return {}
}
const TURN = async (entityName, op) => {
    console.log('TURN', entityName, op)
    const direction = op.b == 0 ? op.r : getBankData(op.b, op.r)
    await fieldModels.turnModel(entityName, direction, op.d, op.s, op.t)
    return {}
}
const DIR = async (entityName, op) => {
    console.log('DIR', entityName, op)
    const direction = op.b == 0 ? op.d : getBankData(op.b, op.d)
    fieldModels.setModelDirection(entityName, direction)
    return {}
}

// Movement
const MOVE = async (entityName, op) => {
    console.log('MOVE', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    await fieldMovement.moveEntityWithAnimationAndRotation(entityName, x, y)
    return {}
}
const FMOVE = async (entityName, op) => {
    console.log('FMOVE', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    await fieldMovement.moveEntityWithoutAnimationButWithRotation(entityName, x, y)
    return {}
}
const CMOVE = async (entityName, op) => {
    console.log('CMOVE', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    await fieldMovement.moveEntityWithoutAnimationOrRotation(entityName, x, y)
    return {}
}
const MOVA = async (entityName, op) => {
    console.log('MOVA', entityName, op)
    await fieldMovement.moveEntityToEntityWithAnimationAndRotation(entityName, op.e)
    return {}
}

// Position
const GETAI = async (entityName, op) => {
    console.log('GETAI', entityName, op)
    const triangleId = fieldMovement.getEntityPositionTriangle(op.e)
    setBankData(op.b, op.a, triangleId)
    // console.log('GETAI triangle ->', getBankData(op.b, op.a))
    return {}
}
const GETAXY = async (entityName, op) => {
    console.log('GETAXY', entityName, op)
    const position = fieldMovement.getEntityPositionXY(op.e)
    setBankData(op.bx, op.x, position.x)
    setBankData(op.by, op.y, position.y)
    // console.log('GETAXY -> (x,y)', getBankData(op.bx, op.x), getBankData(op.by, op.y))
    return {}
}
const AXYZI = async (entityName, op) => {
    console.log('AXYZI', entityName, op)
    const position = fieldMovement.getEntityPositionXYZTriangle(op.a)
    setBankData(op.b1, op.x, position.x)
    setBankData(op.b2, op.y, position.y)
    setBankData(op.b3, op.z, position.z)
    setBankData(op.b4, op.i, position.triangleId)
    // console.log('AXYZI -> (x,y,z,triangleId)', getBankData(op.b1, op.x), getBankData(op.b2, op.y), getBankData(op.b3, op.z), getBankData(op.b4, op.i))
    return {}
}
const PXYZI = async (entityName, op) => {
    console.log('PXYZI', entityName, op)
    const position = fieldMovement.getPartyMemberPositionXYZTriangle(op.p)
    setBankData(op.b1, op.x, position.x)
    setBankData(op.b2, op.y, position.y)
    setBankData(op.b3, op.z, position.z)
    setBankData(op.b4, op.i, position.triangleId)
    console.log('PXYZI -> (x,y,z,triangleId)', getBankData(op.b1, op.x), getBankData(op.b2, op.y), getBankData(op.b3, op.z), getBankData(op.b4, op.i))
    return {}
}
const IDLCK = async (entityName, op) => {
    console.log('IDLCK', entityName, op)
    fieldMovement.setTriangleBoundaryMovementAllowed(op.i, op.s === 0)
    return {}
}


setTimeout(async () => {
    console.log('ANIM: STARTED')
    // await VISI('av_m', { s: 1 })
    // // await TURA('av_m', { g: 2, d: 2, s: 2 })
    // await ANIME1('av_m', { a: 3, s: 1 })
    // await sleep(1000 / 30 * 8)
    // await TURNGEN('av_m', { b: 0, r: 232, d: 2, s: 10, t: 1 })
    // await sleep(1000 / 30 * 10)
    // await ANIME1('av_m', { a: 4, s: 1 })
    // await DIR('av_m', { b: 0, d: 104 })
    // await sleep(1000 / 30 * 100)
    // // Do the rest
    // await MOVE('av_m', { b1: 0, b2: 0, x: 3836, y: 29295 })
    // await MOVE('av_m', { b1: 0, b2: 0, x: 3578, y: 29360 })
    // await MOVA('av_m', { e: 1 })


    // await ANIME2('av_m', { a: 3, s: 1 })
    // await ANIMW('av_m')
    // await CANM_2('av_m', { a: 4, s: 1, f: 10, l: 30 })
    // await sleep(1000)
    // await ANIMB('av_m', {})
    // await ANIMW('av_m', {})

    // window.data.savemap.party.members = ['Cloud', 'None', 'None']

    // await XYZI('cl', { b1: 0, b2: 0, b3: 0, b4: 0, x: 3655, y: 27432, z: 310, i: 25 })
    // await DIR('cl', { b: 0, d: 128 })
    // await VISI('cl', { s: 1 })
    // await UC('cl', { s: 0 })
    // await CC('cl', { e: 1 })
    // await IDLCK('cl', { i: 21, s: 1 })
    // console.log('ANIM: ENDED')
    // setInterval(async () => {
    //     await GETAI('cl', { b: 6, a: 4, e: 1 })
    //     await GETAXY('cl', { bx: 6, x: 1, by: 6, y: 3, e: 1 })
    //     await AXYZI('cl', { b1: 6, x: 5, b2: 6, y: 7, b3: 6, z: 9, b4: 6, i: 11, a: 1 })
    //     await PXYZI('cl', { b1: 6, x: 5, b2: 6, y: 7, b3: 6, z: 9, b4: 6, i: 11, p: 0 })
    // }, 1000);
    // console.log('triangleTarget', getBankData(6, 9))
}, 11000)

export {
    UC,
    IDLCK,
    PXYZI,
    TLKON,
    PC,
    CHAR,
    DFANM,
    ANIME1,
    VISI,
    XYZI,
    XYI,
    XYZ,
    MOVE,
    CMOVE,
    MOVA,
    ANIMW,
    FMOVE,
    ANIME2,
    ANIM_1,
    CANIM1,
    CANM_1,
    MSPED,
    DIR,
    TURNGEN,
    TURN,
    GETAXY,
    GETAI,
    ANIM_2,
    CANIM2,
    CANM_2,
    ASPED,
    CC,
    AXYZI,
    TALKR,
    SLIDR,
    SOLID,
    TLKR2,
    SLDR2,
    CCANM,
    ANIMB
}