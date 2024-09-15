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

// TODO - Generify a little
// TODO - Investigate square, triangle and X key presses
// TODO - Validate speed

const TIFA_SLOT_RESULT = { HIT: 'hit', YEAH: 'yeah', MISS: 'miss' }
let slotsDialog
let slotCount = 0
let iconCount = 0

const offsets = {
  dialog: { x: 0, y: 174, h: 56, w: 320 }
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
  const context = canvas.getContext('2d')

  // Set canvas size (adjust based on your texture sizes)
  const textureWidth = textures[0].image.width // Assuming all textures are the same size
  const textureHeight = textures[0].image.height
  canvas.width = textureWidth
  canvas.height = textureHeight * textures.length // Stack the textures vertically

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
  atlasTexture.wrapS = THREE.RepeatWrapping
  atlasTexture.wrapT = THREE.RepeatWrapping
  atlasTexture.repeat.set(1, 1)
  return atlasTexture
}

const addSlotMesh = (textureAtlas, x, y, z, w, h) => {
  const slotGeometry = new THREE.PlaneGeometry(w / 2, h / 2)
  const slotMaterial = new THREE.MeshBasicMaterial({ map: textureAtlas })
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
const openSlotsDialog = async commandContainerGroup => {
  iconCount = window.data.exe.limitData.tifaSlots[0].length
  slotCount = window.data.exe.limitData.tifaSlots.length
  slotsDialog = createDialogBox({
    id: 20,
    name: 'slots-bg',
    w: offsets.dialog.w,
    h: offsets.dialog.h,
    x: offsets.dialog.x,
    y: offsets.dialog.y,
    scene: commandContainerGroup
  })
  slotsDialog.userData.total = slotCount
  slotsDialog.userData.complete = 0
  window.slotsDialog = slotsDialog

  const positions = getSlotPositions(slotsDialog.userData.total)
  console.log('battleUI SLOTS: getSlotPositions', positions)
  const textureList = [
    getImageTexture('slots', 'tifa-miss').texture,
    getImageTexture('slots', 'tifa-hit').texture,
    getImageTexture('slots', 'tifa-yeah').texture
  ]
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
    return slot
  })
  slotsDialog.userData.slots = slots
  window.slots = slots

  const from = { y: 0 }
  slotsDialog.userData.tween = new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
    .to({ y: 1 }, iconCount * 75) //200 seems ok
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
                console.log(
                  'battleUI SLOTS: resolve',
                  slotsDialog.userData.complete
                )
                if (
                  slotsDialog.userData.complete >= slotsDialog.userData.total
                ) {
                  DATA.state = 'returning'
                  const results = calculateSlotResults()
                  promiseToResolve({
                    name: `Slots: ${DATA.slots.type}`,
                    results
                  })
                }
              })
              .start()
            // slot.material.map.offset.y = slot.userData.stopPoint // TODO - A better way to stop this less abruptly
            continue
          }
          slot.material.map.offset.y = from.y
        }
      }
    })

  slotsDialog.userData.tween.start()

  await showDialog(slotsDialog)
}
const stopSlot = () => {
  DATA.state = 'tweening'
  const activeSlots = slotsDialog.userData.slots.filter(s => s.userData.active)
  if (activeSlots.length > 0) {
    const activeSlot = activeSlots[0]
    const step = 1 / iconCount
    const extraStep = step / 2
    const y = activeSlot.material.map.offset.y

    let stopPoint = Math.min(Math.ceil(y / step) * step, 1) + extraStep
    stopPoint = stopPoint > 1 ? stopPoint - 1 : stopPoint

    console.log('battleUI SLOTS: start stopPoint', y, stopPoint, iconCount)
    activeSlot.userData.stopPoint = stopPoint
  }
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
  const results = indexes
    .map(
      (hitIndex, i) =>
        window.data.exe.limitData.tifaSlots[i][
          (iconCount - ((hitIndex + iconOffset) % iconCount)) % iconCount
        ]
    )
    .map(i =>
      i === 0
        ? TIFA_SLOT_RESULT.MISS
        : i === 1
        ? TIFA_SLOT_RESULT.HIT
        : i === 2
        ? TIFA_SLOT_RESULT.YEAH
        : null
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
      DATA.state = 'returning'
      promiseToResolve(null)
      break
    default:
      break
  }
}
export { openSlotsDialog, selectSlots, closeSlotsDialog, handleKeyPressSlots }