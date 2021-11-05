import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import { getConfigWindowColours } from '../data/savemap-config.js'
import { getMenuTextures } from '../data/menu-fetch-data.js'
import { getWindowTextures } from '../data/kernel-fetch-data.js'

import { sleep } from '../helpers/helpers.js'
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
  BattleTextStats: 'battle-text-stats'
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
  LightRed: 'rgb(128,32,32)',
  Pink: 'rgb(128,32,76)',
  Red: 'rgb(233,120,21)',
  Blue: 'rgb(233,112,21)'
}
const POINTERS = {
  pointer1: null,
  pointer2: null,
  pointer3: null
}
const EQUIPMENT_TYPE = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR'
}

const generateGaugeBarsColors1 = c => {
  return ['rgb(0,0,0)', 'rgb(0,0,0)', c, c]
}
const generateGaugeBarsColors2 = c => {
  return ['rgb(128,128,128)', 'rgb(128,128,128)', c, c]
}
const WINDOW_COLORS_SUMMARY = {
  BG: ['rgb(70,0,0)', 'rgb(70,0,0)', 'rgb(0,0,0)', 'rgb(0,0,0)'],
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
  EXP_1: generateGaugeBarsColors1(GAUGE_COLORS.LightRed),
  EXP_2: generateGaugeBarsColors2(GAUGE_COLORS.LightRed),
  LIMIT_1: generateGaugeBarsColors1(GAUGE_COLORS.Pink),
  LIMIT_2: generateGaugeBarsColors2(GAUGE_COLORS.Pink),
  LIMIT_FURY_1: generateGaugeBarsColors1(GAUGE_COLORS.Red),
  LIMIT_FURY_2: generateGaugeBarsColors2(GAUGE_COLORS.Red),
  LIMIT_SAD_1: generateGaugeBarsColors1(GAUGE_COLORS.Blue),
  LIMIT_SAD_2: generateGaugeBarsColors2(GAUGE_COLORS.Blue),
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
  ]
}
const createFadeOverlay = () => {
  const fade = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(320, 240),
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
  const bgGeo = new THREE.PlaneBufferGeometry(
    w - EDGE_SIZE + 3,
    h - EDGE_SIZE + 3
  )
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
  // if (isNoBackgroundBorder) {
  //     bg.material.opacity = 0
  //     console.log('isNoBackgroundBorder bg', bg)
  // }
  // if (isTransparent) {
  //     bg.material.opacity = 0.5
  // }
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
  //   if (isNoBackgroundBorder) {
  //     tl.material.opacity = 0
  //   }
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
  //   if (isNoBackgroundBorder) {
  //     tr.material.opacity = 0
  //   }
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
    z: z
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
    z: z
  }
  l.userData.posExpand = {
    x: x + EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h / 2 + EDGE_SIZE / 2,
    z: z
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
    z: z
  }
  t.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2,
    z: z
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
    z: z
  }
  b.userData.posExpand = {
    x: x + EDGE_SIZE / 2 + w / 2 - EDGE_SIZE / 2,
    y: window.config.sizing.height - y - EDGE_SIZE / 2 - h + EDGE_SIZE,
    z: z
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
  scene.add(dialogBox)
  if (dialog.group === undefined) {
    scene.add(dialogBox)
  } else {
    console.log('save dialog.group', dialog.group, dialogBox)
    dialog.group.add(dialogBox)
  }

  return dialogBox
}

const DIALOG_APPEAR_SPEED = 15
const DIALOG_APPEAR_STEP_TOTAL = 6

const showDialog = async dialogBox => {
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
    for (let i = 0; i < dialogBox.children.length; i++) {
      const childlevel1 = dialogBox.children[i]
      if (childlevel1.userData.isText || childlevel1.userData.isPointer) {
        childlevel1.material.clippingPlanes =
          dialogBox.userData.bg.material.clippingPlanes
      }
      if (childlevel1.children) {
        for (let j = 0; j < childlevel1.children.length; j++) {
          const childlevel2 = childlevel1.children[j]
          if (childlevel2.userData.isText || childlevel2.userData.isPointer) {
            childlevel2.material.clippingPlanes =
              dialogBox.userData.bg.material.clippingPlanes
          }
        }
      }
    }
  }
}
const closeDialog = async dialogBox => {
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
const adjustDialogExpandSize = (mesh, step, stepTotal, bgGeo, colors) => {
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
  if (letterType.startsWith('menu') || letterType.startsWith('battle')) {
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
  const textureImages = getMenuTextures()[type]
  for (const key in textureImages) {
    const textureImage = textureImages[key]
    if (textureImage.description === image) {
      // console.log('found image', image, textureImage)
      return textureImage
    }
  }
  console.log('not found image', type, image)
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
// const showDialog = async (dialogBox) => {
//   dialogBox.visible = true
//   const DIALOG_APPEAR_STEP_TOTAL = 3
//   const DIALOG_APPEAR_SPEED = 3
//   for (let step = 1; step <= DIALOG_APPEAR_STEP_TOTAL; step++) {
//     await sleep(DIALOG_APPEAR_SPEED)
//     dialogBox.userData.posAdjustList.map(mesh =>
//       adjustDialogExpandPos(
//         mesh,
//         step,
//         DIALOG_APPEAR_STEP_TOTAL,
//         dialogBox.userData.z
//       )
//     )
//     dialogBox.userData.sizeAdjustList.map(mesh =>
//       adjustDialogExpandSize(
//         mesh,
//         step,
//         DIALOG_APPEAR_STEP_TOTAL,
//         dialogBox.userData.bgGeo
//       )
//     )

//     dialogBox.userData.bg.material.clippingPlanes = createClippingPlanes(
//       dialogBox.userData.w,
//       dialogBox.userData.h,
//       dialogBox.userData.z,
//       dialogBox.userData.sizeAdjustList[0],
//       dialogBox.userData.sizeAdjustList[1],
//       dialogBox.userData.sizeAdjustList[2],
//       dialogBox.userData.sizeAdjustList[3]
//     )
//   }
// }
const addTextToDialog = (
  dialogBox,
  text,
  id,
  letterType,
  color,
  x,
  y,
  scale
) => {
  const letters = text.split('')
  const textGroup = new THREE.Group()
  textGroup.userData = {
    id: id,
    type: text,
    x: x,
    y: y
  }
  let offsetX = 0

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

      // console.log('pox', posX, '+', textureLetter.w, '->', posX + textureLetter.w, '.', posY, '-', textureLetter.h, '->', posY - textureLetter.h)
      // console.log('letter', letter, mesh.material)
      mesh.userData.isText = true
      mesh.position.set(posX, posY, dialogBox.userData.z)
      offsetX = offsetX + textureLetter.w * scale
      textGroup.add(mesh)
    } else {
      console.log('no char found', letter)
    }
  }
  dialogBox.add(textGroup)
  return textGroup
}
const addGroupToDialog = (dialog, id) => {
  const group = new THREE.Group()
  group.userData = { id: id, z: 100 - id }
  group.position.z = id - 3
  group.visible = true
  dialog.add(group)
  return group
}
const addImageToDialog = async (dialogBox, type, image, id, x, y, scale, blending) => {
  const textureLetter = getImageTexture(type, image)
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
const initPointers = () => {
  POINTERS.pointer1 = createPointer(scene)
  POINTERS.pointer2 = createPointer(scene)
  POINTERS.pointer3 = createPointer(scene)
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
const movePointerDebug = (i, x, y, hide, flash) => {
  if (i === 1) {
    movePointer(POINTERS.pointer1, x, y, hide, flash)
  } else if (i === 2) {
    movePointer(POINTERS.pointer2, x, y, hide, flash)
  } else {
    movePointer(POINTERS.pointer3, x, y, hide, flash)
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
const addShapeToDialog = async (
  dialogBox,
  colors,
  id,
  x,
  y,
  w,
  h,
  perc,
  blending
) => {
  if (perc === undefined) {
    perc = 1
  } else if (perc < 0.001) {
    perc = 0.001 // Setting width to zero creates a mess
  }
  x = x - (1 - perc) * w * 0.5
  w = w * perc
  const bgGeo = new THREE.PlaneBufferGeometry(w, h)
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
      vertexColors: THREE.VertexColors
    })
  )
  if (blending) {
    bg.material.blending = blending
  }

  bg.position.set(x, window.config.sizing.height - y, dialogBox.userData.z)
  bg.userData = { id: id }
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
  mesh.geometry = new THREE.PlaneBufferGeometry(
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

const createItemListNavigation = (dialog, x, y, h, totalLines, pageSize) => {
  const sliderBg = addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_BG,
    'slider-bg',
    x,
    window.config.sizing.height - y,
    8,
    h
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
    h / (totalLines / pageSize)
  )
  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_LR,
    'slider-main',
    0,
    window.config.sizing.height,
    8,
    h / (totalLines / pageSize) - 1
  )
  addShapeToDialog(
    slider,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_M,
    'slider-main',
    0,
    window.config.sizing.height,
    8 - 1,
    h / (totalLines / pageSize) - 1
  )
}

const weaponMateriaTypes = (char) => {
  const materiaTypes = []
  for (let i = 1; i < 9; i++) {
    materiaTypes.push(char.materia[`weaponMateria${i}`].id < 255 ? window.data.kernel.materiaData[char.materia[`weaponMateria${i}`].id].type : 'None')
  }
  return materiaTypes
}
const armorMateriaTypes = (char) => {
  const materiaTypes = []
  for (let i = 1; i < 9; i++) {
    materiaTypes.push(char.materia[`armorMateria${i}`].id < 255 ? window.data.kernel.materiaData[char.materia[`armorMateria${i}`].id].type : 'None')
  }
  return materiaTypes
}
const createEquipmentMateriaViewer = (dialog, x, y, slots, char, equipmentType) => {
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

  let materias
  if (equipmentType === EQUIPMENT_TYPE.WEAPON) {
    materias = weaponMateriaTypes(char)
  } else {
    materias = armorMateriaTypes(char)
  }

  const slotOffset = 8
  const joinOffset = 7
  const materiaOffset = 0
  const materiaGap = 14
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (slot.includes('Normal')) {
      addImageToDialog(dialog, 'materia', 'slot-normal', `slot-${i}`, xStart + slotOffset + (i * materiaGap), yStart + 0.5, 0.5)
    } else if (slot.includes('Empty')) {
      addImageToDialog(dialog, 'materia', 'slot-nogrowth', `slot-${i}`, xStart + slotOffset + (i * materiaGap), yStart + 0.5, 0.5)
    }
  }

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (slot.includes('LeftLinkedSlot')) {
      addImageToDialog(dialog, 'materia', 'slot-link', `slot-${i}-link`, xStart + slotOffset + joinOffset + (i * materiaGap), yStart + 0.5, 0.5)
    }
  }

  if (materias) {
    for (let i = 0; i < materias.length; i++) {
      const materia = materias[i]
      if (materia !== 'None') {
        addImageToDialog(dialog, 'materia', materia, `slot-${i}-link`, xStart + slotOffset + materiaOffset + (i * materiaGap), yStart, 0.5, THREE.AdditiveBlending)
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
const addLimitToDialog = (dialog, x, y, char) => {
  const limitPerc = char.limit.bar / 255

  addImageToDialog(dialog, 'bars', 'level', 'limit-bar-bg', x + 0.5, y, 0.5)
  addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.LIMIT_1,
    'limit-bar-a',
    x,
    y - 2.5,
    58,
    3,
    limitPerc,
    THREE.AdditiveBlending
  )
  addShapeToDialog(
    dialog,
    WINDOW_COLORS_SUMMARY.LIMIT_2,
    'limit-bar-b',
    x,
    y + 0.5,
    58,
    3,
    limitPerc,
    THREE.AdditiveBlending
  )
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
const addMenuCommandsToDialog = (dialog, x, y, commands) => {
  const widthCol1 = 50
  const widthCol2 = 86.5
  const widthCol3 = 126.5

  let width = widthCol1
  if (commands.length > 8) {
    width = widthCol3
  } else if (commands.length > 4) {
    width = widthCol2
  }
  const yAdjTextCol1 = 0
  const yAdjTextCol2 = 40.5
  const yAdjTextCol3 = 77

  const commandDialog = createDialogBox({
    id: 15,
    name: 'commandDialog',
    w: width,
    h: 60,
    x: x,
    y: y,
    expandInstantly: true,
    noClipping: true
  })
  commandDialog.visible = true
  dialog.add(commandDialog)

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    let yAdjText = yAdjTextCol1
    if (i >= 8) {
      yAdjText = yAdjTextCol3
    } else if (i >= 4) {
      yAdjText = yAdjTextCol2
    }
    if (command.id < 255) {
      addTextToDialog(
        commandDialog,
        command.name,
        `menu-cmd-${command.name}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        x + 5 - 8 + yAdjText,
        y + 15.5 - 4 + (13 * (i % 4)),
        0.5
      )
    }
  }
}
const updateTexture = (mesh, letter, letterType, color) => {
  const textureLetter = getLetterTexture(letter, letterType, color)
  mesh.material.needsUpdate = true
  mesh.material.map = textureLetter.texture
}
const removeGroupChildren = (group) => {
  while (group.children.length) {
    group.remove(group.children[0])
  }
}
export {
  LETTER_TYPES,
  LETTER_COLORS,
  WINDOW_COLORS_SUMMARY,
  EQUIPMENT_TYPE,
  createDialogBox,
  slideFrom,
  slideTo,
  addTextToDialog,
  addImageToDialog,
  addGroupToDialog,
  addCharacterSummary,
  getLetterTexture,
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
  addMenuCommandsToDialog,
  removeGroupChildren
}
