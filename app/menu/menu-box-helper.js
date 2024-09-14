import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import { getConfigWindowColours } from '../data/savemap-config.js'
import { getMenuTextures } from '../data/menu-fetch-data.js'
import { getWindowTextures } from '../data/kernel-fetch-data.js'

import { sleep } from '../helpers/helpers.js'
import { addLimitBarTween } from './menu-limit-tween-helper.js'
const EDGE_SIZE = 8
const BUTTON_IMAGES = [
  { text: 'CANCEL', char: '✕', key: 'button cross' },
  { text: 'SWITCH', char: '☐', key: 'button square' },
  { text: 'MENU', char: '△', key: 'button triangle' },
  { text: 'OK', char: '〇', key: 'button circle' },

  { text: 'PAGEDOWN', char: '┐', key: 'button l1' }, // l1
  { text: 'END', char: '╗', key: 'button l2' }, // ??? // l2
  { text: 'PAGEUP', char: '┌', key: 'button r1' }, // r1
  { text: 'HOME', char: '╔', key: 'button r2' }, // ??? / r2

  { text: 'SELECT', char: '▅', key: 'button select' }, // ???
  { text: 'START', char: '▶', key: 'button start' }
]
const LETTER_TYPES = {
  MenuBaseFont: 'menu-base-font',
  MenuTextFixed: 'menu-text-fixed',
  MenuTextStats: 'menu-text-stats',
  BattleBaseFont: 'battle-base-font',
  BattleTextFixed: 'battle-text-fixed',
  BattleTextStats: 'battle-text-stats',
  CreditsBaseFont: 'credits-base-font',
  CreditsBaseUnderlineFont: 'credits-base-underline-font',
  CreditsBigFont: 'credits-big-font'
}
const LETTER_COLORS = {
  White: 'white',
  Gray: 'gray',
  Blue: 'blue',
  Red: 'red',
  Purple: 'purple',
  Green: 'green',
  Cyan: 'cyan',
  Yellow: 'yellow'
}
const GAUGE_COLORS = {
  // https://forums.qhimm.com/index.php?topic=20001.msg279204#msg279204 - But it doesn't look right to me, cant find hex values in exe
  // Note: These are loose guesses based on visuals only - see addLimitToDialogColorsTest()

  // EXP
  EXP: 'rgb(128,32,32)', // Orangey

  // Battle Time
  WAIT_FILL: 'rgb(32,128,92)', // Green
  WAIT_NON_ACTIVE: 'rgb(128,64,0)', // Yellow
  WAIT_ACTIVE: 'rgb(128,128,32)', // Orange
  WAIT_ACTIVE_FADE: 'rgb(0,0,0)', // Orange

  // Limit Normal
  LIMIT_NORMAL: 'rgb(128,32,92)', // Pink
  LIMIT_FURY: 'rgb(92,0,0)', // Red
  LIMIT_SADNESS: 'rgb(0,0,92)', // Blue

  // Limit colors normal - bright pink, orange, light green, light blue
  LIMIT_NORMAL_1: 'rgb(128,32,128)', // Bright pink
  LIMIT_NORMAL_2: 'rgb(128,64,32)', // Orange , could be 128,76,0
  LIMIT_NORMAL_3: 'rgb(64,128,0)', // Light green
  LIMIT_NORMAL_4: 'rgb(32,128,128)', // Light blue

  // Limit colors hyper - red (hyper color), yellow, dark green, blue/purple
  LIMIT_FURY_1: 'rgb(92,0,0)', // Red
  LIMIT_FURY_2: 'rgb(128,128,0)', // Yellow
  LIMIT_FURY_3: 'rgb(0,92,0)', // Dark Green
  LIMIT_FURY_4: 'rgb(0,0,92)' // Blue/Purple

  // Limit colors sadness - ?
  // LIMIT_SADNESS_1: 'rgb(128,32,76)', // ?
  // LIMIT_SADNESS_2: 'rgb(128,32,76)', // ?
  // LIMIT_SADNESS_3: 'rgb(128,32,76)', // ?
  // LIMIT_SADNESS_4: 'rgb(128,32,76)' // ?
}
const POINTERS = {
  pointer1: null,
  pointer2: null,
  pointer3: null,
  pointerLeft: null
}
const EQUIPMENT_TYPE = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR'
}
const ALIGN = {
  LEFT: 'left',
  CENTRE: 'centre',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
}
const generateGaugeBarsColors1 = c => {
  return ['rgb(0,0,0)', 'rgb(0,0,0)', c, c]
}
const generateGaugeBarsColors2 = c => {
  return ['rgb(128,128,128)', 'rgb(128,128,128)', c, c]
}
const WINDOW_COLORS_SUMMARY = {
  BG: ['rgb(70,0,0)', 'rgb(70,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)'],
  BG_1: ['rgb(70,0,0)', 'rgb(70,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)'],
  BG_2: ['rgb(0,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)'],
  HP: [
    'rgb(0,126,255)',
    'rgb(255,255,255)',
    'rgb(0,126,255)',
    'rgb(255,255,255)'
  ],
  MP: [
    'rgb(0,255,126)',
    'rgb(255,255,255)',
    'rgb(0,255,126)',
    'rgb(255,255,255)'
  ],
  EXP_1: generateGaugeBarsColors1(GAUGE_COLORS.EXP),
  EXP_2: generateGaugeBarsColors2(GAUGE_COLORS.EXP),
  LIMIT_1: generateGaugeBarsColors1(GAUGE_COLORS.LIMIT_NORMAL),
  LIMIT_2: generateGaugeBarsColors2(GAUGE_COLORS.LIMIT_NORMAL),
  LIMIT_FURY_1: generateGaugeBarsColors1(GAUGE_COLORS.LIMIT_FURY),
  LIMIT_FURY_2: generateGaugeBarsColors2(GAUGE_COLORS.LIMIT_FURY),
  LIMIT_SADNESS_1: generateGaugeBarsColors1(GAUGE_COLORS.LIMIT_SADNESS),
  LIMIT_SADNESS_2: generateGaugeBarsColors2(GAUGE_COLORS.LIMIT_SADNESS),
  TURN_1: generateGaugeBarsColors1(GAUGE_COLORS.WAIT_FILL), // TODO - All turn colours are just placeholders
  TURN_2: generateGaugeBarsColors2(GAUGE_COLORS.WAIT_FILL),
  TURN_HASTE_1: generateGaugeBarsColors1(GAUGE_COLORS.LIMIT_FURY),
  TURN_HASTE_2: generateGaugeBarsColors2(GAUGE_COLORS.LIMIT_FURY),
  TURN_SLOW_1: generateGaugeBarsColors1(GAUGE_COLORS.LIMIT_SADNESS),
  TURN_SLOW_2: generateGaugeBarsColors2(GAUGE_COLORS.LIMIT_SADNESS),
  TURN_FULL_1: generateGaugeBarsColors1(GAUGE_COLORS.WAIT_NON_ACTIVE),
  TURN_FULL_2: generateGaugeBarsColors2(GAUGE_COLORS.WAIT_NON_ACTIVE),
  TURN_ACTIVE_1: generateGaugeBarsColors1(GAUGE_COLORS.WAIT_ACTIVE),
  TURN_ACTIVE_2: generateGaugeBarsColors2(GAUGE_COLORS.WAIT_ACTIVE),
  ITEM_LIST_SLIDER_BG: [
    'rgb(25,25,75)',
    'rgb(25,25,75)',
    'rgb(25,25,75)',
    'rgb(25,25,75)'
  ],
  ITEM_LIST_SLIDER_M: [
    'rgb(160,160,160)',
    'rgb(160,160,160)',
    'rgb(160,160,160)',
    'rgb(160,160,160)'
  ],
  ITEM_LIST_SLIDER_TB: [
    'rgb(240,240,240)',
    'rgb(240,240,240)',
    'rgb(64,64,64)',
    'rgb(64,64,64)'
  ],
  ITEM_LIST_SLIDER_LR: [
    'rgb(200,200,200)',
    'rgb(112,112,112)',
    'rgb(200,200,200)',
    'rgb(112,112,112)'
  ],
  DIALOG_SPECIAL: [
    'rgb(110,4,169)',
    'rgb(110,4,125)',
    'rgb(110,0,83)',
    'rgb(110,0,35)'
  ],
  CREDITS_FADE: [
    'rgb(255,255,255)',
    'rgb(0,0,0)',
    'rgb(255,255,255)',
    'rgb(0,0,0)'
  ],
  BLACK: ['rgb(0,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)'],
  GRAY: [
    'rgb(106,106,106)',
    'rgb(106,106,106)',
    'rgb(106,106,106)',
    'rgb(106,106,106)'
  ],
  WHITE: [
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)'
  ],
  YELLOW: [
    'rgb(230,230,0)',
    'rgb(230,230,0)',
    'rgb(230,230,0)',
    'rgb(230,230,0)'
  ]
}
const createFadeOverlay = () => {
  const fade = new THREE.Mesh(
    new THREE.PlaneGeometry(320, 240),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  )
  fade.position.set(320 / 2, 240 / 2, 100 - 2)
  fade.material.transparent = true
  fade.visible = true
  scene.add(fade)
  return fade
}
const fadeOverlayIn = async fade => {
  fade.visible = true
  return new Promise(resolve => {
    const from = { opacity: 0 }
    const to = { opacity: 1 }
    fadeOverlay(fade, from, to, resolve)
  })
}
const fadeOverlayOut = async fade => {
  return new Promise(resolve => {
    const from = { opacity: 1 }
    const to = { opacity: 0 }
    fadeOverlay(fade, from, to, resolve)
  })
}
const fadeOverlay = async (fade, from, to, resolve) => {
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 300)
    // .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      console.log('fadeOverlay: UPDATE', fade, from)
      fade.material.opacity = from.opacity
    })
    .onComplete(function () {
      console.log('fadeOverlay: END', fade, from)
      resolve()
    })
    .start()
}

const updateDialogBGWIthTiledImage = (dialog, type, image) => {
  const textureData = getImageTexture(type, image)
  const texture = textureData.texture
  //   console.log('battleUI COIN: coin material', texture, dialog, textureData)
  const bgBoundingBox = new THREE.Box3().setFromObject(dialog.userData.bg)
  const xFactor =
    (bgBoundingBox.max.x - bgBoundingBox.min.x) / (textureData.w / 2)
  const yFactor =
    (bgBoundingBox.max.y - bgBoundingBox.min.y) / (textureData.h / 2)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(xFactor, yFactor)

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  })
  dialog.userData.bg.material = material
}
const createDialogBox = dialog => {
  const id = dialog.id
  const x = dialog.x
  const y = dialog.y
  const w = dialog.w
  const h = dialog.h
  if (dialog.colors === undefined) {
    dialog.colors = getConfigWindowColours()
  }
  const z = 100 - id
  console.log('limit createDialogBox', dialog, id, x, y, w, h, z, dialog.colors)

  const dialogBox = new THREE.Group()
  dialogBox.userData = dialog
  const dialogTextures = getDialogTextures()
  const bgGeo = new THREE.PlaneGeometry(w - EDGE_SIZE + 3, h - EDGE_SIZE + 3)
  bgGeo.colorsNeedUpdate = true

  bgGeo.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  )

  for (let i = 0; i < dialog.colors.length; i++) {
    // This is not a smooth blend, but instead changes the vertices of the two triangles
    // This is how they do it in the game
    const color = new THREE.Color(dialog.colors[i])
    bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
  }
  // console.log('window.config', window.config)
  const bg = new THREE.Mesh(
    bgGeo,
    new THREE.MeshBasicMaterial({
      transparent: true,
      vertexColors: true
    })
  )
  bg.userData.sizeSmall = { w: EDGE_SIZE * 2 - 3, h: EDGE_SIZE * 2 - 3 }
  bg.userData.sizeExpand = { w: w - EDGE_SIZE + 3, h: h - EDGE_SIZE + 3 }
  bg.userData.posSmall = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2,
    z
  }
  bg.userData.posExpand = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2,
    z
  }
  bg.position.set(bg.userData.posSmall.x, bg.userData.posSmall.y, z)
  // if (isNoBackgroundBorder) {
  //     bg.material.opacity = 0
  //     console.log('isNoBackgroundBorder bg', bg)
  // }
  if (dialog.isSemiTransparent) {
    bg.material.opacity = 0.5
  }
  if (dialog.toggleSpecial) {
    const bgSpecial = bg.clone()
    const bgSpecialGeo = bgSpecial.geometry.clone()
    bgSpecialGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(
        new Float32Array(bgSpecialGeo.attributes.position.count * 3),
        3
      )
    )
    const specialDialogColors = WINDOW_COLORS_SUMMARY.DIALOG_SPECIAL
    for (let i = 0; i < specialDialogColors.length; i++) {
      const color = new THREE.Color(specialDialogColors[i])
      bgSpecialGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
    }
    bgSpecial.geometry = bgSpecialGeo
    bgSpecial.visible = false
    dialogBox.add(bgSpecial)
    dialogBox.userData.bgSpecial = bgSpecial
  }
  dialogBox.add(bg)

  const tl = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.tl)
  tl.userData.posSmall = {
    x: x + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - h / 2 + EDGE_SIZE / 2,
    z
  }
  tl.userData.posExpand = {
    x: x + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2,
    z
  }
  tl.position.set(tl.userData.posSmall.x, tl.userData.posSmall.y, z)
  //   if (isNoBackgroundBorder) {
  //     tl.material.opacity = 0
  //   }
  dialogBox.add(tl)

  const tr = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.tr)
  tr.userData.posSmall = {
    x: x + w / 2 + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - h / 2 + EDGE_SIZE / 2,
    z
  }
  tr.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w - EDGE_SIZE,
    y: window.config.sizing.height - y - EDGE_SIZE / 2,
    z
  }
  tr.position.set(tr.userData.posSmall.x, tr.userData.posSmall.y, z)
  //   if (isNoBackgroundBorder) {
  //     tr.material.opacity = 0
  //   }
  dialogBox.add(tr)

  const bl = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.bl)
  bl.userData.posSmall = {
    x: x + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - h / 2 - EDGE_SIZE / 2,
    z
  }
  bl.userData.posExpand = {
    x: x + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h + EDGE_SIZE,
    z
  }
  bl.position.set(bl.userData.posSmall.x, bl.userData.posSmall.y, z)
  //   if (isNoBackgroundBorder) {
  //     bl.material.opacity = 0
  //   }
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
    z
  }
  br.position.set(br.userData.posSmall.x, br.userData.posSmall.y, z)
  //   if (isNoBackgroundBorder) {
  //     br.material.opacity = 0
  //   }
  dialogBox.add(br)

  const l = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.l)
  l.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
  l.userData.sizeExpand = { w: EDGE_SIZE, h: h - EDGE_SIZE * 2 }
  l.userData.posSmall = {
    x: x + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h / 2 + EDGE_SIZE / 2,
    z
  }
  l.userData.posExpand = {
    x: x + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h / 2 + EDGE_SIZE / 2,
    z
  }
  l.position.set(l.userData.posSmall.x, l.userData.posSmall.y, z)
  //   if (isNoBackgroundBorder) {
  //     l.material.opacity = 0
  //   }
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
  //   if (isNoBackgroundBorder) {
  //     r.material.opacity = 0
  //   }
  dialogBox.add(r)

  const t = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.t)
  t.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
  t.userData.sizeExpand = { w: w - EDGE_SIZE * 2, h: EDGE_SIZE }
  t.userData.posSmall = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2 + EDGE_SIZE / 2,
    z
  }
  t.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2,
    z
  }
  t.position.set(t.userData.posSmall.x, t.userData.posSmall.y, z)
  //   if (isNoBackgroundBorder) {
  //     t.material.opacity = 0
  //   }
  dialogBox.add(t)

  const b = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.b)
  b.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
  b.userData.sizeExpand = { w: w - EDGE_SIZE * 2, h: EDGE_SIZE }
  b.userData.posSmall = {
    x: x + w / 2,
    y: window.config.sizing.height - y - h / 2 - EDGE_SIZE / 2,
    z
  }
  b.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h + EDGE_SIZE,
    z
  }
  b.position.set(b.userData.posSmall.x, b.userData.posSmall.y, z)
  //   if (isNoBackgroundBorder) {
  //     b.material.opacity = 0
  //   }
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
  if (dialog.noBackground) {
    bg.visible = false

    tl.visible = false
    tr.visible = false
    bl.visible = false
    br.visible = false

    l.visible = false
    r.visible = false
    t.visible = false
    b.visible = false
  }
  if (!dialog.noClipping) {
    bg.material.clippingPlanes = createClippingPlanes(w, h, z, t, b, l, r)
  }
  //   dialog.group = dialogBox
  if (dialog.expandInstantly) {
    enlargeInstant(dialogBox)
  }
  dialogBox.visible = false
  const sceneToUse = dialog.scene ? dialog.scene : scene
  sceneToUse.add(dialogBox)
  if (dialog.group === undefined) {
    sceneToUse.add(dialogBox)
  } else {
    console.log('save dialog.group', dialog.group, dialogBox)
    dialog.group.add(dialogBox)
  }

  return dialogBox
}

const DIALOG_APPEAR_SPEED = 15
const DIALOG_APPEAR_STEP_TOTAL = 6

const applyClippingPlanes = (node, clippingPlanes, depth = 0) => {
  if (depth > 10) return
  if (node.userData.isText || node.userData.isPointer) {
    node.material.clippingPlanes = clippingPlanes
  }
  if (depth < 10) {
    node.children.forEach(child =>
      applyClippingPlanes(child, clippingPlanes, depth + 1)
    )
  }
}

const showDialog = async dialogBox => {
  // console.log('battleUI showDialog', dialogBox)
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
        dialogBox.userData.bgGeo,
        dialogBox.userData.colors
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
    applyClippingPlanes(
      dialogBox,
      dialogBox.userData.bg.material.clippingPlanes
    )
  }
}
const closeDialog = async dialogBox => {
  // console.log('battleUI closeDialog', dialogBox)
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
        dialogBox.userData.bgGeo,
        dialogBox.userData.colors
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
    applyClippingPlanes(
      dialogBox,
      dialogBox.userData.bg.material.clippingPlanes
    )
    await sleep(DIALOG_APPEAR_SPEED)
  }
  dialogBox.visible = false
}
const enlargeInstant = dialogBox => {
  // await sleep(DIALOG_APPEAR_SPEED)
  dialogBox.userData.posAdjustList.map(mesh =>
    adjustDialogExpandPos(mesh, 1, 1, dialogBox.userData.z)
  )
  dialogBox.userData.sizeAdjustList.map(mesh =>
    adjustDialogExpandSize(
      mesh,
      1,
      1,
      dialogBox.userData.bgGeo,
      dialogBox.userData.colors
    )
  )
  if (!dialogBox.userData.noClipping) {
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
}
window.showDialog = showDialog
window.closeDialog = closeDialog
window.enlargeInstant = enlargeInstant
const createTextureMesh = (w, h, texture) => {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  })
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), material)
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
const adjustDialogExpandSize = (mesh, step, stepTotal, bgGeo, colors) => {
  mesh.geometry = new THREE.PlaneGeometry(
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
  for (let i = 0; i < colors.length; i++) {
    // This is not a smooth blend, but instead changes the vertices of the two triangles
    // This is how they do it in the game
    const color = new THREE.Color(colors[i])
    bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
  }
}
const createClippingPlanes = (w, h, z, t, b, l, r) => {
  const bgClipPlanes = []
  const bgClipDatas = [
    {
      w: w + EDGE_SIZE,
      h: 2,
      mesh: t,
      x: 0,
      rotateX: true,
      flip: false
    },
    {
      w: w + EDGE_SIZE,
      h: -2,
      mesh: b,
      x: 0,
      rotateX: true,
      flip: true
    },
    {
      w: 10,
      h: h + EDGE_SIZE,
      mesh: l,
      x: -2,
      rotateX: false,
      flip: false
    },
    { w: 10, h: h + EDGE_SIZE, mesh: r, x: 2, rotateX: false, flip: true }
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
    // Figure out another day, but often ends up being -1.5
    if (bgClipPlane.constant === -1.5) {
      bgClipPlane.constant = -2
    }
    bgClipPlanes.push(bgClipPlane)
  }
  return bgClipPlanes
}
const getDialogButton = char => {
  for (let i = 0; i < BUTTON_IMAGES.length; i++) {
    const buttonImage = BUTTON_IMAGES[i]
    if (buttonImage.char === char) {
      return getWindowTextures().buttons[buttonImage.key] // TODO - Update these buttons
    }
  }
  return null
}
const getLetterTexture = (letter, letterType, color) => {
  let textureLetters
  if (
    letterType.startsWith('menu') ||
    letterType.startsWith('battle') ||
    letterType.startsWith('credits')
  ) {
    textureLetters = getMenuTextures()[letterType]
  } else {
    textureLetters = getMenuTextures()[LETTER_TYPES.MenuTextLargeThin]
  }
  for (const key in textureLetters) {
    const textureLetter = textureLetters[key]
    if (textureLetter.char === letter && textureLetter.color === color) {
      console.log('found letter', letter, textureLetter)
      return textureLetter
    }
  }
  console.log('not found letter', letter)
  return getDialogButton(letter)
}
window.getLetterTexture = getLetterTexture

const getImageTexture = (type, image) => {
  let textureImages = getMenuTextures()[type]
  for (const key in textureImages) {
    const textureImage = textureImages[key]
    if (textureImage.description === image) {
      console.log('getImageTexture found image', image, textureImage)
      return textureImage
    }
  }
  textureImages = getWindowTextures()[type]
  for (const key in textureImages) {
    const textureImage = textureImages[key]
    if (textureImage.description === image) {
      console.log('getImageTexture found image', image, textureImage)
      return textureImage
    }
  }
  console.log('getImageTexture not found image', type, image)
  return image
}
const getDialogTextures = () => {
  const textures = getMenuTextures()
  return {
    bl: textures.borders['border bl'].texture,
    br: textures.borders['border br'].texture,
    tl: textures.borders['border tl'].texture,
    tr: textures.borders['border tr'].texture,

    t: textures.borders['border t'].texture,
    b: textures.borders['border b'].texture,
    l: textures.borders['border l'].texture,
    r: textures.borders['border r'].texture
  }
}
const addTextToDialog = (
  // Note: This is offset by x=12 y=12
  dialogBox,
  text,
  id,
  letterType,
  color,
  x,
  y,
  scale,
  clippingPlanes,
  align,
  autoAdjustOffset
) => {
  const letters = ('' + text).split('')
  const textGroup = new THREE.Group()
  if (autoAdjustOffset) {
    x -= 8
    y -= 4
  }
  textGroup.userData = {
    id,
    type: text,
    x,
    y
  }
  let offsetX = 0

  let fullWidth = 0

  if (scale === undefined || scale === null) {
    scale = 0.5
  }
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i]
    const textureLetter = getLetterTexture(letter, letterType, color)
    // console.log('letter', letter, textureLetter, textureLetter.w, textureLetter.h)
    if (textureLetter !== null) {
      const mesh = createTextureMesh(
        textureLetter.w * scale,
        textureLetter.h * scale,
        textureLetter.texture
      )
      const posX = x + 8 + offsetX + (textureLetter.w * scale) / 2
      const posY = window.config.sizing.height - y
      if (dialogBox.userData.bg) {
        mesh.material.clippingPlanes =
          dialogBox.userData.bg.material.clippingPlanes
      }
      if (clippingPlanes) {
        mesh.material.clippingPlanes = clippingPlanes
      }

      // console.log('pox', posX, '+', textureLetter.w, '->', posX + textureLetter.w, '.', posY, '-', textureLetter.h, '->', posY - textureLetter.h)
      // console.log('letter', letter, mesh.material)
      mesh.userData.isText = true
      mesh.position.set(posX, posY, dialogBox.userData.z)
      offsetX = offsetX + textureLetter.w * scale
      fullWidth = fullWidth + textureLetter.w * scale
      textGroup.add(mesh)
    } else {
      // console.log('letter no char found', letter)
    }
  }
  if (align === ALIGN.CENTRE || align === true) {
    for (let i = 0; i < textGroup.children.length; i++) {
      const letterMesh = textGroup.children[i]
      letterMesh.position.x = letterMesh.position.x - fullWidth / 2
    }
  }
  if (align === ALIGN.RIGHT) {
    for (let i = 0; i < textGroup.children.length; i++) {
      const letterMesh = textGroup.children[i]
      letterMesh.position.x = letterMesh.position.x - fullWidth
    }
  }
  textGroup.userData.w = fullWidth
  dialogBox.add(textGroup)
  return textGroup
}
const addGroupToDialog = (dialog, id) => {
  const group = new THREE.Group()
  group.userData = { id, z: 100 - id }
  group.position.z = id - 3
  group.visible = true
  dialog.add(group)
  return group
}
const addImageToGroup = (
  group,
  type,
  image,
  x,
  y,
  scale,
  blending,
  hAlign,
  vAlign
) => {
  const textureLetter = getImageTexture(type, image)
  console.log('textureLetter', type, image, textureLetter)
  const mesh = createTextureMesh(
    textureLetter.w * scale,
    textureLetter.h * scale,
    textureLetter.texture
  )
  const posX = x
  const posY = y
  mesh.position.set(posX, posY, group.userData.z)
  if (hAlign && hAlign === ALIGN.LEFT) {
    mesh.position.x = mesh.position.x + mesh.geometry.parameters.width / 2
  } else if (hAlign && hAlign === ALIGN.RIGHT) {
    mesh.position.x = mesh.position.x - mesh.geometry.parameters.width / 2
  }
  if (vAlign && vAlign === ALIGN.TOP) {
    mesh.position.y = mesh.position.y - mesh.geometry.parameters.height / 2
  } else if (vAlign && vAlign === ALIGN.BOTTOM) {
    mesh.position.y = mesh.position.y + mesh.geometry.parameters.height / 2
  }
  group.add(mesh)
  return mesh
}
const addImageToDialog = (
  dialogBox,
  type,
  image,
  id,
  x,
  y,
  scale,
  blending,
  hAlign,
  vAlign,
  clippingPlanes
) => {
  const textureLetter = getImageTexture(type, image)
  console.log('textureLetter', type, image, textureLetter)
  const mesh = createTextureMesh(
    textureLetter.w * scale,
    textureLetter.h * scale,
    textureLetter.texture
  )

  if (blending) {
    mesh.material.blending = blending
  }
  const posX = x
  const posY = window.config.sizing.height - y
  if (dialogBox.userData.bg) {
    mesh.material.clippingPlanes = dialogBox.userData.bg.material.clippingPlanes
  }
  mesh.position.set(posX, posY, dialogBox.userData.z)

  if (hAlign && hAlign === ALIGN.LEFT) {
    mesh.position.x = mesh.position.x + mesh.geometry.parameters.width / 2
  } else if (hAlign && hAlign === ALIGN.RIGHT) {
    mesh.position.x = mesh.position.x - mesh.geometry.parameters.width / 2
  }
  if (vAlign && vAlign === ALIGN.TOP) {
    mesh.position.y = mesh.position.y - mesh.geometry.parameters.height / 2
  } else if (vAlign && vAlign === ALIGN.BOTTOM) {
    mesh.position.y = mesh.position.y + mesh.geometry.parameters.height / 2
  }
  if (clippingPlanes) {
    mesh.userData.isText = true
    mesh.material.clippingPlanes = clippingPlanes
  }
  dialogBox.add(mesh)
  return mesh
}
const slideFrom = async dialog => {
  return new Promise(resolve => {
    const from = {
      x: dialog.userData.slideX,
      y: dialog.userData.slideY
    }
    const to = { x: 0, y: 0 }
    slide(dialog, from, to, resolve)
  })
}
const slideTo = async dialog => {
  return new Promise(resolve => {
    const from = { x: 0, y: 0 }
    const to = {
      x: dialog.userData.slideX,
      y: dialog.userData.slideY
    }
    slide(dialog, from, to, resolve)
  })
}
const slide = async (dialog, from, to, resolve) => {
  dialog.position.x = from.x
  dialog.position.y = from.y
  dialog.visible = true
  const time = 250
  console.log('slideFrom: START', dialog, from, to, time)
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, time)
    // .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      console.log('slideFrom: UPDATE', dialog, from)
      dialog.position.x = from.x
      dialog.position.y = from.y
    })
    .onComplete(function () {
      console.log('slideFrom: END', dialog, from)
      resolve()
    })
    .start()
}

const addCharacterSummary = async (
  dialogBox,
  charId,
  x,
  yDiff,
  name,
  status,
  level,
  currentHP,
  maxHP,
  currentMP,
  maxMP
) => {
  const hpPerc = currentHP / maxHP
  const mpPerc = currentMP / maxMP
  const y = window.config.sizing.height - yDiff
  const labelOffsetY = 13
  const labelGapY = 11
  const statsOffsetX = 15.5
  addTextToDialog(
    dialogBox,
    name,
    `summary-name-${charId}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    x + 0,
    window.config.sizing.height - y - 0,
    0.5
  )

  addTextToDialog(
    dialogBox,
    'LV',
    `summary-lvl-label-${charId}`,
    LETTER_TYPES.MenuTextFixed,
    LETTER_COLORS.Cyan,
    x + 0,
    window.config.sizing.height - y + labelOffsetY,
    0.5
  )
  addTextToDialog(
    dialogBox,
    'HP',
    `summary-hp-label-${charId}`,
    LETTER_TYPES.MenuTextFixed,
    LETTER_COLORS.Cyan,
    x + 0,
    window.config.sizing.height - y + labelOffsetY + labelGapY,
    0.5
  )
  addTextToDialog(
    dialogBox,
    'MP',
    `summary-mp-label-${charId}`,
    LETTER_TYPES.MenuTextFixed,
    LETTER_COLORS.Cyan,
    x + 0,
    window.config.sizing.height - y + labelOffsetY + labelGapY * 2,
    0.5
  )
  if (status) {
    addTextToDialog(
      dialogBox,
      status,
      `summary-status-${charId}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Purple,
      x + statsOffsetX + 15,
      window.config.sizing.height - y + labelOffsetY,
      0.5
    )
  }

  addTextToDialog(
    dialogBox,
    ('' + level).padStart(2, ' '),
    `summary-lvl-${charId}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    x + statsOffsetX,
    window.config.sizing.height - y + labelOffsetY,
    0.5
  )
  addTextToDialog(
    dialogBox,
    `${('' + currentHP).padStart(4, ' ')}/${('' + maxHP).padStart(4, ' ')}`,
    `summary-hp-basic-${charId}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    x + statsOffsetX,
    window.config.sizing.height - y + labelOffsetY + labelGapY - 1,
    0.5
  )

  if (hpPerc < 0.1) {
    addTextToDialog(
      dialogBox,
      ('' + currentHP).padStart(4, ' '),
      `summary-hp-low-${charId}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.Yellow,
      x + statsOffsetX,
      window.config.sizing.height - y + labelOffsetY + labelGapY - 1,
      0.5
    )
  }

  addTextToDialog(
    dialogBox,
    `${('' + currentMP).padStart(4, ' ')}/${('' + maxMP).padStart(4, ' ')}`,
    `summary-mp-basic-${charId}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    x + statsOffsetX,
    window.config.sizing.height - y + labelOffsetY + labelGapY * 2 - 1,
    0.5
  )

  if (mpPerc < 0.1) {
    addTextToDialog(
      dialogBox,
      ('' + currentMP).padStart(4, ' '),
      `summary-mp-low-${charId}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.Yellow,
      x + statsOffsetX,
      window.config.sizing.height - y + labelOffsetY + labelGapY * 2 - 1,
      0.5
    )
  }
  const max = 52.5
  const xBarPos = x + statsOffsetX + 34.5
  addShapeToDialog(
    dialogBox,
    WINDOW_COLORS_SUMMARY.BG,
    `hp-bg-${charId}`,
    xBarPos,
    window.config.sizing.height - y + 28.25,
    max,
    2
  )
  addShapeToDialog(
    dialogBox,
    WINDOW_COLORS_SUMMARY.HP,
    `hp-${charId}`,
    xBarPos,
    window.config.sizing.height - y + 27.75,
    max,
    1,
    hpPerc
  )
  addShapeToDialog(
    dialogBox,
    WINDOW_COLORS_SUMMARY.BG,
    `mp-bg-${charId}`,
    xBarPos,
    window.config.sizing.height - y + 28.25 + 10.5,
    max,
    2
  )
  addShapeToDialog(
    dialogBox,
    WINDOW_COLORS_SUMMARY.MP,
    `mp-${charId}`,
    xBarPos,
    window.config.sizing.height - y + 27.75 + 10.5,
    max,
    1,
    mpPerc
  )
}
const initPointers = sceneToUse => {
  POINTERS.pointer1 = createPointer(sceneToUse)
  POINTERS.pointer2 = createPointer(sceneToUse)
  POINTERS.pointer3 = createPointer(sceneToUse)
  POINTERS.pointerLeft = createPointerLeft(sceneToUse)
  // pointer2 = createPointer()
  console.log('pointer1', POINTERS.pointer1)
  window.POINTERS = POINTERS
}
const createPointer = parent => {
  const pointer = new THREE.Group()
  const id = 0
  const z = 100 - id

  // const dialogBox = new THREE.Group()
  pointer.userData = { id, z }
  addImageToDialog(
    pointer,
    'pointers',
    'hand-right-small-no-shadow',
    'pointer-1a',
    0,
    window.config.sizing.height,
    0.5
  )
  addImageToDialog(
    pointer,
    'pointers',
    'hand-right-small-shadow-only',
    'pointer-1a',
    0,
    window.config.sizing.height,
    0.5
  )
  pointer.userData = {
    id: 'pointer-1',
    z: 0.1
  }

  pointer.position.x = 0
  pointer.position.y = 0
  pointer.position.z = z
  pointer.children[1].material.opacity = 0.5
  pointer.visible = false
  parent.add(pointer)
  console.log('pointer', pointer)
  return pointer
}
const createPointerLeft = parent => {
  const pointer = new THREE.Group()
  const id = 70
  const z = 100 - id

  // const dialogBox = new THREE.Group()
  pointer.userData = { id, z }
  addImageToDialog(
    pointer,
    'pointers',
    'hand-left-big-with-shadow',
    'pointer-1a',
    0,
    window.config.sizing.height,
    0.5
  )
  pointer.userData = {
    id: 'pointer-1',
    z: 0.1
  }

  pointer.position.x = 0
  pointer.position.y = 0
  pointer.position.z = z
  // pointer.children[1].material.opacity = 0.5
  pointer.visible = false
  parent.add(pointer)
  console.log('pointer', pointer)
  return pointer
}
const movePointerDebug = (i, x, y, hide, flash) => {
  if (i === 1) {
    movePointer(POINTERS.pointer1, x, y, hide, flash)
  } else if (i === 2) {
    movePointer(POINTERS.pointer2, x, y, hide, flash)
  } else if (i === 3) {
    movePointer(POINTERS.pointer3, x, y, hide, flash)
  } else {
    movePointer(POINTERS.pointerLeft, x, y, hide, flash)
  }
}
window.movePointerDebug = movePointerDebug

const movePointer = (pointer, x, y, hide, flash) => {
  pointer.position.x = x
  pointer.position.y = window.config.sizing.height - y
  console.log('movePointer', pointer, x, y, hide, flash)
  if (flash && pointer.userData.interval === undefined) {
    pointer.userData.interval = setInterval(() => {
      pointer.visible = !pointer.visible
    }, 20)
  } else if (!flash) {
    clearInterval(pointer.userData.interval)
    delete pointer.userData.interval
    pointer.visible = true
  }
  if (hide) {
    pointer.visible = false
  } else {
    pointer.visible = true
  }
}
const addShapeToDialog = (
  dialogBox,
  colors,
  id,
  x,
  y,
  w,
  h,
  perc,
  blending,
  clippingPlanes
) => {
  // console.log('limit shape colors', colors)
  if (perc === undefined || perc === null) {
    perc = 1
  } else if (perc < 0.001) {
    perc = 0.001 // Setting width to zero creates a mess
  }
  x = x - (1 - perc) * w * 0.5
  w = w * perc
  const bgGeo = new THREE.PlaneGeometry(w, h)
  bgGeo.colorsNeedUpdate = true
  bgGeo.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  )
  for (let i = 0; i < colors.length; i++) {
    const color = new THREE.Color(colors[i])
    bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
  }
  // console.log('window.config', window.config)
  const bg = new THREE.Mesh(
    bgGeo,
    new THREE.MeshBasicMaterial({
      transparent: true,
      vertexColors: true
    })
  )
  if (blending) {
    bg.material.blending = blending
  }

  bg.position.set(x, window.config.sizing.height - y, dialogBox.userData.z)
  bg.userData = { id }

  if (clippingPlanes) {
    bg.material.clippingPlanes = clippingPlanes
    bg.userData.isText = true
  }
  dialogBox.add(bg)
  return bg
}

const adjustDialogShrinkPos = (mesh, step, stepTotal, z, from, to) => {
  mesh.position.set(
    mesh.userData[from].x -
      ((mesh.userData[from].x - mesh.userData[to].x) / stepTotal) * step,
    mesh.userData[from].y -
      ((mesh.userData[from].y - mesh.userData[to].y) / stepTotal) * step,
    z
  )
}
const adjustDialogShrinkSize = (mesh, step, stepTotal, from, to, colors) => {
  mesh.geometry = new THREE.PlaneGeometry(
    mesh.userData[from].w -
      ((mesh.userData[from].w - mesh.userData[to].w) / stepTotal) * step,
    mesh.userData[from].h -
      ((mesh.userData[from].h - mesh.userData[to].h) / stepTotal) * step
  )
  mesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  )
  if (colors === undefined) {
    colors = getConfigWindowColours()
  }
  for (let i = 0; i < colors.length; i++) {
    const color = new THREE.Color(colors[i])
    mesh.geometry.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
  }
}

const shrinkDialog = async (dialogBox, type) => {
  const from = { step: 1 }
  const to = { step: 1000 }

  let textGroup
  for (let i = 0; i < dialogBox.children.length; i++) {
    const child = dialogBox.children[i]
    if (child.type === 'Group') {
      if (child.userData.type === type) {
        textGroup = child
        child.visible = true
      } else {
        child.visible = false
      }
    }
  }

  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 250)
    // .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      console.log('shrink dialog: UPDATE', dialogBox, from, to, textGroup)
      // Text
      textGroup.position.y =
        0 - ((0 - (textGroup.userData.y - 12)) / to.step) * from.step

      // Dialog edges and bg
      dialogBox.userData.posAdjustList.map(mesh =>
        adjustDialogShrinkPos(
          mesh,
          from.step,
          to.step,
          dialogBox.userData.z,
          'posExpand',
          'posShrink'
        )
      )
      adjustDialogShrinkPos(
        dialogBox.userData.bg,
        from.step,
        to.step,
        dialogBox.userData.z,
        'posExpand',
        'posShrink'
      )
      dialogBox.userData.sizeAdjustList.map(mesh =>
        adjustDialogShrinkSize(
          mesh,
          from.step,
          to.step,
          'sizeExpand',
          'sizeShrink',
          dialogBox.userData.colors
        )
      )
      adjustDialogShrinkSize(
        dialogBox.userData.bg,
        from.step,
        to.step,
        'sizeExpand',
        'sizeShrink',
        dialogBox.userData.colors
      )
    })
    .onComplete(function () {
      console.log('shrink dialog: END', dialogBox, from.step, to.step)
    })
    .start()
}
const expandDialog = async (dialogBox, type) => {
  return new Promise(resolve => {
    const from = { step: 1 }
    const to = { step: 1000 }

    let textGroup
    for (let i = 0; i < dialogBox.children.length; i++) {
      const child = dialogBox.children[i]
      if (child.type === 'Group') {
        if (child.userData.type === type) {
          textGroup = child
          child.visible = true
        } else {
          child.visible = false
        }
      }
    }

    new TWEEN.Tween(from, MENU_TWEEN_GROUP)
      .to(to, 250)
      // .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function () {
        console.log('shrink dialog: UPDATE', dialogBox, from, to, textGroup)
        // Text
        textGroup.position.y =
          textGroup.userData.y -
          12 -
          ((textGroup.userData.y - 12 - 0) / to.step) * from.step

        // Dialog edges and bg
        dialogBox.userData.posAdjustList.map(mesh =>
          adjustDialogShrinkPos(
            mesh,
            from.step,
            to.step,
            dialogBox.userData.z,
            'posShrink',
            'posExpand'
          )
        )
        adjustDialogShrinkPos(
          dialogBox.userData.bg,
          from.step,
          to.step,
          dialogBox.userData.z,
          'posShrink',
          'posExpand'
        )
        dialogBox.userData.sizeAdjustList.map(mesh =>
          adjustDialogShrinkSize(
            mesh,
            from.step,
            to.step,
            'sizeShrink',
            'sizeExpand'
          )
        )
        adjustDialogShrinkSize(
          dialogBox.userData.bg,
          from.step,
          to.step,
          'sizeShrink',
          'sizeExpand'
        )
      })
      .onComplete(function () {
        console.log('shrink dialog: END', dialogBox, from.step, to.step)
        for (let i = 0; i < dialogBox.children.length; i++) {
          const child = dialogBox.children[i]
          child.visible = true
        }
        resolve()
      })
      .start()
  })
}

const createItemListNavigation = (
  dialog,
  x,
  y,
  h,
  totalLines,
  pageSize,
  clippingPlanes
) => {
  const sliderBg = addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_BG,
    'slider-bg',
    x,
    window.config.sizing.height - y,
    8,
    h,
    null,
    null,
    clippingPlanes
  )
  dialog.userData.sliderBg = sliderBg
  const slider = new THREE.Group()
  slider.position.x = x
  slider.position.y = y
  slider.position.z = dialog.userData.z
  slider.userData.z = dialog.userData.z

  slider.userData.sliderHeight = (h / totalLines) * pageSize
  slider.userData.yMin = y + h / 2 - slider.userData.sliderHeight / 2
  slider.userData.yMax = y - h / 2 + slider.userData.sliderHeight / 2
  slider.userData.moveToPage = page => {
    const newY =
      slider.userData.yMin -
      (slider.userData.yMin - slider.userData.yMax) *
        (page / (totalLines - pageSize))
    slider.position.y = newY
    console.log(
      'item moveToPage',
      page,
      slider,
      slider.userData.yMin,
      slider.userData.yMin - slider.userData.yMax,
      page / totalLines,
      newY
    )
  }

  dialog.add(slider)
  dialog.userData.slider = slider

  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_TB,
    'slider-main',
    0,
    window.config.sizing.height,
    8,
    h / (totalLines / pageSize),
    null,
    null,
    clippingPlanes
  )
  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_LR,
    'slider-main',
    0,
    window.config.sizing.height,
    8,
    h / (totalLines / pageSize) - 1,
    null,
    null,
    clippingPlanes
  )
  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_M,
    'slider-main',
    0,
    window.config.sizing.height,
    8 - 1,
    h / (totalLines / pageSize) - 1,
    null,
    null,
    clippingPlanes
  )
}

const weaponMateriaTypes = char => {
  const materiaTypes = []
  for (let i = 1; i < 9; i++) {
    materiaTypes.push(
      char.materia[`weaponMateria${i}`].id < 255
        ? window.data.kernel.materiaData[char.materia[`weaponMateria${i}`].id]
            .type
        : 'None'
    )
  }
  return materiaTypes
}
const armorMateriaTypes = char => {
  const materiaTypes = []
  for (let i = 1; i < 9; i++) {
    materiaTypes.push(
      char.materia[`armorMateria${i}`].id < 255
        ? window.data.kernel.materiaData[char.materia[`armorMateria${i}`].id]
            .type
        : 'None'
    )
  }
  return materiaTypes
}
const createEquipmentMateriaViewer = (
  dialog,
  x,
  y,
  slots,
  char,
  equipmentType
) => {
  // TODO - Slider bg have an additional light edge on bottom and right
  // Also, it seems to be a blended color rather than fixed
  const w = 113
  const h = 11.5
  const adjW = h - 4

  const xStart = x
  const yStart = y + h + adjW
  addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_BG,
    'equipmentMateriaViewer',
    xStart + w / 2,
    yStart,
    w,
    h
  )

  const slotOffset = 8
  const joinOffset = 7
  const materiaOffset = 0
  const materiaGap = 14
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (slot.includes('Normal')) {
      addImageToDialog(
        dialog,
        'materia',
        'slot-normal',
        `slot-${i}`,
        xStart + slotOffset + i * materiaGap,
        yStart + 0.5,
        0.5
      )
    } else if (slot.includes('Empty')) {
      addImageToDialog(
        dialog,
        'materia',
        'slot-nogrowth',
        `slot-${i}`,
        xStart + slotOffset + i * materiaGap,
        yStart + 0.5,
        0.5
      )
    }
  }

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (slot.includes('LeftLinkedSlot')) {
      addImageToDialog(
        dialog,
        'materia',
        'slot-link',
        `slot-${i}-link`,
        xStart + slotOffset + joinOffset + i * materiaGap,
        yStart + 0.5,
        0.5
      )
    }
  }

  if (char) {
    let materias
    if (equipmentType === EQUIPMENT_TYPE.WEAPON) {
      materias = weaponMateriaTypes(char)
    } else if (equipmentType === EQUIPMENT_TYPE.ARMOR) {
      materias = armorMateriaTypes(char)
    }

    if (materias) {
      for (let i = 0; i < materias.length; i++) {
        const materia = materias[i]
        if (materia !== 'None') {
          addImageToDialog(
            dialog,
            'materia',
            materia,
            `slot-${i}-link`,
            xStart + slotOffset + materiaOffset + i * materiaGap,
            yStart,
            0.5,
            THREE.AdditiveBlending
          )
        }
      }
    }
  }
  // console.log('status createEquipmentMateriaViewer', slots, materias)
}
const createHorizontalConfigSlider = (dialog, x, y, defaultValue) => {
  // TODO - Slider bg have an additional light edge on bottom and right
  // Also, it seems to be a blended color rather than fixed
  const widthBG = 134
  const h = 11
  const slideW = 6.5

  // When white
  // BG main: -55
  // BG TL:   -65
  // BG BR:  -100

  // When black
  // BG main:  25
  // BG TL:    19
  // BG BR:    60

  //
  addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_BG,
    'slider-bg',
    x + widthBG / 2,
    y,
    widthBG,
    h
  )
  const slider = new THREE.Group()
  slider.position.x = x
  slider.position.y = y
  slider.position.z = dialog.userData.z
  slider.userData.z = dialog.userData.z
  slider.userData.min = x
  slider.userData.goToValue = val => {
    slider.position.x = (widthBG - slideW) * (val / 255) + x
  }

  dialog.add(slider)
  dialog.userData.slider = slider

  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_TB,
    'slider-main',
    slideW / 2,
    y * 2,
    slideW,
    h
  )
  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_LR,
    'slider-main',
    slideW / 2,
    y * 2,
    slideW,
    h - 1
  )
  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_M,
    'slider-main',
    slideW / 2,
    y * 2,
    slideW - 1,
    h - 1
  )
  slider.userData.goToValue(defaultValue)
  return slider
}

// const addLimitToDialogColorsTest = (dialog) => {
//   const limitPerc = 1

//   const options = [0, 32, 64, 92, 128, 192]
//   const perms = []
//   for (let i = 0; i < options.length; i++) {
//     const o1 = options[i]
//     for (let j = 0; j < options.length; j++) {
//       const o2 = options[j]
//       for (let k = 0; k < options.length; k++) {
//         const o3 = options[k]
//         perms.push(`rgb(${o1},${o2},${o3})`)
//       }
//     }
//   }
//   perms.push('rgb(0,0,0)')
//   perms.push('rgb(0,0,0)')
//   const gaugeKeys = Object.keys(GAUGE_COLORS)
//   for (let i = 0; i < gaugeKeys.length; i++) {
//     const gaugeKey = gaugeKeys[i]
//     perms.push(GAUGE_COLORS[gaugeKey])
//   }
//   for (let i = 0; i < perms.length; i++) {
//     const perm = perms[i]
//     const rows = 25
//     const rootX = 35 + (Math.trunc(i / rows) * 30)
//     const rootY = -10 + ((i % rows) * 8)

//     addImageToDialog(dialog, 'bars', 'level', 'limit-bar-bg', rootX + 0.5, rootY, 0.5)
//     addShapeToDialog(
//       dialog,
//       generateGaugeBarsColors1(perm),
//       'limit-bar-a',
//       rootX,
//       rootY - 2.5,
//       58,
//       3,
//       limitPerc,
//       THREE.AdditiveBlending
//     )
//     addShapeToDialog(
//       dialog,
//       generateGaugeBarsColors2(perm),
//       'limit-bar-b',
//       rootX,
//       rootY + 0.5,
//       58,
//       3,
//       limitPerc,
//       THREE.AdditiveBlending
//     )
//     addTextToDialog(dialog, perm.replace('rgb(', '').replace(')', ''), `perm-${i}`, LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, rootX - 35, rootY, 0.125)
//     console.log('limit perm', i, perm)
//   }
//   dialog.position.z = 100
//   window.limitTest = dialog
// }
const addLimitToDialog = (dialog, x, y, char) => {
  const limitPerc = char.limit.bar / 255
  // TODO - sadness??
  addImageToDialog(dialog, 'bars', 'level', 'limit-bar-bg', x + 0.5, y, 0.5)

  let color1 = WINDOW_COLORS_SUMMARY.LIMIT_1
  let color2 = WINDOW_COLORS_SUMMARY.LIMIT_2
  if (char.status.statusFlags === 'Fury') {
    color1 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_1
    color2 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_2
  } else if (char.status.statusFlags === 'Sadness') {
    color1 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_1
    color2 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_2
  }
  const l1 = addShapeToDialog(
    dialog,
    color1,
    'limit-bar-a',
    x,
    y - 2.5,
    58,
    3,
    limitPerc,
    THREE.AdditiveBlending
  )
  const l2 = addShapeToDialog(
    dialog,
    color2,
    'limit-bar-b',
    x,
    y + 0.5,
    58,
    3,
    limitPerc,
    THREE.AdditiveBlending
  )
  if (char.limit.bar === 255) {
    addLimitBarTween(l1)
    addLimitBarTween(l2)
  }
}
const addLevelToDialog = (dialog, x, y, char) => {
  const expPerc = char.level.progressBar / 100

  addImageToDialog(dialog, 'bars', 'level', 'level-bar-bg', x + 0.5, y, 0.5)
  addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.EXP_1,
    'level-bar-a',
    x,
    y - 2.5,
    58,
    3,
    expPerc,
    THREE.AdditiveBlending
  )
  addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.EXP_2,
    'level-bar-b',
    x,
    y + 0.5,
    58,
    3,
    expPerc,
    THREE.AdditiveBlending
  )
}
const createCommandsDialog = (dialog, x, y, commands, startHidden) => {
  const widthCol1 = 60
  const widthCol2 = 109
  const widthCol3 = 157

  let width = widthCol1
  if (commands.length > 8) {
    width = widthCol3
  } else if (commands.length > 4) {
    width = widthCol2
  }

  const dialogOptions = {
    id: dialog.userData.id + 3,
    name: 'commandDialog',
    w: width,
    h: 60,
    x,
    y
  }
  if (startHidden === undefined || !startHidden) {
    dialogOptions.expandInstantly = true
    dialogOptions.noClipping = true
  }
  console.log('battleUI commandDialog', dialogOptions)
  const commandDialog = createDialogBox(dialogOptions)
  if (startHidden === undefined || !startHidden) {
    commandDialog.visible = true
  }
  dialog.add(commandDialog)
  const innerGroup = new THREE.Group()
  innerGroup.userData.id = commandDialog.userData.id
  innerGroup.userData.z = commandDialog.userData.z
  innerGroup.visible = true
  commandDialog.add(innerGroup)

  commandDialog.userData.innerGroup = innerGroup
  return commandDialog
}
const addMenuCommandsToDialog = (commandDialog, x, y, commands) => {
  console.log('battleUI addMenuCommandsToDialog')
  // removeGroupChildren(commandDialog.userData.innerGroup)
  const yAdjTextCol1 = 0
  const yAdjTextCol2 = 52.5
  const yAdjTextCol3 = 96.5

  let limitGroup = null
  let coinGroup = null
  for (let i = 0; i < commands.length; i++) {
    // TODO - These change in battle need to amend
    const command = commands[i]
    let yAdjText = yAdjTextCol1
    if (i >= 8) {
      yAdjText = yAdjTextCol3
    } else if (i >= 4) {
      yAdjText = yAdjTextCol2
    }
    if (command.id < 255) {
      const commandText = addTextToDialog(
        commandDialog,
        command.limit
          ? window.data.kernel.commandData[command.limit].name
          : command.name,
        `menu-cmd-${command.name}`,
        LETTER_TYPES.BattleBaseFont,
        LETTER_COLORS.White,
        x + 5 - 8 + yAdjText,
        y + 15.5 - 4 + 13 * (i % 4),
        0.5
        // commandDialog.userData.bg.material.clippingPlanes
      )
      if (command.limit) {
        limitGroup = commandText
        commandText.userData.limitText =
          window.data.kernel.commandData[command.limit].name
      }
      if (command.id === 7) {
        // Coin
        const commandText2 = addTextToDialog(
          commandDialog,
          window.data.kernel.commandData[8].name, // Throw
          'menu-cmd-throw',
          LETTER_TYPES.BattleBaseFont,
          LETTER_COLORS.White,
          x + 5 - 8 + yAdjText,
          y + 15.5 - 4 + 13 * (i % 4),
          0.5,
          commandDialog.userData.bg.material.clippingPlanes
        )
        commandText2.visible = false
        coinGroup = [commandText, commandText2]
      }
      if (command.all) {
        const allArrow = addImageToDialog(
          commandDialog,
          'pointers',
          'arrow-right',
          `menu-cmd-${command.name}-all`,
          x + 6 + yAdjText + commandText.userData.w,
          y + 15.5 - 4 + 13 * (i % 4),
          0.5,
          null,
          // commandDialog.userData.bg.material.clippingPlanes,
          ALIGN.LEFT
        )
        allArrow.userData.isText = true
        // console.log('battleUI ALL', command.all, allArrow)
        // allArrow.material.clippingPlanes = null // TODO - Not sure why, but clipping planes are messed up here
      }

      // TODO - Blank out magic / summons etc that cannot be used (silence, no mp, etc)
    }
  }
  if (limitGroup !== null) {
    commandDialog.userData.limitGroup = limitGroup
  }
  if (coinGroup !== null) {
    commandDialog.userData.coinGroup = coinGroup
  }
}
const updateTexture = (mesh, letter, letterType, color) => {
  const textureLetter = getLetterTexture(letter, letterType, color)
  mesh.material.needsUpdate = true
  mesh.material.map = textureLetter.texture
}
const removeGroupChildren = group => {
  while (group.children.length) {
    group.remove(group.children[0])
  }
}
export {
  LETTER_TYPES,
  LETTER_COLORS,
  GAUGE_COLORS,
  ALIGN,
  WINDOW_COLORS_SUMMARY,
  EQUIPMENT_TYPE,
  createDialogBox,
  slideFrom,
  slideTo,
  addTextToDialog,
  addImageToGroup,
  addImageToDialog,
  addGroupToDialog,
  addCharacterSummary,
  getLetterTexture,
  getImageTexture,
  addShapeToDialog,
  getDialogTextures,
  POINTERS,
  initPointers,
  createPointer,
  movePointer,
  shrinkDialog,
  expandDialog,
  createFadeOverlay,
  fadeOverlayIn,
  fadeOverlayOut,
  createItemListNavigation,
  addLimitToDialog,
  addLevelToDialog,
  showDialog,
  closeDialog,
  createHorizontalConfigSlider,
  updateTexture,
  createEquipmentMateriaViewer,
  createCommandsDialog,
  addMenuCommandsToDialog,
  removeGroupChildren,
  enlargeInstant,
  updateDialogBGWIthTiledImage
}
