import * as fieldModels from './field-models.js'
import * as fieldAnimations from './field-animations.js'
import * as fieldMovement from './field-movement.js'
import { getPlayableCharacterName } from './field-op-codes-party-helper.js'
import { sleep } from '../helpers/helpers.js'
import { getBankData, setBankData } from '../data/savemap.js'
import { kawaiOpShine, kawaiOpTrnsp, kawaiOpBlink, enableBlink, disableBlink, kawaiOpAmbient } from './field-model-graphics-operations.js'

// General placement and init
const CHAR = async (entityId, op) => {
  console.log('CHAR', entityId, op)
  fieldModels.setModelAsEntity(entityId, op.n)
  // Don't need to explicitly do anything as the window.currentField.models has loaded these already
  return {}
}
const PC = async (entityId, op) => {
  console.log('PC', entityId, op)
  fieldModels.setModelAsPlayableCharacter(
    entityId,
    getPlayableCharacterName(op.c)
  )
  return {}
}
const XYZI = async (entityId, op) => {
  console.log('XYZI', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  const z = op.b3 === 0 ? op.z : getBankData(op.b3, op.z)
  const triangleId = op.b4 === 0 ? op.i : getBankData(op.b4, op.i)
  fieldModels.placeModel(entityId, x, y, z, triangleId)
  return {}
}
const XYI = async (entityId, op) => {
  console.log('XYI', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  const triangleId = op.b3 === 0 ? op.i : getBankData(op.b3, op.i)
  fieldModels.placeModel(entityId, x, y, undefined, triangleId)
  return {}
}
const XYZ = async (entityId, op) => {
  console.log('XYZ', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  const z = op.b3 === 0 ? op.z : getBankData(op.b3, op.z)
  fieldModels.placeModel(entityId, x, y, z, undefined)
  return {}
}

const VISI = async (entityId, op) => {
  console.log('VISI', entityId, op)
  fieldModels.setModelVisibility(entityId, op.s === 1)
  return {}
}

// Change entity settings
const MSPED = async (entityId, op) => {
  console.log('MSPED', entityId, op)
  const speed = op.b === 0 ? op.s : getBankData(op.b, op.s)
  fieldModels.setModelMovementSpeed(entityId, speed)
  return {}
}
const ASPED = async (entityId, op) => {
  console.log('ASPED', entityId, op)
  const speed = op.b === 0 ? op.s : getBankData(op.b, op.s)
  fieldModels.setModelAnimationSpeed(entityId, speed)
  return {}
}
const TLKON = async (entityId, op) => {
  console.log('TLKON', entityId, op)
  fieldModels.setModelTalkEnabled(entityId, op.s === 0)
  return {}
}
const TALKR = async (entityId, op) => {
  console.log('TALKR', entityId, op)
  const radius = op.b === 0 ? op.r : getBankData(op.b, op.r)
  fieldModels.setModelTalkRadius(entityId, radius)
  return {}
}
const TLKR2 = async (entityId, op) => {
  // Kujata has TALKR2, will add both to switch case
  console.log('TLKR2', entityId, op)
  const radius = op.b === 0 ? op.r : getBankData(op.b, op.r)
  fieldModels.setModelTalkRadius(entityId, radius)
  return {}
}
const SOLID = async (entityId, op) => {
  console.log('SOLID', entityId, op)
  fieldModels.setModelCollisionEnabled(entityId, op.s === 0)
  return {}
}
const SLIDR = async (entityId, op) => {
  console.log('SLIDR', entityId, op)
  const radius = op.b === 0 ? op.r : getBankData(op.b, op.r)
  fieldModels.setModelCollisionRadius(entityId, radius)
  return {}
}
const SLDR2 = async (entityId, op) => {
  console.log('SLDR2', entityId, op)
  const radius = op.b === 0 ? op.r : getBankData(op.b, op.r)
  fieldModels.setModelCollisionRadius(entityId, radius)
  return {}
}
const CC = async (entityId, op) => {
  console.log('CC', entityId, op)
  fieldModels.setModelAsLeader(op.e)
  return {}
}
const UC = async (entityId, op) => {
  console.log('UC', entityId, op)
  const canMove = op.s === 0
  await sleep(1000 / 30) // Requires slight delaye because this occurs before the player movement has finished
  fieldModels.setPlayableCharacterCanMove(canMove)
  return {}
}

// Animations
const ANIME1 = async (entityId, op) => {
  // Play animation #%1 of the field model and reset to previous state (speed=%2)
  console.log('ANIME1', entityId, op)
  await fieldAnimations.playAnimationOnceSyncReset(entityId, op.a, op.s)
  return {}
}
const ANIME2 = async (entityId, op) => {
  // Play animation #%1 of the field model and reset to previous state (speed=%2)"
  console.log('ANIME2', entityId, op)
  await fieldAnimations.playAnimationOnceAsyncReset(entityId, op.a, op.s)
  return {}
}
const ANIM_1 = async (entityId, op) => {
  // Play animation #%1 of the field model (speed=%2, type=1)
  console.log('ANIM!1', entityId, op)
  await fieldAnimations.playAnimationOnceAsyncHoldLastFrame(
    entityId,
    op.a,
    op.s
  )
  return {}
}
const ANIM_2 = async (entityId, op) => {
  // Play animation #%1 of the field model (speed=%2, type=2)
  console.log('ANIM!2', entityId, op)
  await fieldAnimations.playAnimationOnceSyncHoldLastFrame(entityId, op.a, op.s)
  await sleep((1000 / 30) * 4)
  return {}
}
const CANIM1 = async (entityId, op) => {
  // Play partially the animation #%1 of the field model and reset to initial state (first frame=%2, last frame=%3, speed=%4)
  console.log('CANIM1', entityId, op)
  await fieldAnimations.playAnimationPartialOnceAsyncReset(
    entityId,
    op.a,
    op.s,
    op.f,
    op.l
  )
  return {}
}
const CANIM2 = async (entityId, op) => {
  // Play partially the animation #%1 of the field model and reset to initial state (first frame=%2, last frame=%3, speed=%4)
  console.log('CANIM2', entityId, op)
  await fieldAnimations.playAnimationPartialOnceSyncReset(
    entityId,
    op.a,
    op.s,
    op.f,
    op.l
  )
  return {}
}
const CANM_1 = async (entityId, op) => {
  // Play partially the animation #%1 of the field model (first frame=%2, last frame=%3, speed=%4)
  console.log('CANM!1', entityId, op)
  await fieldAnimations.playAnimationPartialOnceAsyncHoldLastFrame(
    entityId,
    op.a,
    op.s,
    op.f,
    op.l
  )
  return {}
}
const CANM_2 = async (entityId, op) => {
  // Play partially the animation #%1 of the field model (first frame=%2, last frame=%3, speed=%4)
  console.log('CANM!2', entityId, op)
  await fieldAnimations.playAnimationPartialOnceSyncHoldLastFrame(
    entityId,
    op.a,
    op.s,
    op.f,
    op.l
  )
  // Setting a delay here breaks wcrimb_1 wcm1rp, need to look to see why I added this in the first place
  // await sleep(1000 / 30 * 1)
  return {}
}
const DFANM = async (entityId, op) => {
  // Play loop animation #%1 of the field model (speed=%2)
  console.log('DFANM', entityId, op)
  await fieldAnimations.playAnimationLoopedAsync(entityId, op.a, op.s)
  return {}
}

const ANIMB = async (entityId, op) => {
  console.log('ANIMB', entityId, op)
  fieldAnimations.stopAnimationHoldLastFrame(entityId)
  return {}
}

const ANIMW = async (entityId, op) => {
  console.log('ANIMW', entityId, op)
  await fieldAnimations.waitForAnimationToFinish(entityId)
  return {}
}

const CCANM = async (entityId, op) => {
  console.log('CCANM', entityId, op)
  fieldAnimations.setPlayerMovementAnimationId(op.a, op.i)
  return {}
}

// Turn and rotation
const TURNGEN = async (entityId, op) => {
  console.log('TURNGEN', entityId, op)
  const direction = op.b === 0 ? op.r : getBankData(op.b, op.r)
  await fieldModels.turnModelToFaceDirection(
    entityId,
    direction,
    op.d,
    op.s,
    op.t
  )
  return {}
}
const TURN = async (entityId, op) => {
  console.log('TURN', entityId, op)
  const direction = op.b === 0 ? op.r : getBankData(op.b, op.r)
  await fieldModels.turnModelToFaceDirection(
    entityId,
    direction,
    op.d,
    op.s,
    op.t
  )
  return {}
}
const TURA = async (entityId, op) => {
  console.log('TURA', entityId, op)
  await fieldModels.turnModelToFaceEntity(entityId, op.g, op.d, op.s)
  return {}
}
const PTURA = async (entityId, op) => {
  console.log('PTURA', entityId, op)
  await fieldModels.turnModelToFacePartyMember(entityId, op.p, op.a, op.s)
  return {}
}

const DIR = async (entityId, op) => {
  console.log('DIR', entityId, op)
  const direction = op.b === 0 ? op.d : getBankData(op.b, op.d)
  fieldModels.setModelDirection(entityId, direction)
  return {}
}
const DIRA = async (entityId, op) => {
  console.log('DIRA', entityId, op)
  fieldModels.setModelDirectionToFaceEntity(entityId, op.e)
  return {}
}
const PDIRA = async (entityId, op) => {
  console.log('PDIRA', entityId, op)
  fieldModels.setModelDirectionToFaceCharacterOrPartyLeader(entityId, op.c)
  return {}
}
const GETDIR = async (entityId, op) => {
  console.log('GETDIR', entityId, op)
  const direction = fieldModels.getEntityDirection(op.e)
  setBankData(op.b, op.a, direction)
  console.log('GETDIR ->', getBankData(op.b, op.a))
  return {}
}
const PGTDR = async (entityId, op) => {
  console.log('PGTDR', entityId, op)
  const direction = fieldModels.getPartyMemberDirection(op.p)
  setBankData(op.b, op.d, direction)
  console.log('PGTDR ->', getBankData(op.b, op.d))
  return {}
}
const TURNW = async (entityId, op) => {
  console.log('TURNW', entityId, op)
  // Hmm, all TURNs are sync, so this seems irrelevant
  return {}
}
const FCFIX = async (entityId, op) => {
  console.log('FCFIX', entityId, op)
  // I can only seem to find 2 instances of this and they both unlock rotation... so what locks them ?!
  fieldModels.setModelRotationEnabled(entityId, op.s === 0)
  return {}
}

// Movement
const MOVE = async (entityId, op) => {
  console.log('MOVE', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  await fieldMovement.moveEntityWithAnimationAndRotation(entityId, x, y)
  return {}
}
const FMOVE = async (entityId, op) => {
  console.log('FMOVE', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  await fieldMovement.moveEntityWithoutAnimationButWithRotation(entityId, x, y)
  return {}
}
const CMOVE = async (entityId, op) => {
  console.log('CMOVE', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  await fieldMovement.moveEntityWithoutAnimationOrRotation(entityId, x, y)
  return {}
}
const MOVA = async (entityId, op) => {
  console.log('MOVA', entityId, op)
  await fieldMovement.moveEntityToEntityWithAnimationAndRotation(entityId, op.e)
  return {}
}
const PMOVA = async (entityId, op) => {
  console.log('PMOVA', entityId, op)
  await fieldMovement.moveEntityToPartyMemberWithAnimationAndRotation(
    entityId,
    op.p
  )
  return {}
}
const SLIP = async (entityId, op) => {
  console.log('SLIP', entityId, op)
  fieldModels.setLineSlippability(entityId, op.s === 0)
  return {}
}
const OFST = async (entityId, op) => {
  console.log('OFST', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  const z = op.b3 === 0 ? op.z : getBankData(op.b3, op.z)
  const s = op.b4 === 0 ? op.s : getBankData(op.b4, op.s)
  fieldMovement.offsetEntity(entityId, x, y, z, s, op.t) // async
  return {}
}
const OFSTW = async (entityId, op) => {
  console.log('OFSTW', entityId, op)
  await fieldMovement.waitForOffset(entityId)
  return {}
}
const JUMP = async (entityId, op) => {
  console.log('JUMP', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  const triangleId = op.b3 === 0 ? op.i : getBankData(op.b3, op.i)
  const height = op.b4 === 0 ? op.h : getBankData(op.b4, op.h)
  await fieldMovement.moveEntityJump(entityId, x, y, triangleId, height)
  return {}
}
const LADER = async (entityId, op) => {
  console.log('LADER', entityId, op)
  const x = op.b1 === 0 ? op.x : getBankData(op.b1, op.x)
  const y = op.b2 === 0 ? op.y : getBankData(op.b2, op.y)
  const z = op.b3 === 0 ? op.z : getBankData(op.b3, op.z)
  const triangleId = op.b4 === 0 ? op.i : getBankData(op.b4, op.i)
  const keys = op.k
  const animationId = op.a
  const direction = op.d
  const speed = op.s
  await fieldMovement.moveEntityLadder(
    entityId,
    x,
    y,
    z,
    triangleId,
    keys,
    animationId,
    direction,
    speed
  )
  return {}
}

// Position
const GETAI = async (entityId, op) => {
  console.log('GETAI', entityId, op)
  const triangleId = fieldMovement.getEntityPositionTriangle(op.e)
  setBankData(op.b, op.a, triangleId)
  console.log('GETAI triangle ->', triangleId, getBankData(op.b, op.a))
  return {}
}
const GETAXY = async (entityId, op) => {
  console.log('GETAXY', entityId, op)
  const position = fieldMovement.getEntityPositionXY(op.e)
  setBankData(op.bx, op.x, position.x)
  setBankData(op.by, op.y, position.y)
  console.log(
    'GETAXY -> (x,y)',
    getBankData(op.bx, op.x),
    getBankData(op.by, op.y)
  )
  return {}
}
const AXYZI = async (entityId, op) => {
  console.log('AXYZI', entityId, op)
  const position = fieldMovement.getEntityPositionXYZTriangle(op.a)
  setBankData(op.b1, op.x, position.x)
  setBankData(op.b2, op.y, position.y)
  setBankData(op.b3, op.z, position.z)
  setBankData(op.b4, op.i, position.triangleId)
  console.log(
    'AXYZI -> (x,y,z,triangleId)',
    getBankData(op.b1, op.x),
    getBankData(op.b2, op.y),
    getBankData(op.b3, op.z),
    getBankData(op.b4, op.i),
    position
  )
  return {}
}
const PXYZI = async (entityId, op) => {
  console.log('PXYZI', entityId, op)
  const position = fieldMovement.getPartyMemberPositionXYZTriangle(op.p)
  setBankData(op.b1, op.x, position.x)
  setBankData(op.b2, op.y, position.y)
  setBankData(op.b3, op.z, position.z)
  setBankData(op.b4, op.i, position.triangleId)
  console.log(
    'PXYZI -> (x,y,z,triangleId)',
    getBankData(op.b1, op.x),
    getBankData(op.b2, op.y),
    getBankData(op.b3, op.z),
    getBankData(op.b4, op.i)
  )
  return {}
}
const IDLCK = async (entityId, op) => {
  console.log('IDLCK', entityId, op)
  fieldMovement.setTriangleBoundaryMovementAllowed(op.i, op.s === 0)
  return {}
}

// Lines
const LINE = async (entityId, op) => {
  console.log('LINE', entityId, op)
  fieldModels.registerLine(
    entityId,
    { x: op.x1, y: op.y1, z: op.z1 },
    { x: op.x2, y: op.y2, z: op.z2 }
  )
  return {}
}
const LINON = async (entityId, op) => {
  console.log('LINON', entityId, op)
  fieldModels.enableLines(entityId, op.s === 1)
  return {}
}
const SLINE = async (entityId, op) => {
  console.log('SLINE', entityId, op)
  const x1 = op.bx1 === 0 ? op.x1 : getBankData(op.bx1, op.x1)
  const y1 = op.by1 === 0 ? op.y1 : getBankData(op.by1, op.y1)
  const z1 = op.bz1 === 0 ? op.z1 : getBankData(op.bz1, op.z1)
  const x2 = op.bx2 === 0 ? op.x2 : getBankData(op.bx2, op.x2)
  const y2 = op.by2 === 0 ? op.y2 : getBankData(op.by2, op.y2)
  const z2 = op.bz2 === 0 ? op.z2 : getBankData(op.bz2, op.z2)
  fieldModels.setLinePosition(
    entityId,
    { x: x1, y: y1, z: z1 },
    { x: x2, y: y2, z: z2 }
  )
  return {}
}

// Party
const JOIN = async (entityId, op) => {
  console.log('JOIN', entityId, op)
  await fieldMovement.joinLeader(op.s)
  return {}
}
const SPLIT = async (entityId, op) => {
  console.log('SPLIT', entityId, op)
  const x1 = op.bx1 === 0 ? op.x1 : getBankData(op.bx1, op.x1)
  const y1 = op.by1 === 0 ? op.y1 : getBankData(op.by1, op.y1)
  const d1 = op.bd1 === 0 ? op.d1 : getBankData(op.bd1, op.d1)
  const x2 = op.bx2 === 0 ? op.x2 : getBankData(op.bx2, op.x2)
  const y2 = op.by2 === 0 ? op.y2 : getBankData(op.by2, op.y2)
  const d2 = op.bd2 === 0 ? op.d2 : getBankData(op.bd2, op.d2)
  await fieldMovement.splitPartyFromLeader(
    { x: x1, y: y1, direction: d1 },
    { x: x2, y: y2, direction: d2 },
    op.s
  )
  return {}
}
const BLINK = async (entityId, op) => {
  console.log('BLINK', entityId, op)
  if (op.s === 0) {
    enableBlink(entityId)
  } else if (op.s === 1) {
    disableBlink(entityId)
  }
  return {}
}
const KAWAI = async (entityId, op) => {
  console.log('KAWAI', entityId, op, op.s, op.s === 13)

  // TODO - Many more KAWAI sub op codes
  switch (op.s) {
    case 0: kawaiOpBlink(entityId, op); break
    case 1: kawaiOpTrnsp(entityId, op); break
    case 2: kawaiOpAmbient(entityId, op); break
    case 13: kawaiOpShine(entityId, op); break

    default: break
  }
  return {}
}

setTimeout(async () => {
  console.log('ANIM: STARTED')

  // await ANIME1('av_m', { a: 3, s: 1 })

  // await SPLIT(3, {
  //     "bx1": 0,
  //     "by1": 0,
  //     "bd1": 0,
  //     "bx2": 0,
  //     "by2": 0,
  //     "bd2": 0,
  //     "x1": -66,
  //     "y1": -865,
  //     "d1": 0,
  //     "x2": -58,
  //     "y2": -1341,
  //     "d2": 128,
  //     "s": 30,
  // })
  // await LINE(12, { x1: -896, y1: 2166, z1: -274, x2: -512, y2: 2166, z2: -274 })
  // await LINE(13, { x1: -1601, y1: 1440, z1: -273, x2: -1797, y2: 4400, z2: -273 })
  // window.data.savemap.party.members = ['Cloud', 'Barret', 'None']
  // await JOIN(12, { s: 30 })

  // await LINON('evb', { s: 1 })
  // await sleep(2000)
  // await SLINE('evb', {
  //     x1: -910, y1: 1166, z1: -274, x2: -512, y2: 2166, z2: -274,
  //     bx1: 0, by1: 0, bz1: 0, bx2: 0, by2: 0, bz2: 0
  // })
  // await LINE('KDLINE', { x1: 186, y1: -117, z1: -624, x2: 118, y2: -174, z2: -624 })

  // await DIR(1, { b: 0, d: 255 / 4 * 3 })

  // await MOVE(2, { b1: 0, b2: 0, x: 3607, y: 27712 })
  // await MOVE(2, { b1: 0, b2: 0, x: 3836, y: 29295 })
  // await MOVE(2, { b1: 0, b2: 0, x: 3578, y: 29360 })

  // await MSPED('ba', { b: 0, s: 2560 })
  // await MOVE('ba', { b1: 0, b2: 0, x: 1526, y: 1302 })
  // await MOVE('ba', { b1: 0, b2: 0, x: 1126, y: 1872 })
  // await MOVE('ba', { b1: 0, b2: 0, x: 1355, y: 3376 })

  // await OFST('drL', { b1: 0, b2: 0, b3: 0, b4: 0, x: -202, y: 0, z: 0, s: 500, t: 1 })
  // await OFST('drR', { b1: 0, b2: 0, b3: 0, b4: 0, x: 184, y: 0, z: 0, s: 500, t: 1 })
  // console.log('triggered')
  // await OFSTW('drL')
  // await OFSTW('drR')
  // console.log('complete')
  // await VISI('av_m', { s: 1 })
  // await FCFIX('av_m', { e: 1 })
  // await ANIME1('av_m', { a: 3, s: 1 })
  // await sleep(1000 / 30 * 8)
  // await TURNGEN('av_m', { b: 0, r: 232, d: 2, s: 10, t: 1 })
  // await sleep(1000 / 30 * 10)
  // await ANIME1('av_m', { a: 4, s: 1 })
  // await DIR('av_m', { b: 0, d: 104 })
  // await sleep(1000 / 30 * 100)
  // // // Do the rest
  // await MOVE('av_m', { b1: 0, b2: 0, x: 3836, y: 29295 })
  // await MOVE('av_m', { b1: 0, b2: 0, x: 3578, y: 29360 })
  // await MOVA('av_m', { e: 1 })

  // window.data.savemap.party.members = ['Cloud', 'None', 'None']
  // await XYZI('cl', { b1: 0, b2: 0, b3: 0, b4: 0, x: 3655, y: 27432, z: 310, i: 25 })
  // await DIR('cl', { b: 0, d: 128 })
  // await VISI('cl', { s: 1 })

  // await GETDIR('av_m', { e: 1, b: 6, a: 1 })
  // await GETDIR('av_m', { e: 6, b: 6, a: 3 })
  // await PGTDR('av_m', { p: 0, b: 6, d: 5 })

  // // await PMOVA('av_m', { p: 0 })
  // // await PDIRA('av_m', { c: 12 })
  // // await DIRA('av_m', { e: 2 })
  // await PTURA('av_m', { p: 0, a: 2, s: 2 })
  // await sleep(1000)
  // await TURA('av_m', { g: 2, d: 2, s: 2 })

  // await ANIM_2(9, { a: 5, s: 1 })
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
  // console.log('5,18 -> ', window.getBankData(5, 18), '6,9 -> ', window.getBankData(6, 9))
  //     await GETAI('cl', { b: 6, a: 4, e: 1 })
  //     await GETAXY('cl', { bx: 6, x: 1, by: 6, y: 3, e: 1 })
  //     await AXYZI('cl', { b1: 6, x: 5, b2: 6, y: 7, b3: 6, z: 9, b4: 6, i: 11, a: 1 })
  //     await PXYZI('cl', { b1: 6, x: 5, b2: 6, y: 7, b3: 6, z: 9, b4: 6, i: 11, p: 0 })
  // }, 1000);
  // console.log('triangleTarget', getBankData(6, 9))
}, 11000)

export {
  JOIN,
  SPLIT,
  BLINK,
  KAWAI,
  PMOVA,
  SLIP,
  UC,
  PDIRA,
  PTURA,
  IDLCK,
  PGTDR,
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
  TURA,
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
  DIRA,
  GETDIR,
  GETAXY,
  GETAI,
  ANIM_2,
  CANIM2,
  CANM_2,
  ASPED,
  CC,
  JUMP,
  AXYZI,
  LADER,
  OFST,
  OFSTW,
  TALKR,
  SLIDR,
  SOLID,
  LINE,
  LINON,
  SLINE,
  TLKR2,
  SLDR2,
  FCFIX,
  CCANM,
  ANIMB,
  TURNW
}
