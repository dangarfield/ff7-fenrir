import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import { getConfigWindowColours } from '../data/savemap-config.js'
import { getDialogTextures } from '../field/field-fetch-data.js'
const EDGE_SIZE = 8
const LINE_HEIGHT = 16

const createDialogBox = async dialog => {
  const id = dialog.id
  const x = dialog.x
  const y = dialog.y
  const w = dialog.w
  const h = dialog.h
  const z = 100 - id
  console.log('createDialogBox', dialog, id, x, y, w, h, z)

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

  if (!dialog.noClipping) {
    bg.material.clippingPlanes = createClippingPlanes(w, h, z, t, b, l, r)
  }
  //   dialog.group = dialogBox
  if (dialog.expandInstantly) {
    enlargeInstant(dialogBox)
  }
  dialogBox.visible = false
  scene.add(dialogBox)
  return dialogBox
}
const enlargeInstant = dialogBox => {
  // await sleep(DIALOG_APPEAR_SPEED)
  dialogBox.userData.posAdjustList.map(mesh =>
    adjustDialogExpandPos(mesh, 1, 1, dialogBox.userData.z)
  )
  dialogBox.userData.sizeAdjustList.map(mesh =>
    adjustDialogExpandSize(mesh, 1, 1, dialogBox.userData.bgGeo)
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
  const bgClipPlanes = []
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
export { createDialogBox, slideFrom, slideTo }
