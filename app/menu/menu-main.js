import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'
import { createDialogBox, slideFrom, slideTo } from './menu-box-helper.js'

// Window size 320,240
const createMainNavigation = async () => {
  const mainNav = await createDialogBox({
    id: 0,
    name: 'nav',
    w: 82,
    h: 156,
    x: 320 - 82,
    y: 0,
    slideX: 0,
    slideY: -240,
    expandInstantly: true,
    noClipping: true
  })
  const mainTime = await createDialogBox({
    id: 1,
    name: 'time',
    w: 84,
    h: 36,
    x: 320 - 84,
    y: 240 - 31 - 35,
    slideX: -320,
    slideY: 0,
    expandInstantly: true,
    noClipping: true
  })
  const mainLocation = await createDialogBox({
    id: 2,
    name: 'location',
    w: 157,
    h: 29,
    x: 320 - 157,
    y: 240 - 1 - 29,
    slideX: 0,
    slideY: 240,
    expandInstantly: true,
    noClipping: true
  })
  const mainHome = await createDialogBox({
    id: 3,
    name: 'home',
    w: 259,
    h: 211,
    x: 0,
    y: 12,
    slideX: 320,
    slideY: 0,
    expandInstantly: true,
    noClipping: true
  })
  await Promise.all([
    slideFrom(mainNav),
    slideFrom(mainTime),
    slideFrom(mainLocation),
    slideFrom(mainHome)
  ])
}

const loadMainMenu = async () => {
  console.log('loadMainMenu')
  showDebugText('Main Menu')

  createMainNavigation()
}

export { loadMainMenu }
