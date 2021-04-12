import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { FIELD_TWEEN_GROUP } from './field-scene.js'

import {
  getDialogTextures,
  getKernelTextLargeLetter,
  getPointRight,
  getFieldDialogNumber
} from './field-fetch-data.js'
import {
  getConfigFieldMessageSpeed,
  getConfigWindowColours
} from '../data/savemap-config.js'
import { sleep } from '../helpers/helpers.js'
import { scene } from './field-ortho-scene.js'
import { getActiveInputs } from '../interaction/inputs.js'
import {
  getDialogs,
  getTextParams,
  WINDOW_MODE,
  SPECIAL_MODE
} from './field-dialog.js'
import { getCurrentCountdownClockTime } from '../data/savemap-alias.js'
import { playCommonSound, COMMON_SOUNDS } from '../media/media-sound.js'
import { setPlayableCharacterIsInteracting } from './field-actions.js'
// Note: Most of this needs refactoring, especially to use tweens from game clock rather than sleep

/* TODO:
 DONE - Swap character names to use savemap
 DONE - Implement the ASK op code
 DONE - Implement clock
 DONE - Implement clock interaction
 DONE - Implement numeric special
 DONE - Implement numeric special interaction
 - Implement FLASH and RAINBOW text animation effects
 - Add tweens to use threejs clock rather than sleep
 - Implement {PAUSE} if that is a thing?!
 - There was some sort of scroll mentioned somewhere too if the text didn't fit...
 - Window positions don't look exactly right
 DONE - Loading fade screen goes on top of everything
*/

let isChoiceActive = false

const EDGE_SIZE = 8
const LINE_HEIGHT = 16

let CHARACTER_NAMES = [
  { id: 'CLOUD', name: 'Cloud' },
  { id: 'BARRET', name: 'Barret' },
  { id: 'TIFA', name: 'Tifa' },
  { id: 'AERIS', name: 'Aeris' },
  { id: 'RED XIII', name: 'RedXIII' },
  { id: 'YUFFIE', name: 'Yuffie' },
  { id: 'CAIT SITH', name: 'CaitSith' },
  { id: 'YOUNG CLOUD', name: 'CaitSith' },
  { id: 'VINCENT', name: 'Vincent' },
  { id: 'SEPHIROTH', name: 'Vincent' },
  { id: 'CID', name: 'Cid' }
]
const BUTTON_IMAGES = [
  { text: 'CANCEL', char: '✕' },
  { text: 'SWITCH', char: '☐' },
  { text: 'MENU', char: '△' },
  { text: 'OK', char: '〇' },

  { text: 'PAGEDOWN', char: '┐' }, // l1
  { text: 'END', char: '╗' }, // l2
  { text: 'PAGEUP', char: '┌' }, // r1
  { text: 'HOME', char: '╔' }, // r2

  { text: 'ASSIST', char: '▅' }, // select
  { text: 'START', char: '▶' }
]

const DIALOG_APPEAR_SPEED = 15
const DIALOG_APPEAR_STEP_TOTAL = 6

const createTextureMesh = (w, h, texture) => {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  })
  return new THREE.Mesh(new THREE.PlaneBufferGeometry(w, h), material)
}
const adjustDialogExpandPos = (mesh, step, stepTotal, z) => {
  mesh.position.set(
    mesh.userData.posSmall.x -
      ((mesh.userData.posSmall.x - mesh.userData.posExpand.x) / stepTotal) *
        step,
    mesh.userData.posSmall.y -
      ((mesh.userData.posSmall.y - mesh.userData.posExpand.y) / stepTotal) *
        step,
    z
  )
}
const adjustDialogExpandSize = (mesh, step, stepTotal, bgGeo) => {
  mesh.geometry = new THREE.PlaneBufferGeometry(
    mesh.userData.sizeSmall.w -
      ((mesh.userData.sizeSmall.w - mesh.userData.sizeExpand.w) / stepTotal) *
        step,
    mesh.userData.sizeSmall.h -
      ((mesh.userData.sizeSmall.h - mesh.userData.sizeExpand.h) / stepTotal) *
        step
  )
  bgGeo.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  )
  const windowColours = getConfigWindowColours()
  for (let i = 0; i < windowColours.length; i++) {
    // This is not a smooth blend, but instead changes the vertices of the two triangles
    // This is how they do it in the game
    const color = new THREE.Color(windowColours[i])
    bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
  }
}
const createClippingPlanes = (w, h, z, t, b, l, r) => {
  let bgClipPlanes = []
  const bgClipDatas = [
    {
      w: w + EDGE_SIZE,
      h: 10,
      mesh: t,
      x: 0,
      h: 2,
      rotateX: true,
      flip: false
    },
    {
      w: w + EDGE_SIZE,
      h: 10,
      mesh: b,
      x: 0,
      h: -2,
      rotateX: true,
      flip: true
    },
    {
      w: 10,
      h: h + EDGE_SIZE,
      mesh: l,
      x: -2,
      h: 0,
      rotateX: false,
      flip: false
    },
    { w: 10, h: h + EDGE_SIZE, mesh: r, x: 2, h: 0, rotateX: false, flip: true }
  ]
  for (let i = 0; i < bgClipDatas.length; i++) {
    const bgClipData = bgClipDatas[i]
    const normal = new THREE.Vector3()
    if (bgClipData.rotateX && bgClipData.flip) {
      normal.y = 1
    } else if (bgClipData.rotateX && !bgClipData.flip) {
      normal.y = -1
    } else if (!bgClipData.rotateX && !bgClipData.flip) {
      normal.x = 1
    } else if (!bgClipData.rotateX && bgClipData.flip) {
      normal.x = -1
    }
    const bgClipPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      new THREE.Vector3(
        bgClipData.mesh.position.x + bgClipData.x,
        bgClipData.mesh.position.y + bgClipData.h,
        z
      )
    )
    bgClipPlanes.push(bgClipPlane)
  }
  return bgClipPlanes
}

const createDialogBox = async dialog => {
  const id = dialog.id
  const x = dialog.x
  const y = dialog.y
  const w = dialog.w
  const h = dialog.h
  const z = 100 - id
  const isTransparent = dialog.mode === WINDOW_MODE.TransparentBackground
  const isNoBackgroundBorder = dialog.mode === WINDOW_MODE.NoBackgroundBorder
  console.log('createDialogBox', dialog, isTransparent, isNoBackgroundBorder, z)

  const dialogBox = new THREE.Group()
  const dialogTextures = getDialogTextures()
  const bgGeo = new THREE.PlaneBufferGeometry(
    w - EDGE_SIZE + 3,
    h - EDGE_SIZE + 3
  )
  bgGeo.colorsNeedUpdate = true

  bgGeo.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  )
  const windowColours = getConfigWindowColours()
  for (let i = 0; i < windowColours.length; i++) {
    // This is not a smooth blend, but instead changes the vertices of the two triangles
    // This is how they do it in the game
    const color = new THREE.Color(windowColours[i])
    bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
  }
  // console.log('window.config', window.config)
  const bg = new THREE.Mesh(
    bgGeo,
    new THREE.MeshBasicMaterial({
      transparent: true,
      vertexColors: THREE.VertexColors
    })
  )
  bg.userData.sizeSmall = { w: EDGE_SIZE * 2 - 3, h: EDGE_SIZE * 2 - 3 }
  bg.userData.sizeExpand = { w: w - EDGE_SIZE + 3, h: h - EDGE_SIZE + 3 }
  bg.userData.posSmall = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2,
    z: z
  }
  bg.userData.posExpand = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2,
    z: z
  }
  bg.position.set(bg.userData.posSmall.x, bg.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    bg.material.opacity = 0
    console.log('isNoBackgroundBorder bg', bg)
  }
  if (isTransparent) {
    bg.material.opacity = 0.5
  }
  dialogBox.add(bg)

  const tl = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.tl)
  tl.userData.posSmall = {
    x: x + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - h / 2 + EDGE_SIZE / 2,
    z: z
  }
  tl.userData.posExpand = {
    x: x + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2,
    z: z
  }
  tl.position.set(tl.userData.posSmall.x, tl.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    tl.material.opacity = 0
  }
  dialogBox.add(tl)

  const tr = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.tr)
  tr.userData.posSmall = {
    x: x + w / 2 + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - h / 2 + EDGE_SIZE / 2,
    z: z
  }
  tr.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w - EDGE_SIZE,
    y: window.config.sizing.height - y - EDGE_SIZE / 2,
    z: z
  }
  tr.position.set(tr.userData.posSmall.x, tr.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    tr.material.opacity = 0
  }
  dialogBox.add(tr)

  const bl = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.bl)
  bl.userData.posSmall = {
    x: x + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - h / 2 - EDGE_SIZE / 2,
    z: z
  }
  bl.userData.posExpand = {
    x: x + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h + EDGE_SIZE,
    z: z
  }
  bl.position.set(bl.userData.posSmall.x, bl.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    bl.material.opacity = 0
  }
  dialogBox.add(bl)

  const br = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.br)
  br.userData.posSmall = {
    x: x + w / 2 + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - h / 2 - EDGE_SIZE / 2,
    z
  }
  br.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w - EDGE_SIZE,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h + EDGE_SIZE,
    z: z
  }
  br.position.set(br.userData.posSmall.x, br.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    br.material.opacity = 0
  }
  dialogBox.add(br)

  const l = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.l)
  l.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
  l.userData.sizeExpand = { w: EDGE_SIZE, h: h - EDGE_SIZE * 2 }
  l.userData.posSmall = {
    x: x + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h / 2 + EDGE_SIZE / 2,
    z: z
  }
  l.userData.posExpand = {
    x: x + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h / 2 + EDGE_SIZE / 2,
    z: z
  }
  l.position.set(l.userData.posSmall.x, l.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    l.material.opacity = 0
  }
  dialogBox.add(l)

  const r = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.r)
  r.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
  r.userData.sizeExpand = { w: EDGE_SIZE, h: h - EDGE_SIZE * 2 }
  r.userData.posSmall = {
    x: x + w / 2 + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h / 2 + EDGE_SIZE / 2,
    z
  }
  r.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w - EDGE_SIZE,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h / 2 + EDGE_SIZE / 2,
    z
  }
  r.position.set(r.userData.posSmall.x, r.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    r.material.opacity = 0
  }
  dialogBox.add(r)

  const t = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.t)
  t.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
  t.userData.sizeExpand = { w: w - EDGE_SIZE * 2, h: EDGE_SIZE }
  t.userData.posSmall = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2 + EDGE_SIZE / 2,
    z: z
  }
  t.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2,
    z: z
  }
  t.position.set(t.userData.posSmall.x, t.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    t.material.opacity = 0
  }
  dialogBox.add(t)

  const b = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.b)
  b.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
  b.userData.sizeExpand = { w: w - EDGE_SIZE * 2, h: EDGE_SIZE }
  b.userData.posSmall = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2 - EDGE_SIZE / 2,
    z: z
  }
  b.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h + EDGE_SIZE,
    z: z
  }
  b.position.set(b.userData.posSmall.x, b.userData.posSmall.y, z)
  if (isNoBackgroundBorder) {
    b.material.opacity = 0
  }
  dialogBox.add(b)

  // All this metadata isn't nice, but would like to keep to createWindow and showWindowWithDialog methods
  dialogBox.userData.id = id
  dialogBox.userData.state = 'opening'
  dialogBox.userData.x = x
  dialogBox.userData.y = y
  dialogBox.userData.w = w
  dialogBox.userData.h = h
  dialogBox.userData.z = z
  dialogBox.userData.posAdjustList = [tl, tr, bl, br, l, r, t, b]
  dialogBox.userData.sizeAdjustList = [t, b, l, r]
  dialogBox.userData.bg = bg
  dialogBox.userData.bgGeo = bgGeo

  bg.material.clippingPlanes = createClippingPlanes(w, h, z, t, b, l, r)

  dialog.group = dialogBox
  dialogBox.visible = false
  scene.add(dialogBox)
}

const replaceCharacterNames = text => {
  for (let i = 0; i < CHARACTER_NAMES.length; i++) {
    const characterName = CHARACTER_NAMES[i]
    console.log(
      'replaceCharacterNames',
      characterName,
      window.data.savemap.characters
    )
    text = text.replace(
      new RegExp(`{${characterName.id}}`, 'gi'),
      window.data.savemap.characters[characterName.name].name
    )
  }
  return text
}
const escapeRegex = value => {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
}

const replaceButtonImages = text => {
  for (let i = 0; i < BUTTON_IMAGES.length; i++) {
    const buttonImage = BUTTON_IMAGES[i]
    text = text.replace(
      new RegExp(escapeRegex(`[${buttonImage.text}]`), 'g'),
      `${buttonImage.char}`
    )
  }
  return text
}
const replaceVariables = (text, id) => {
  let params = getTextParams()[id]
  if (params !== undefined) {
    console.log('replaceVariables', text, params)
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      // param[0] replaces first instance of {MEM1}, param[1] replaces the second instance etc
      text = text.replace('<fe>{MEM1}', param)
    }
  }
  return text
}

const createClockBackgroundMesh = (w, h) => {
  const bgMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true
  })
  return new THREE.Mesh(new THREE.PlaneBufferGeometry(w, h), bgMaterial)
}

const updateCountdownDisplays = () => {
  const dialogs = getDialogs()
  for (let i = 0; i < dialogs.length; i++) {
    if (
      dialogs[i] !== null &&
      dialogs[i] !== undefined &&
      dialogs[i].group !== null &&
      dialogs[i].group !== undefined
    ) {
      const dialog = dialogs[i]
      if (dialog.special === SPECIAL_MODE.Clock) {
        updateCountdownDisplay(dialog)
        break
      }
    }
  }
}
const updateCountdownDisplay = async dialog => {
  if (
    dialog.special === SPECIAL_MODE.Clock &&
    dialog.group !== null &&
    dialog.group !== undefined
  ) {
    console.log('updateCountdownDisplay', dialog)

    // Remove existing meshes
    for (let i = 0; i < dialog.group.children.length; i++) {
      const mesh = dialog.group.children[i]
      if (mesh.userData.special === 'clock') {
        dialog.group.remove(mesh)
        // console.log('remove clock', mesh)
      }
    }
    // Ensure correct number padding & times
    const clockTime = getCurrentCountdownClockTime()
    const m = `${clockTime.h * 60 + clockTime.m}`.padStart(2, '0')
    const s = `${clockTime.s}`.padStart(2, '0')
    const timeArray = `${m}:${s}`.split('')
    // console.log('clockTime', clockTime, timeArray)

    // Display clock
    let xCumulative = dialog.x + 0 + dialog.specialData.x
    for (let i = 0; i < timeArray.length; i++) {
      let value = timeArray[i]
      if (value === ':') {
        if (clockTime.s % 2 == 0) {
          value = 'colon on'
        } else {
          value = 'colon off'
        }
      }

      const clockAsset = getFieldDialogNumber(value)
      // console.log('clockAsset', clockAsset)
      const clockMesh = createTextureMesh(
        clockAsset.w,
        clockAsset.h,
        clockAsset.texture
      )
      const clockBgMesh = createClockBackgroundMesh(clockAsset.w, clockAsset.h)
      // console.log('clockMesh', clockMesh)

      const x = xCumulative + clockAsset.w / 2
      xCumulative += clockAsset.w
      const y =
        window.config.sizing.height - dialog.y - 10.5 - dialog.specialData.y

      console.log('updateCountdownDisplay pos', x, y)

      clockBgMesh.position.set(x, y, 100 - dialog.id + 0)
      clockBgMesh.userData.special = 'clock'
      dialog.group.add(clockBgMesh)

      clockMesh.position.set(x, y, 100 - dialog.id + 0.01)
      clockMesh.userData.special = 'clock'
      dialog.group.add(clockMesh)
    }
  }
}
const updateSpecialNumber = async dialog => {
  if (
    dialog.special === SPECIAL_MODE.Numeric &&
    dialog.group !== null &&
    dialog.group !== undefined
  ) {
    console.log('updateSpecialNumber', dialog)

    // Remove existing meshes
    for (let i = 0; i < dialog.group.children.length; i++) {
      const mesh = dialog.group.children[i]
      if (mesh.userData.special === 'numeric') {
        dialog.group.remove(mesh)
        // console.log('remove numeric', mesh)
      }
    }

    // Ensure correct number padding
    const numbers = `${dialog.specialData.number}`.split('')
    for (let i = 0; i < dialog.specialData.noDigitsToDisplay; i++) {
      numbers.unshift('0')
    }
    while (numbers.length > dialog.specialData.noDigitsToDisplay) {
      numbers.shift()
    }

    // Assumptions, noDigits is taken from right to left, high is right, low is left
    console.log('numbers', numbers)
    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i]
      const clockAsset = getFieldDialogNumber(number)
      console.log('clockAsset', clockAsset)
      const numberMesh = createTextureMesh(
        clockAsset.w,
        clockAsset.h,
        clockAsset.texture
      )
      const numberBgMesh = createClockBackgroundMesh(clockAsset.w, clockAsset.h)

      const x = dialog.x + 11 + dialog.specialData.x + i * clockAsset.w
      const y =
        window.config.sizing.height - dialog.y - 14 - dialog.specialData.y

      numberBgMesh.position.set(x, y, 1)
      numberBgMesh.userData.special = 'numeric'
      dialog.group.add(numberBgMesh)

      numberMesh.position.set(x, y, 1.001)
      numberMesh.userData.special = 'numeric'
      dialog.group.add(numberMesh)
    }
  }
}
const scrollOverflow = async dialogBox => {
  return new Promise(async resolve => {
    // console.log('msg scrollOverflow', dialogBox)
    const from = { y: 0 }
    const to = { y: 16 }
    const time = 200
    for (let i = 0; i < dialogBox.children.length; i++) {
      const letter = dialogBox.children[i]
      if (letter.userData.isText) {
        letter.userData.overflowInitPosition = letter.position.y
      }
    }
    new TWEEN.Tween(from, FIELD_TWEEN_GROUP)
      .to(to, time)
      .onUpdate(function () {
        // console.log('msg scrollOverflow: UPDATE', from)
        for (let i = 0; i < dialogBox.children.length; i++) {
          const letter = dialogBox.children[i]
          if (letter.userData.isText) {
            letter.position.y = letter.userData.overflowInitPosition + from.y
          }
        }
      })
      .onComplete(function () {
        // console.log('msg scrollOverflow: END', from)
        dialogBox.userData.overflowCurrent++
        if (
          dialogBox.userData.overflow &&
          dialogBox.userData.overflowCurrent == dialogBox.userData.overflowTotal
        ) {
          dialogBox.userData.state = 'done'
        }
        resolve()
      })
      .start()

    // TODO - This isn't perfect, really the text lines should be appear letter by letter again
    // You can also see some artifacts from below line letters, which shouldn't be rendered
    // I really need to refactor this all, as there is a lot more going on than first worked
  })
}
const showDialogPageText = async (dialogBox, showChoicePointers) => {
  dialogBox.userData.state = 'writing-text'

  console.log('showDialogPageText', dialogBox, showChoicePointers)

  // Remove any existing text from previous pages
  for (let i = 0; i < dialogBox.children.length; i++) {
    if (dialogBox.children[i].userData.isText) {
      dialogBox.children[i].visible = false
    }
  }

  // Show text
  const pages = dialogBox.userData.pages
  const currentPage = dialogBox.userData.currentPage
  let letters = pages[currentPage].letters
  let choiceLines = pages[currentPage].choiceLines
  let speedUpHoldLetter = -1
  for (let i = 0; i < letters.length; i++) {
    dialogBox.add(letters[i])
    // This speeding up logic isn't completly accurate to the game but I think it is a little more usable
    // Eg, game, requires you to let go and then press again, this only requires you to keep holding
    // Game, when you le go, it stops going fast, this keeps it going fast for this dialog
    if (speedUpHoldLetter === -1 && getActiveInputs().o) {
      speedUpHoldLetter = i
    }
    let speed = Math.floor(
      Math.abs(getConfigFieldMessageSpeed() - 255) / (255 / 52) + 3
    )
    // console.log('field message speed', speed)
    if (speedUpHoldLetter !== -1 && speedUpHoldLetter + 7 < i) {
      speed = Math.floor(speed / 3)
    }
    // console.log('speedUpHoldLetter', speedUpHoldLetter, i, speed)
    await sleep(speed)
  }
  // console.log('choiceLines', choiceLines, text)
  if (choiceLines.length > 0) {
    const pointRight = getPointRight()
    const pointerMesh = createTextureMesh(
      pointRight.w,
      pointRight.h,
      pointRight.texture
    )

    let pointerPositions = []
    for (let i = 0; i < choiceLines.length; i++) {
      const choiceLine = choiceLines[i]
      pointerPositions.push({
        id: i,
        x: dialogBox.userData.x + 17,
        y:
          window.config.sizing.height -
          dialogBox.userData.y -
          14 -
          LINE_HEIGHT * choiceLine,
        z: dialogBox.userData.z
      })
      // BUG - Can't see pointer hands when on the scrolled down page (eg PAUSE)
    }
    // TODO - Pointer shadow has no opacity
    dialogBox.userData.currentChoice = 0
    pointerMesh.userData.choices = pointerPositions
    pointerMesh.userData.totalChoices = choiceLines.length
    pointerMesh.userData.isPointer = true
    // console.log('pointerPositions', pointerPositions)
    // if (!showChoicePointers) {
    //     pointerMesh.visible = false
    // }
    pointerMesh.position.set(
      pointerPositions[0].x,
      pointerPositions[0].y,
      pointerPositions[0].z
    )
    dialogBox.userData.state = 'choice'
    dialogBox.add(pointerMesh)
    console.log('showWindowWithDialog PAGE pointers', choiceLines)
  } else if (dialogBox.userData.pages.length > currentPage + 1) {
    dialogBox.userData.currentPage++
    dialogBox.userData.state = 'page'
    console.log(
      'showWindowWithDialog There are more pages',
      dialogBox.userData.pages.length,
      currentPage,
      dialogBox.userData.pages.length > currentPage + 1
    )
  } else if (
    dialogBox.userData.overflow &&
    dialogBox.userData.overflowCurrent < dialogBox.userData.overflowTotal
  ) {
    dialogBox.userData.overflowCurrent++
    dialogBox.userData.state = 'overflow'
    console.log(
      'showWindowWithDialog PAGE overflow rendered',
      dialogBox.userData
    )
    // console.log('There are more pages', dialogBox.userData.pages.length, currentPage, dialogBox.userData.pages.length > currentPage + 1)
  } else {
    dialogBox.userData.state = 'done'
    console.log(
      'showWindowWithDialog PAGE This is the last / only page',
      dialogBox.userData
    )
  }
  console.log(
    'showWindowWithDialog PAGE RENDERED',
    dialogBox,
    showChoicePointers,
    pages[currentPage]
  )
}

const showWindowWithDialog = async (
  dialog,
  showChoicePointers,
  askFirstLine,
  askLastLine
) => {
  const dialogBox = dialog.group
  let text = dialog.text

  // if (dialog.text.includes('{CHOICE}') || showChoicePointers) { isChoiceActive = true }
  if (showChoicePointers) {
    isChoiceActive = true
  } //TODO - I previously has this to show arrows if there was a CHOICE
  console.log(
    'showWindowWithDialog',
    dialog,
    isChoiceActive,
    askFirstLine,
    askLastLine
  )

  if (dialog.text.includes('{CHOICE}') || showChoicePointers) {
    setPlayableCharacterIsInteracting(true)
  }
  // Show dialog
  dialogBox.visible = true

  for (let step = 1; step <= DIALOG_APPEAR_STEP_TOTAL; step++) {
    await sleep(DIALOG_APPEAR_SPEED)
    dialogBox.userData.posAdjustList.map(mesh =>
      adjustDialogExpandPos(
        mesh,
        step,
        DIALOG_APPEAR_STEP_TOTAL,
        dialogBox.userData.z
      )
    )
    dialogBox.userData.sizeAdjustList.map(mesh =>
      adjustDialogExpandSize(
        mesh,
        step,
        DIALOG_APPEAR_STEP_TOTAL,
        dialogBox.userData.bgGeo
      )
    )

    dialogBox.userData.bg.material.clippingPlanes = createClippingPlanes(
      dialogBox.userData.w,
      dialogBox.userData.h,
      dialogBox.userData.z,
      dialogBox.userData.sizeAdjustList[0],
      dialogBox.userData.sizeAdjustList[1],
      dialogBox.userData.sizeAdjustList[2],
      dialogBox.userData.sizeAdjustList[3]
    )
  }

  // Configure text
  text = text.replace(/\t/g, '     ')
  text = replaceCharacterNames(text)
  text = replaceButtonImages(text)
  text = replaceVariables(text, dialog.id)
  // Done - Basic Colours, eg <fe>{PURPLE}
  // TODO - Unknown: <fe><dd>4 - field: hill - Looks like a delay
  // TODO - Colour animations, eg <fe>{FLASH}, <fe>{RAINBOW}
  // Done - Buttons, eg [CANCEL], no direction button image?!
  // Done - Choices, eg {CHOICE}
  // TODO - Pauses, eg {PAUSE} - Need to look into behaviour and how that differs to page
  // Done - Pages, eg {PAGE}
  // Done - Text Variables, eg <fe>{MEM1}

  // console.log('Configured text', text)
  let pagesText = text.split(/\{PAGE\}|\{PAUSE\}/g)

  const pages = []
  for (let i = 0; i < pagesText.length; i++) {
    const pageText = pagesText[i]

    let choiceLines = []
    const letters = []
    let offsetX = 0
    let offsetY = 0

    let doesThePageHaveChoiceElements = pageText.includes('{CHOICE}')
    let textLines = pageText.split('<br/>')
    const dialogSpaceLines = Math.floor((dialog.h - 9) / 16)
    const overflow = dialogSpaceLines < textLines.length
    if (overflow) {
      dialogBox.userData.overflow = true
      dialogBox.userData.overflowTotal = Math.ceil(
        textLines.length / dialogSpaceLines
      )
      dialogBox.userData.overflowCurrent = 0 // Will be incremented on render
    }
    // console.log('msg', textLines, dialog, dialogSpaceLines, overflow)
    let color = 'white'
    for (let j = 0; j < textLines.length; j++) {
      let textLine = textLines[j]

      // console.log('msg textLine', i, j, textLine, (i + 1) === pagesText.length, showChoicePointers, doesThePageHaveChoiceElements, textLine.includes('{CHOICE}'))
      if (
        (i + 1 === pagesText.length &&
          showChoicePointers &&
          !doesThePageHaveChoiceElements &&
          j >= askFirstLine &&
          j <= askLastLine) ||
        (textLine.includes('{CHOICE}') && showChoicePointers) // TODO - added showChoicePointers for junin1a
      ) {
        choiceLines.push(j)
      }
      textLine = textLine.replace(/\{CHOICE\}/g, '          ')

      let identifyCommand = false
      let identifyCommandParam = false
      let command = ''
      let commandParam = ''

      for (let k = 0; k < textLine.length; k++) {
        const letter = textLine[k]

        // Prcess commands
        if (letter === '<') {
          identifyCommand = true
          continue
        } else if (letter === '>') {
          identifyCommand = false
          continue
        } else if (letter === '{') {
          identifyCommandParam = true
          continue
        } else if (letter === '}') {
          identifyCommandParam = false
          // console.log('commandReady', command, commandParam, command === 'fe')
          if (command === 'fe') {
            color = commandParam.toLowerCase()
            // console.log('change text color to', color)
          }
          command = ''
          commandParam = ''
          continue
        }

        // console.log('letter', '-' + letter + '-', color, identifyCommand, identifyCommandParam, command, commandParam, textLine)
        if (identifyCommand) {
          command = command + letter
          // console.log('identifyCommand', letter, command)
          continue
        }
        if (identifyCommandParam) {
          commandParam = commandParam + letter
          // console.log('identifyCommandParam', letter, commandParam)
          continue
        }
        // console.log('command', command, commandParam)

        const textureLetter = getKernelTextLargeLetter(letter, color)
        // console.log('letter', letter, textureLetter, textureLetter.w, textureLetter.h)
        if (textureLetter !== null) {
          const mesh = createTextureMesh(
            textureLetter.w,
            textureLetter.h,
            textureLetter.texture
          )
          const posX = dialogBox.userData.x + 8 + offsetX + textureLetter.w / 2
          const posY =
            window.config.sizing.height - dialogBox.userData.y - 12 - offsetY
          mesh.material.clippingPlanes =
            dialogBox.userData.bg.material.clippingPlanes
          // console.log('pox', posX, '+', textureLetter.w, '->', posX + textureLetter.w, '.', posY, '-', textureLetter.h, '->', posY - textureLetter.h)
          // console.log('letter', letter, mesh.material)
          mesh.userData.isText = true
          mesh.position.set(posX, posY, dialogBox.userData.z)
          offsetX = offsetX + textureLetter.w
          letters.push(mesh)
        } else {
          console.log('no char found', letter)
        }
      }
      offsetX = 0
      offsetY = offsetY + LINE_HEIGHT
    }
    pages.push({ letters, choiceLines })
  }
  dialogBox.userData.pages = pages
  dialogBox.userData.currentPage = 0
  // console.log('showWindowWithDialog', pages, dialogBox.userData, pages.length > 0)

  console.log('showWindowWithDialog DATA', dialog, pages, isChoiceActive)
  await updateCountdownDisplay(dialog)
  await updateSpecialNumber(dialog)

  // Show page / multiple Pages
  await showDialogPageText(dialogBox, showChoicePointers) // Subsequent pages are triggered from nextPageOrCloseActiveDialog()

  // Wait for closing ?!
  // const currentChoice = await waitForDialogToClose(windowId)
  // return currentChoice
}
// const waitForDialogToClose = async (id) => {
//     // console.log('waitForDialogToClose: START')
//     let currentChoice = dialogBoxes[id].userData.currentChoice
//     while (dialogBoxes[id] !== null) {
//         currentChoice = dialogBoxes[id].userData.currentChoice
//         // console.log('currentChoice', currentChoice)
//         await sleep(50)
//     }
//     // console.log('waitForDialogToClose: END', currentChoice)
//     return currentChoice
// }
const navigateChoice = navigateDown => {
  const dialogs = getDialogs()
  for (let i = 0; i < dialogs.length; i++) {
    const dialog = dialogs[i]
    if (
      dialog !== null &&
      dialog !== undefined &&
      dialog.group !== null &&
      dialog.group !== undefined
    ) {
      const dialogBox = dialog.group
      if (dialogBox.userData.state === 'choice') {
        console.log('navigate choice for dialogBox', dialogBox)
        for (let j = 0; j < dialogBox.children.length; j++) {
          if (dialogBox.children[j].userData.choices) {
            const pointerMesh = dialogBox.children[j]
            const currentChoice = dialogBox.userData.currentChoice
            const pointerPositions = pointerMesh.userData.choices
            let nextChoice = navigateDown
              ? currentChoice + 1
              : currentChoice - 1
            if (nextChoice < 0) {
              nextChoice = pointerMesh.userData.totalChoices - 1
            } else if (nextChoice >= pointerMesh.userData.totalChoices) {
              nextChoice = 0
            }
            // console.log('navigateChoice', currentChoice, nextChoice)

            dialogBox.userData.currentChoice = nextChoice
            pointerMesh.position.set(
              pointerPositions[nextChoice].x,
              pointerPositions[nextChoice].y,
              pointerPositions[nextChoice].z
            )
          }
        }
        playCommonSound(COMMON_SOUNDS.OPTION)
      }
    }
  }
}
const closeDialog = async (dialog, choiceResult) => {
  console.log('closeDialog', dialog, choiceResult)
  const dialogBox = dialog.group
  if (dialogBox) {
    for (let step = DIALOG_APPEAR_STEP_TOTAL - 1; step >= 0; step--) {
      dialogBox.userData.posAdjustList.map(mesh =>
        adjustDialogExpandPos(
          mesh,
          step,
          DIALOG_APPEAR_STEP_TOTAL,
          dialogBox.userData.z
        )
      )
      dialogBox.userData.sizeAdjustList.map(mesh =>
        adjustDialogExpandSize(
          mesh,
          step,
          DIALOG_APPEAR_STEP_TOTAL,
          dialogBox.userData.bgGeo
        )
      )
      const clippingPlanes = createClippingPlanes(
        dialogBox.userData.w,
        dialogBox.userData.h,
        dialogBox.userData.z,
        dialogBox.userData.sizeAdjustList[0],
        dialogBox.userData.sizeAdjustList[1],
        dialogBox.userData.sizeAdjustList[2],
        dialogBox.userData.sizeAdjustList[3]
      )

      dialogBox.userData.bg.material.clippingPlanes = clippingPlanes
      for (let i = 0; i < dialogBox.children.length; i++) {
        if (
          dialogBox.children[i].userData.isText ||
          dialogBox.children[i].userData.isPointer
        ) {
          dialogBox.children[i].material.clippingPlanes = clippingPlanes
        }
      }
      await sleep(DIALOG_APPEAR_SPEED)
    }
    dialogBox.userData.state = 'closed'
    scene.remove(dialogBox)
    if (choiceResult !== undefined) {
      isChoiceActive = false
      playCommonSound(COMMON_SOUNDS.OPTION)
      console.log(
        'closeDialog resolveCallback choiceResult',
        dialog,
        choiceResult
      )
      dialog.resolveCallback(choiceResult)
    } else {
      console.log('closeDialog resolveCallback', dialog)
      dialog.resolveCallback()
    }
  }

  dialogBox.userData.state = 'closed'
  const dialogs = getDialogs()
  console.log('dialog', dialog)
  console.log('dialogs', dialogs)

  // TODO - Validate this potential solution to post dialog movement - Allow movement if there are no open dialogs
  const nonClosedDialogs = []
  for (let i = 0; i < dialogs.length; i++) {
    const d = dialogs[i]
    if (
      d !== null &&
      d !== undefined &&
      d.group &&
      d.group.userData.state !== 'closed'
    ) {
      nonClosedDialogs.push(dialog)
    }
  }
  console.log(
    'closeDialog nonClosedDialogs',
    nonClosedDialogs,
    nonClosedDialogs.length
  )
  if (nonClosedDialogs.length === 0) {
    setPlayableCharacterIsInteracting(false)
  }
}
const nextPageOrCloseActiveDialog = async dialog => {
  const dialogBox = dialog.group
  console.log(
    'nextPageOrCloseActiveDialog',
    dialog,
    dialogBox,
    dialogBox.userData.state
  )

  // Ignore if dialog is not closeable
  if (!dialog.playerCanClose) {
    return
  }

  if (dialogBox.userData.state === 'page') {
    console.log('nextPageOrCloseActiveDialog NEXT PAGE', dialogBox.userData)
    await showDialogPageText(dialogBox)
  } else if (dialogBox.userData.state === 'done') {
    console.log('nextPageOrCloseActiveDialog DONE', dialogBox.userData)
    await closeDialog(dialog)
  } else if (dialogBox.userData.state === 'choice') {
    console.log('nextPageOrCloseActiveDialog CHOICE', dialogBox.userData)
    await closeDialog(dialog, dialogBox.userData.currentChoice)
  } else if (dialogBox.userData.state === 'overflow') {
    console.log('nextPageOrCloseActiveDialog OVERFLOW', dialogBox.userData)
    await scrollOverflow(dialogBox)
  }
}

const nextPageOrCloseActiveDialogs = async () => {
  const dialogs = getDialogs()
  console.log('nextPageOrCloseActiveDialogs: START', dialogs)
  for (let i = 0; i < dialogs.length; i++) {
    if (dialogs[i] !== null && dialogs[i] !== undefined && dialogs[i].group) {
      await nextPageOrCloseActiveDialog(dialogs[i])
    }
  }
  console.log('nextPageOrCloseActiveDialogs: END', dialogs)
}

export {
  createDialogBox,
  showWindowWithDialog,
  nextPageOrCloseActiveDialogs,
  navigateChoice,
  closeDialog,
  updateSpecialNumber,
  isChoiceActive,
  updateCountdownDisplays
}
