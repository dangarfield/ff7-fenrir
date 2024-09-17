import TWEEN from '../../assets/tween.esm.js'
import { KEY } from '../interaction/inputs.js'
import {
  closeDialog,
  createDialogBox,
  getImageTexture,
  removeGroupChildren,
  showDialog
} from '../menu/menu-box-helper.js'
import { DATA } from './battle-menu-command.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

const SLOT_TYPE = {
  TIFA_LIMIT: 'tifa',
  CAIT_SITH: 'caitsith',
  BATTLE_ARENA: 'battlearena'
}

let slotsDialog
let slotCount = 0
let iconCount = 0
let resultList

const offsets = {
  dialog: { x: 0, y: 174, h: 56, w: 320 }
}
const addGradients = () => {
  addGradient(
    offsets.dialog.w / 2,
    offsets.dialog.y + 46 - 1,
    64 * slotCount,
    32,
    0.9,
    0
  )
  addGradient(
    offsets.dialog.w / 2,
    offsets.dialog.y + 10 + 1,
    64 * slotCount,
    32,
    0,
    0.9
  )
}
const addGradient = (x, y, w, h, oT, oB) => {
  const geometry = new THREE.PlaneGeometry(w, h, 1, 1)
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true
  })

  // Set the vertex colors for the top and bottom vertices
  geometry.attributes.color = new THREE.BufferAttribute(
    new Float32Array([
      0x00,
      0x00,
      0x00,
      oB,
      0x00,
      0x00,
      0x00,
      oB,
      0x00,
      0x00,
      0x00,
      oT,
      0x00,
      0x00,
      0x00,
      oT
    ]),
    4
  )

  const gradientMesh = new THREE.Mesh(geometry, material)
  gradientMesh.position.set(x, window.config.sizing.height - y, 86)
  gradientMesh.scale.set(0.5, 0.5, 0.5)
  gradientMesh.material.clippingPlanes =
    slotsDialog.userData.bg.material.clippingPlanes
  gradientMesh.userData.isText = true
  slotsDialog.add(gradientMesh)
  window.gradientMesh = gradientMesh
}
const getSlotPositions = total => {
  const y = offsets.dialog.y + offsets.dialog.h / 2
  const startX = offsets.dialog.w / 2 - (total * 32) / 2 + 16
  return Array.from({ length: total }, (_, i) => i).map(i => {
    return { x: startX + i * 32, y }
  })
}

const createTextureAtlas = textures => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: true })

  // Set canvas size (adjust based on your texture sizes)
  const textureWidth = textures[0].image.width // Assuming all textures are the same size
  const textureHeight = textures[0].image.height
  canvas.width = textureWidth
  canvas.height = textureHeight * textures.length // Stack the textures vertically

  context.clearRect(0, 0, canvas.width, canvas.height)

  // Draw each texture onto the canvas
  textures.forEach((texture, index) => {
    context.drawImage(
      texture.image,
      0,
      index * textureHeight,
      textureWidth,
      textureHeight
    )
  })

  // Create a new texture from the canvas
  const atlasTexture = new THREE.CanvasTexture(canvas)
  atlasTexture.needsUpdate = true
  atlasTexture.premultiplyAlpha = false
  atlasTexture.transparent = true
  atlasTexture.wrapS = THREE.RepeatWrapping
  atlasTexture.wrapT = THREE.RepeatWrapping
  atlasTexture.encoding = THREE.sRGBEncoding
  atlasTexture.repeat.set(1, 1)
  return atlasTexture
}

const addSlotMesh = (textureAtlas, x, y, z, w, h) => {
  const slotGeometry = new THREE.PlaneGeometry(w / 2, h / 2)
  const slotMaterial = new THREE.MeshBasicMaterial({
    map: textureAtlas,
    transparent: true
  })
  const slot = new THREE.Mesh(slotGeometry, slotMaterial)
  slot.position.x = x
  slot.position.y = window.config.sizing.height - y
  slot.position.z = z
  slot.userData.isText = true
  // slot.scale.set(0.5, 0.5, 0.5)
  slot.material.clippingPlanes = slotsDialog.userData.bg.material.clippingPlanes
  slotsDialog.add(slot)
  return slot
}
const getTifaLimitSlotCount = () => {
  const learned =
    window.data.savemap.characters.Tifa.limit.learnedLimitSkills.map(l =>
      parseInt(l.split('_')[1])
    )
  const level = window.data.savemap.characters.Tifa.limit.level
  const slotCount = learned.filter(l => l <= level).length
  console.log(
    'battleUI SLOTS: getTifaLimitSlotCount',
    learned,
    level,
    slotCount
  )
  return slotCount
}
const initCaitSithSlots = async () => {
  // TODO - Cait's slots auto lock based on chance: https://finalfantasy.fandom.com/wiki/Slots_(Final_Fantasy_VII)
  console.log('battleUI SLOTS: initCaitSithSlots')
  iconCount = window.data.exe.limitData.caitSithSlots[0].length
  slotCount = window.data.exe.limitData.caitSithSlots.length
  slotsDialog.userData.total = slotCount
  resultList = window.data.exe.limitData.caitSithSlots
  const positions = getSlotPositions(slotsDialog.userData.total)
  console.log('battleUI SLOTS: getSlotPositions', positions)
  const textureList = {
    CaitSith1: getImageTexture('slots', 'cait-cait1').texture,
    CaitSith2: getImageTexture('slots', 'cait-cait2').texture,
    CaitSith3: getImageTexture('slots', 'cait-cait3').texture,
    Bar: getImageTexture('slots', 'cait-bar').texture,
    Crown: getImageTexture('slots', 'cait-crown').texture,
    Heart: getImageTexture('slots', 'cait-heart').texture,
    Star: getImageTexture('slots', 'cait-star').texture,
    Moogle: getImageTexture('slots', 'cait-moogle').texture
  }
  const slots = Array.from({ length: positions.length }, (_, i) => i).map(i => {
    // console.log('battleUI SLOTS: texture', i)
    const icons = window.data.exe.limitData.caitSithSlots[i].map(ti =>
      ti === 'CaitSith' ? textureList[`${ti}${i + 1}`] : textureList[ti]
    )
    const { x, y } = positions[i]
    const textureAtlas = createTextureAtlas(icons)
    const slot = addSlotMesh(textureAtlas, x, y, 85, 64, 32 * 3 * icons.length)
    console.log('battleUI SLOTS: texture', i, icons, x, y, slot)

    slot.userData.active = true
    slot.userData.slotIndex = i
    return slot
  })
  slotsDialog.userData.slots = slots
  addGradients()
  addSlotTween(slots, 75 * 3)
}
const initTifaSlots = async () => {
  iconCount = window.data.exe.limitData.tifaSlots[0].length
  slotCount = getTifaLimitSlotCount()
  slotsDialog.userData.total = slotCount
  resultList = window.data.exe.limitData.tifaSlots
  const positions = getSlotPositions(slotsDialog.userData.total)
  console.log('battleUI SLOTS: getSlotPositions', positions)
  const textureList = {
    Miss: getImageTexture('slots', 'tifa-miss').texture,
    Hit: getImageTexture('slots', 'tifa-hit').texture,
    Yeah: getImageTexture('slots', 'tifa-yeah').texture
  }
  const slots = Array.from({ length: positions.length }, (_, i) => i).map(i => {
    // console.log('battleUI SLOTS: texture', i)
    const icons = window.data.exe.limitData.tifaSlots[i].map(
      ti => textureList[ti]
    )
    const { x, y } = positions[i]
    const textureAtlas = createTextureAtlas(icons)
    const slot = addSlotMesh(textureAtlas, x, y, 85, 64, 32 * icons.length)
    console.log('battleUI SLOTS: texture', i, icons, x, y, slot)

    slot.userData.active = true
    slot.userData.slotIndex = i
    return slot
  })
  slotsDialog.userData.slots = slots
  window.slots = slots
  addGradients()
  addSlotTween(slots, 75)
}
const addSlotTween = (slots, speed) => {
  const from = { y: 0 }
  slotsDialog.userData.tween = new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
    .to({ y: 1 }, iconCount * speed) // I think that this is a little slower, but I like it
    .repeat(Infinity)
    .onUpdate(() => {
      for (const slot of slots) {
        if (slot.userData.active) {
          if (
            slot.userData.stopPoint !== undefined &&
            slot.material.map.offset.y >= slot.userData.stopPoint
          ) {
            slot.userData.active = false

            const to = {
              y:
                slot.material.map.offset.y - slot.userData.stopPoint < 0.5
                  ? slot.userData.stopPoint
                  : 1 + slot.userData.stopPoint
            }
            const resolveTween = new TWEEN.Tween(
              slot.material.map.offset,
              BATTLE_TWEEN_GROUP
            )
              .to(to, 200)
              .onComplete(() => {
                DATA.state = 'slots'
                BATTLE_TWEEN_GROUP.remove(resolveTween)
                slotsDialog.userData.complete++
              })
              .start()
            continue
          }
          slot.material.map.offset.y = from.y
        }
      }
    })

  slotsDialog.userData.tween.start()
}
const openSlotsDialog = async (commandContainerGroup, slotType) => {
  slotsDialog = createDialogBox({
    id: 20,
    name: 'slots-bg',
    w: offsets.dialog.w,
    h: offsets.dialog.h,
    x: offsets.dialog.x,
    y: offsets.dialog.y,
    scene: commandContainerGroup
  })
  slotsDialog.userData.complete = 0
  slotsDialog.userData.slotType = slotType
  window.slotsDialog = slotsDialog

  if (slotType === SLOT_TYPE.TIFA_LIMIT) {
    await initTifaSlots()
  } else if (slotType === SLOT_TYPE.CAIT_SITH) {
    await initCaitSithSlots()
  }

  await showDialog(slotsDialog)
}
const getStopPointFromY = (y, step, extraStep) => {
  const yNorm = y > 1 ? y - 1 : y
  let stopPoint = Math.min(Math.ceil(yNorm / step) * step, 1) + extraStep
  stopPoint = stopPoint > 1 ? stopPoint - 1 : stopPoint
  return stopPoint
}
const setEvilFlag = prevSlotResult => {
  let time = window.data.savemap.time.secondsPlayed
  let evilFlag = true
  if (prevSlotResult === 'Crown' || prevSlotResult === 'Star') {
    evilFlag = false
  } else if (prevSlotResult === 'Bar' || prevSlotResult === 'Moogle') {
    if (time % 2 === 0) {
      evilFlag = false
    }
  } else if (prevSlotResult === 'Heart') {
    if (time % 4 === 0) {
      evilFlag = false
    }
  } else if (prevSlotResult === 'CaitSith') {
    if (time % 64 === 0) {
      evilFlag = false
    }
  }
  console.log(
    'battleUI SLOTS: setEvilFlag',
    prevSlotResult,
    time,
    '->',
    evilFlag
  )
  return evilFlag
}
const stopSlot = () => {
  DATA.state = 'slots-tweening'
  const activeSlots = slotsDialog.userData.slots.filter(s => s.userData.active)
  if (activeSlots.length > 0) {
    const activeSlot = activeSlots[0]
    const step = 1 / iconCount
    const extraStep = step / 2
    const y = activeSlot.material.map.offset.y

    // let y = 0.602694 // caitsith1
    // if (activeSlot.userData.slotIndex === 1) y = 0.23875 // caitsith2
    // if (activeSlot.userData.slotIndex === 2) y = 0.05 // caitsith3

    let stopPoint = getStopPointFromY(y, step, extraStep)
    const result = calculateSlotResult(activeSlot.userData.slotIndex, stopPoint)
    if (
      activeSlot.userData.slotIndex > 0 &&
      slotsDialog.userData.slotType === SLOT_TYPE.CAIT_SITH
    ) {
      const prevSlotResult = calculateSlotResult(
        activeSlot.userData.slotIndex - 1,
        slotsDialog.userData.slots[activeSlot.userData.slotIndex - 1].userData
          .stopPoint
      )
      const evilFlag = setEvilFlag(prevSlotResult)
      if (evilFlag) {
        // If evil flag is on and it's the second slot, just use the manually selected stop point, eg do nothing

        // If evil flag is on and it's the last slot AND if everything would be lined up to get a line, go an extra step
        if (activeSlot.userData.slotIndex === 2) {
          const firstSlotResult = calculateSlotResult(
            0,
            slotsDialog.userData.slots[0].userData.stopPoint
          )
          const wouldBeCompleteLine =
            firstSlotResult === prevSlotResult && prevSlotResult === result
          console.log(
            'battleUI SLOTS: start stopPoint CAIT SITH evilFlag: ON',
            firstSlotResult,
            prevSlotResult,
            result,
            '->',
            wouldBeCompleteLine
          )
          if (wouldBeCompleteLine) {
            stopPoint = getStopPointFromY(y + step, step, extraStep)
            const evilResult = calculateSlotResult(
              activeSlot.userData.slotIndex,
              stopPoint
            )
            console.log(
              'battleUI SLOTS: start stopPoint CAIT SITH evilFlag: ON cycle to next',
              evilResult
            )
          }
        }
      } else {
        // If evil flag is off, try and get the previous matching slot 4 times
        if (result !== prevSlotResult) {
          for (let i = 0; i < 4; i++) {
            stopPoint = getStopPointFromY(y + step * i, step, extraStep)
            const potentialResult = calculateSlotResult(
              activeSlot.userData.slotIndex,
              stopPoint
            )
            const matchesPreviousSlot = prevSlotResult === potentialResult
            console.log(
              'battleUI SLOTS: evilFlag: OFF try next',
              i,
              stopPoint,
              potentialResult,
              matchesPreviousSlot
            )
            if (matchesPreviousSlot) break
          }
        }
      }
    } else {
      // Normal slots & cait sith first slot
      console.log(
        'battleUI SLOTS: start stopPoint NORMAL',
        y,
        stopPoint,
        '->',
        result
      )
    }
    activeSlot.userData.stopPoint = stopPoint
  }
  if (slotsDialog.userData.complete >= slotsDialog.userData.total) {
    DATA.state = 'slots-returning' // Not sure if we need this
    const results = calculateSlotResults()
    promiseToResolve({
      name: `Slots: ${results.map(r => r.substring(0, 1)).join('')}`,
      results
    })
  }
}
const calculateSlotResult = (slotIndex, stopPoint) => {
  const iconOffset = iconCount / 2 + 1
  const hitIndex = stopPoint * iconCount - 0.5
  return resultList[slotIndex][
    (iconCount - ((hitIndex + iconOffset) % iconCount)) % iconCount
  ]
}
const calculateSlotResults = () => {
  const indexes = slotsDialog.userData.slots.map(
    slot => slot.userData.stopPoint * iconCount - 0.5
  )
  // console.log(
  //   'battleUI SLOTS: calculateSlotResults',
  //   slotsDialog.userData.slots.map(slot => slot.userData.stopPoint * 16 - 0.5)
  // )
  // for (let j = 0; j < 16; j++) {
  //   const r = indexes.map(
  //     (hitIndex, i) =>
  //       window.data.exe.limitData.tifaSlots[i][
  //         (16 - ((hitIndex + j) % 16)) % 16
  //       ]
  //   )
  //   console.log('battleUI SLOTS: r', j, r)
  // }
  const iconOffset = iconCount / 2 + 1 // When happens when iconCount is odd?
  const results = indexes.map(
    (hitIndex, i) =>
      resultList[i][
        (iconCount - ((hitIndex + iconOffset) % iconCount)) % iconCount
      ]
  )
  return results
}

let promiseToResolve
const selectSlots = async () => {
  return new Promise(resolve => {
    console.log('battleUI SLOTS: selectSlots')
    promiseToResolve = resolve
  })
}
const closeSlotsDialog = async () => {
  POINTERS.pointer1.visible = false
  await closeDialog(slotsDialog)
  slotsDialog.userData.tween.stop()
  BATTLE_TWEEN_GROUP.remove(slotsDialog.userData.tween)
  removeGroupChildren(slotsDialog)
  slotsDialog.parent.remove(slotsDialog)
  slotsDialog = undefined
}
const handleKeyPressSlots = async key => {
  switch (key) {
    case KEY.O:
      stopSlot()
      break
    case KEY.X:
      if (slotsDialog.userData.complete > 0) break
      DATA.state = 'slots-returning'
      promiseToResolve(null)
      break
    default:
      break
  }
}
export {
  openSlotsDialog,
  selectSlots,
  closeSlotsDialog,
  handleKeyPressSlots,
  SLOT_TYPE
}
