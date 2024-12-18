import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import {
  addImageToDialog,
  ALIGN,
  WINDOW_COLORS_SUMMARY,
  addTextToDialog,
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  getLetterTexture
} from '../menu/menu-box-helper.js'
import {
  addLimitBarTween,
  stopLimitBarTween
} from '../menu/menu-limit-tween-helper.js'
import TWEEN from '../../assets/tween.esm.js'
import {
  BATTLE_TWEEN_UI_GROUP,
  orthoScene,
  tweenSleep
} from './battle-scene.js'
import { disposeAll } from '../helpers/helpers.js'

const addShape = (dialogBox, colors, id, x, y, w, h, blending) => {
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

  bg.position.set(
    x + w / 2,
    window.config.sizing.height - y - h / 2,
    dialogBox.userData.z
  )
  bg.userData = { id }

  dialogBox.add(bg)
  return bg
}

const addBattleBarrier = (dialog, x, y, id) => {
  addImageToDialog(
    dialog,
    'bars',
    'barrier',
    `${id}`,
    x,
    y,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )

  const w = 32

  const colorP1 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_1 // Colours not correct
  const colorP2 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_2
  const p1 = addShape(
    dialog,
    colorP1,
    `${id}-p1`,
    x + 3,
    y - 10,
    w,
    1.5,
    THREE.AdditiveBlending
  )
  const p2 = addShape(
    dialog,
    colorP2,
    `${id}-p2`,
    x + 3,
    y - 8.5,
    w,
    1.5,
    THREE.AdditiveBlending
  )
  let pValue = -1

  const colorM1 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_1 // Colours not correct
  const colorM2 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_2
  const m1 = addShape(
    dialog,
    colorM1,
    `${id}-m1`,
    x + 3,
    y - 5,
    w,
    1.5,
    THREE.AdditiveBlending
  )
  const m2 = addShape(
    dialog,
    colorM2,
    `${id}-m2`,
    x + 3,
    y - 3.5,
    w,
    1.5,
    THREE.AdditiveBlending
  )
  let mValue = -1

  return {
    setPBarrier: value => {
      if (pValue !== value) {
        pValue = value
        const percent = pValue / 0xff
        p1.position.x = x + 3 + (w / 2) * percent
        p1.scale.set(percent, 1, 1)
        p2.position.x = x + 3 + (w / 2) * percent
        p2.scale.set(percent, 1, 1)
      }
    },
    setMBarrier: value => {
      if (mValue !== value) {
        mValue = value
        const percent = mValue / 0xff
        m1.position.x = x + 3 + (w / 2) * percent
        m1.scale.set(percent, 1, 1)
        m2.position.x = x + 3 + (w / 2) * percent
        m2.scale.set(percent, 1, 1)
      }
    },
    getPBarrier: () => pValue,
    getMBarrier: () => mValue
  }
}

const addBattleLimit = (dialog, x, y, id) => {
  addImageToDialog(
    dialog,
    'bars',
    'battle',
    `${id}`,
    x,
    y,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )

  const w = 32

  // Set default colours
  let color1 = WINDOW_COLORS_SUMMARY.LIMIT_1 // Colours not correct
  let color2 = WINDOW_COLORS_SUMMARY.LIMIT_2
  const l1 = addShape(
    dialog,
    color1,
    `${id}-l1`,
    x + 3,
    y - 7,
    w,
    2.5,
    THREE.AdditiveBlending
  )
  const l2 = addShape(
    dialog,
    color2,
    `${id}-l2`,
    x + 3,
    y - 4.5,
    w,
    2.5,
    THREE.AdditiveBlending
  )
  let lValue = -1
  const refreshLimitColours = () => {
    const l1ColorAttr = l1.geometry.getAttribute('color')
    for (let i = 0; i < color1.length; i++) {
      const color = new THREE.Color(color1[i])
      l1ColorAttr.setXYZ(i, color.r, color.g, color.b)
    }
    l1ColorAttr.needsUpdate = true

    const l2ColorAttr = l2.geometry.getAttribute('color')
    for (let i = 0; i < color2.length; i++) {
      const color = new THREE.Color(color2[i])
      l2ColorAttr.setXYZ(i, color.r, color.g, color.b)
    }
    l2ColorAttr.needsUpdate = true
  }
  return {
    setStatus: value => {
      if (value === 'Sadness') {
        color1 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_1
        color2 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_2
      } else if (value === 'Fury') {
        color1 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_1
        color2 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_2
      } else {
        color1 = WINDOW_COLORS_SUMMARY.LIMIT_1
        color2 = WINDOW_COLORS_SUMMARY.LIMIT_2
      }
      console.log('battleUI', value, color1, color2)
      refreshLimitColours()
    },
    setLimit: value => {
      if (lValue !== value) {
        if (lValue === 0xff) {
          stopLimitBarTween(l1)
          stopLimitBarTween(l2)
          refreshLimitColours()
        }
        lValue = value
        const percent = lValue / 0xff
        l1.position.x = x + 3 + (w / 2) * percent
        l1.scale.set(percent, 1, 1)
        l2.position.x = x + 3 + (w / 2) * percent
        l2.scale.set(percent, 1, 1)
        if (lValue === 0xff) {
          addLimitBarTween(l1, BATTLE_TWEEN_UI_GROUP)
          addLimitBarTween(l2, BATTLE_TWEEN_UI_GROUP)
        }
      }
    },
    get: () => lValue
  }
}
const addTurnTimer = (dialog, x, y, id) => {
  addImageToDialog(
    dialog,
    'bars',
    'battle',
    `${id}`,
    x,
    y,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )

  const w = 32

  // Set default colours
  let color1 = WINDOW_COLORS_SUMMARY.TURN_1 // Colours not correct
  let color2 = WINDOW_COLORS_SUMMARY.TURN_2
  const t1 = addShape(
    dialog,
    color1,
    `${id}-l1`,
    x + 3,
    y - 7,
    w,
    2.5,
    THREE.AdditiveBlending
  )
  const t2 = addShape(
    dialog,
    color2,
    `${id}-l2`,
    x + 3,
    y - 4.5,
    w,
    2.5,
    THREE.AdditiveBlending
  )
  let tValue = -1
  let defaultColor1 = WINDOW_COLORS_SUMMARY.TURN_1
  let defaultColor2 = WINDOW_COLORS_SUMMARY.TURN_2
  let activeTurnTween = null
  const refreshTurnColours = () => {
    const l1ColorAttr = t1.geometry.getAttribute('color')
    for (let i = 0; i < color1.length; i++) {
      const color = new THREE.Color(color1[i])
      l1ColorAttr.setXYZ(i, color.r, color.g, color.b)
    }
    l1ColorAttr.needsUpdate = true

    const l2ColorAttr = t2.geometry.getAttribute('color')
    for (let i = 0; i < color2.length; i++) {
      const color = new THREE.Color(color2[i])
      l2ColorAttr.setXYZ(i, color.r, color.g, color.b)
    }
    l2ColorAttr.needsUpdate = true
  }
  return {
    setStatus: value => {
      // TODO - This is not updating
      if (value === 'Haste') {
        defaultColor1 = WINDOW_COLORS_SUMMARY.TURN_HASTE_1
        defaultColor2 = WINDOW_COLORS_SUMMARY.TURN_HASTE_2
      } else if (value === 'Slow') {
        defaultColor1 = WINDOW_COLORS_SUMMARY.TURN_SLOW_1
        defaultColor2 = WINDOW_COLORS_SUMMARY.TURN_SLOW_2
      } else {
        defaultColor1 = WINDOW_COLORS_SUMMARY.TURN_1
        defaultColor2 = WINDOW_COLORS_SUMMARY.TURN_2
      }
      if (tValue !== 0xffff) {
        color1 = defaultColor1
        color2 = defaultColor2
      }
      refreshTurnColours()
      // console.log('battleUI', 'setStatus', value, defaultColor1, color1)
    },
    set: value => {
      if (tValue !== value) {
        if (tValue === 0xffff) {
          color1 = defaultColor1
          color2 = defaultColor2
          refreshTurnColours()
          // console.log('battleUI', 'set FROM 0xFFFF', value, defaultColor1, color1)
        }
        tValue = value
        const percent = tValue / 0xffff
        t1.position.x = x + 3 + (w / 2) * percent
        t1.scale.set(percent, 1, 1)
        t2.position.x = x + 3 + (w / 2) * percent
        t2.scale.set(percent, 1, 1)
        // console.log('battleUI', 'set', value, defaultColor1, color1)
        if (tValue === 0xffff) {
          color1 = WINDOW_COLORS_SUMMARY.TURN_FULL_1
          color2 = WINDOW_COLORS_SUMMARY.TURN_FULL_2
          refreshTurnColours()
          // console.log('battleUI', 'set TO 0xFFFF', value, defaultColor1, color1)
        }
      }
    },
    setActive: isActive => {
      if (isActive) {
        color1 = WINDOW_COLORS_SUMMARY.TURN_ACTIVE_1
        color2 = WINDOW_COLORS_SUMMARY.TURN_ACTIVE_2
        refreshTurnColours()
        const from = { v: 0 }
        const to = { v: [1, 0] }
        activeTurnTween = new TWEEN.Tween(from, BATTLE_TWEEN_UI_GROUP)
          .to(to, 1000)
          .repeat(Infinity)
          .onUpdate(() => {
            t1.material.opacity = from.v
            t2.material.opacity = from.v
          })
          .onStop(() => {
            t1.material.opacity = 1
            t2.material.opacity = 1
          })
          .onComplete(() => {
            t1.material.opacity = 1
            t2.material.opacity = 1
          })
          .start()
      } else {
        if (activeTurnTween) {
          activeTurnTween.stop()
          BATTLE_TWEEN_UI_GROUP.remove(activeTurnTween)
          activeTurnTween = null
        }
        color1 = WINDOW_COLORS_SUMMARY.TURN_FULL_1
        color2 = WINDOW_COLORS_SUMMARY.TURN_FULL_2
        refreshTurnColours()
      }
    },
    get: () => tValue
  }
}
const addPlayerName = (group, name, id, x, y) => {
  addTextToDialog(
    group,
    name,
    id,
    LETTER_TYPES.BattleBaseFont,
    LETTER_COLORS.White,
    x,
    y,
    0.5,
    null,
    null,
    true
  )
  const playerNameGrey = addTextToDialog(
    group,
    name,
    id,
    LETTER_TYPES.BattleBaseFont,
    LETTER_COLORS.Gray,
    x,
    y,
    0.5,
    null,
    null,
    true
  )
  playerNameGrey.visible = false
  let playerNameTween = null
  return {
    setActive: isActive => {
      if (!isActive) {
        playerNameGrey.visible = false
        if (playerNameTween) {
          playerNameTween.stop()
          BATTLE_TWEEN_UI_GROUP.remove(playerNameTween)
          playerNameTween = null
        }
      } else {
        const from = { v: 0 }
        const to = { v: 1 }
        let visible = false
        playerNameTween = new TWEEN.Tween(from, BATTLE_TWEEN_UI_GROUP)
          .to(to, 500) // Is time ok?
          .repeat(Infinity)
          .onUpdate(() => {
            let shouldChange = false
            if (from.v < 0.5) {
              if (visible !== true) {
                visible = true
                shouldChange = true
              }
            } else {
              if (visible !== false) {
                visible = false
                shouldChange = true
              }
            }
            if (shouldChange) playerNameGrey.visible = visible
          })
          .onStop(() => {
            playerNameGrey.visible = false
          })
          .onComplete(() => {
            playerNameGrey.visible = false
          })
          .start()
      }
    }
  }
}

const addPauseMenu = () => {
  const pause = createDialogBox({
    id: 1,
    x: 141,
    y: 83,
    w: 44,
    h: 24,
    expandInstantly: true,
    noClipping: true,
    scene: orthoScene
  })
  pause.visible = false
  addTextToDialog(
    pause,
    'Pause',
    'pause-label-white',
    LETTER_TYPES.BattleBaseFont,
    LETTER_COLORS.White,
    148,
    99,
    0.5,
    null,
    null,
    true
  )
  const pauseGrey = addTextToDialog(
    pause,
    'Pause',
    'pause-label-grey',
    LETTER_TYPES.BattleBaseFont,
    LETTER_COLORS.Gray,
    148,
    99,
    0.5,
    null,
    null,
    true
  )
  pauseGrey.visible = false
  let pauseAnimInterval = null
  return {
    start: () => {
      clearInterval(pauseAnimInterval)
      pauseAnimInterval = setInterval(() => {
        pauseGrey.visible = !pauseGrey.visible
      }, 560)
      pause.visible = true
    },
    stop: () => {
      clearInterval(pauseAnimInterval)
      pauseAnimInterval = null
      pause.visible = false
    }
  }
}
const addBattleDescriptionsTextMenu = () => {
  const helper = createDialogBox({
    id: 28,
    x: 0,
    y: 166 - 24,
    w: 320,
    h: 24,
    expandInstantly: true,
    noClipping: true,
    scene: orthoScene,
    isSemiTransparent: true,
    toggleSpecial: true
  })
  let helperText = null
  helper.visible = window.data.savemap.config.battleDescriptions.Active
  const save = () => {
    window.data.savemap.config.battleDescriptions.Active = helper.visible
    window.data.savemap.config.battleDescriptions.Inactive = !helper.visible
  }
  return {
    setText: (text, showSpecialColors) => {
      helper.userData.bg.visible = !showSpecialColors
      helper.userData.bgSpecial.visible = showSpecialColors === true
      if (helperText) helper.remove(helperText)
      if (text === undefined) text = ''
      helperText = addTextToDialog(
        helper,
        text,
        'battle-descriptions-text',
        LETTER_TYPES.BattleBaseFont,
        LETTER_COLORS.White,
        160,
        166 - 8,
        0.5,
        null,
        ALIGN.CENTRE,
        true
      )
    },
    show: () => {
      helper.visible = true
      save()
    },
    hide: () => {
      helper.visible = false
      save()
    },
    toggle: () => {
      helper.visible = !helper.visible
      save()
    }
  }
}
const addFlashPlane = () => {
  const geometry = new THREE.PlaneGeometry(
    window.config.sizing.width * 2,
    window.config.sizing.height * 2
  )
  const material = new THREE.MeshBasicMaterial({
    // transparent: true,
    // opacity: 0.5,
    vertexColors: true
  })

  const white = new THREE.Color(0xffffff)
  const colors = []
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    colors.push(white.r, white.g, white.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const mesh = new THREE.Mesh(geometry, material)
  mesh.visible = false
  mesh.position.z = 4
  mesh.userData.quickFlash = async () => {
    mesh.visible = true
    await tweenSleep(1000 / 30)
    mesh.visible = false
  }

  window.flashPlane = mesh
  orthoScene.add(mesh)

  return mesh
}
const addBattleStartPlane = () => {
  const gapShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      middlePosition: { value: 0.67 },
      gap: { value: 0.0 },
      distance: { value: 0.1 }
    },

    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float middlePosition;
      uniform float distance;
      uniform float gap;
  
      void main() {
        float alpha;
        vec3 color = vec3(0.0); // Default black color
        
        float topThreshold = middlePosition + distance + gap; // Top threshold for solid black
        float bottomThreshold = middlePosition - distance - gap; // Bottom threshold for solid black
        
        if (vUv.y > middlePosition - distance + gap) {
          alpha = 1.0; // Solid black
        } else if (vUv.y > middlePosition - distance) {
          // Black to transparent gradient
          alpha = 1.0 - ((middlePosition - distance + gap - vUv.y) / distance);
        } 
        
        
        // Adjust alpha for the bottom half
        else if (vUv.y < middlePosition - distance - gap) {
          alpha = 1.0; // Solid black
        } else if (vUv.y < middlePosition - gap) {
          // Transparent to black gradient
          alpha = (middlePosition - gap - vUv.y) / distance;
          //alpha = 0.5;
        } 
        // The transition case (when vUv.y == middlePosition)
        else {
          alpha = 0.0; // Completely transparent
        }
  
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true
  })
  const gapMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(
      window.config.sizing.width * 2,
      window.config.sizing.height * 2
    ),
    gapShaderMaterial
  )
  gapMesh.position.x = window.config.sizing.width / 2
  gapMesh.position.y = window.config.sizing.height / 2
  gapMesh.position.z = 4
  orthoScene.add(gapMesh)

  const menuCoverShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      cutoff: { value: 0.5 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float cutoff;
  
      void main() {
        float alpha;
        vec3 color = vec3(0.0); // Default black color
        
        if (
          vUv.y > cutoff &&
          vUv.y < 1.0 - cutoff &&
          vUv.x > cutoff &&
          vUv.x < 1.0 - cutoff
        ) {
          alpha = 0.0;
        } else {
          alpha = 1.0;
        }
  
        gl_FragColor = vec4(color, alpha);
      }`,
    transparent: true
  })
  const menuCoverMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(window.config.sizing.width * 2, 56),
    menuCoverShaderMaterial
  )
  menuCoverMesh.position.x = window.config.sizing.width / 2
  menuCoverMesh.position.y = 56 / 2 + 18
  menuCoverMesh.position.z = 96
  orthoScene.add(menuCoverMesh)

  gapMesh.userData.triggerUncovering = () => {
    gapMesh.visible = true
    gapShaderMaterial.uniforms.gap.value = 0.0
    const t = new TWEEN.Tween(
      gapShaderMaterial.uniforms.gap,
      BATTLE_TWEEN_UI_GROUP
    )
      .to({ value: 0.5 }, 3500)
      .onComplete(() => {
        BATTLE_TWEEN_UI_GROUP.remove(t)
        gapMesh.visible = false
        disposeAll(gapMesh)
      })
      .start()

    menuCoverMesh.visible = true
    menuCoverShaderMaterial.uniforms.cutoff.value = 0.5
    const t2 = new TWEEN.Tween(
      menuCoverShaderMaterial.uniforms.cutoff,
      BATTLE_TWEEN_UI_GROUP
    )
      .to({ value: 0.0 }, 2000)
      .onComplete(() => {
        BATTLE_TWEEN_UI_GROUP.remove(t2)
        menuCoverMesh.visible = false
        disposeAll(menuCoverMesh)
      })
      .start()
  }
  return gapMesh
}

const addBattleTextMenu = () => {
  // TODO - Sometimes it can be special colours
  const textGroup = createDialogBox({
    id: 28,
    x: 16,
    y: 8,
    w: 320 - 32,
    h: 24,
    expandInstantly: true,
    noClipping: true,
    scene: orthoScene,
    isSemiTransparent: true
  })
  let battleText = null
  const textGroupSpecial = createDialogBox({
    id: 28,
    x: 16,
    y: 8,
    w: 320 - 32,
    h: 24,
    expandInstantly: true,
    noClipping: true,
    scene: orthoScene,
    isSemiTransparent: true,
    colors: WINDOW_COLORS_SUMMARY.DIALOG_SPECIAL
  })
  let battleTextSpecial = null
  const messageQueue = []
  let messageIsBeingDisplayed = false
  const processMessageQueue = async () => {
    if (messageIsBeingDisplayed) return
    while (messageQueue.length > 0) {
      messageIsBeingDisplayed = true
      const { text, isSpecial } = messageQueue.shift()
      if (isSpecial) {
        if (battleTextSpecial) textGroupSpecial.remove(battleTextSpecial)
        battleTextSpecial = addTextToDialog(
          textGroupSpecial,
          text,
          'battle-descriptions-text',
          LETTER_TYPES.BattleBaseFont,
          LETTER_COLORS.White,
          160,
          24,
          0.5,
          null,
          ALIGN.CENTRE,
          true
        )
        textGroupSpecial.visible = true
        await tweenSleep(2000) // TODO - Seems to be fixed regardless of speed - Eg, hit a limit
        textGroupSpecial.visible = false
      } else {
        if (battleText) textGroup.remove(battleText)
        battleText = addTextToDialog(
          textGroup,
          text,
          'battle-descriptions-text',
          LETTER_TYPES.BattleBaseFont,
          LETTER_COLORS.White,
          160,
          24,
          0.5,
          null,
          ALIGN.CENTRE,
          true
        )
        textGroup.visible = true
        const speed =
          (255 - window.data.savemap.config.battleMessageSpeed) * 16 + 512 // TODO - This is a guess
        await tweenSleep(speed)
        textGroup.visible = false
      }
    }
    messageIsBeingDisplayed = false
  }
  return {
    showBattleMessage: async (text, isSpecial) => {
      if (text === undefined) text = ''
      messageQueue.push({ text, isSpecial })
      processMessageQueue()
    }
  }
}
const addHP = (group, x, y, id) => {
  const text = addTextToDialog(
    group,
    '   0/   0',
    `${id}-text`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    x + 0,
    y - 2,
    0.5,
    null,
    null,
    true
  )
  const bg1 = addShape(
    group,
    WINDOW_COLORS_SUMMARY.BG_1,
    `${id}-bg-1`,
    x,
    y - 2,
    60,
    1
  )
  const bg2 = addShape(
    group,
    WINDOW_COLORS_SUMMARY.BG_2,
    `${id}-bg-2`,
    x,
    y - 1,
    60,
    1
  )
  const bar = addShape(
    group,
    WINDOW_COLORS_SUMMARY.HP,
    `${id}-bar`,
    x,
    y - 2,
    60,
    1
  )
  // console.log('battleUI hp', text, bg1, bg2, bar)
  const values = { current: 0, max: 0 }
  const update = (newCurrent, newMax) => {
    const percent = newCurrent / newMax
    const isCritical = percent <= 0.1
    const newText = `${('' + newCurrent).padStart(4, ' ')}/${(
      '' + newMax
    ).padStart(4, ' ')}`.split('')
    for (const [i, letter] of newText.entries()) {
      // console.log('battleUI letter', letter)
      const textureLetter = getLetterTexture(
        letter,
        LETTER_TYPES.BattleTextStats,
        i < 4 && isCritical ? LETTER_COLORS.Yellow : LETTER_COLORS.White
      ).texture
      // console.log('battleUI set', letter, text.children[i].material.map === textureLetter)
      if (text.children[i].material.map !== textureLetter) {
        text.children[i].material.map = textureLetter
        text.children[i].material.needsUpdate = true
      }
    }
    bar.position.x = x + 30 * percent
    bar.scale.set(percent, 1, 1)
  }
  let textTween = null
  return {
    set: (newCurrent, newMax, instant) => {
      if (instant) {
        update(newCurrent, newMax)
        values.current = newCurrent
        values.max = newMax
      } else {
        textTween = new TWEEN.Tween(values, BATTLE_TWEEN_UI_GROUP)
          .to({ current: newCurrent, max: newMax }, 250) // TODO I'm not sure if this is always same speed, I don't think it is
          .onUpdate(() => {
            update(Math.trunc(values.current), Math.trunc(values.max))
          })
          .onStop(() => {
            BATTLE_TWEEN_UI_GROUP.remove(textTween)
          })
          .onComplete(() => {
            BATTLE_TWEEN_UI_GROUP.remove(textTween)
          })
          .start()
      }
    }
  }
}
const addMP = (group, x, y, id) => {
  const text = addTextToDialog(
    group,
    '   0',
    `${id}-text`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    x + 1,
    y - 2,
    0.5,
    null,
    null,
    true
  )
  const bg1 = addShape(
    group,
    WINDOW_COLORS_SUMMARY.BG_1,
    `${id}-bg-1`,
    x,
    y - 2,
    30,
    1
  )
  const bg2 = addShape(
    group,
    WINDOW_COLORS_SUMMARY.BG_2,
    `${id}-bg-2`,
    x,
    y - 1,
    30,
    1
  )
  const bar = addShape(
    group,
    WINDOW_COLORS_SUMMARY.MP,
    `${id}-bar`,
    x,
    y - 2,
    30,
    1
  )
  // console.log('battleUI mp', text, bg1, bg2, bar)
  const values = { current: 0, max: 0 }
  const update = (newCurrent, newMax) => {
    const percent = newCurrent / newMax
    const isCritical = percent <= 0.1
    const newText = ('' + newCurrent).padStart(4, ' ').split('')
    for (const [i, letter] of newText.entries()) {
      const textureLetter = getLetterTexture(
        letter,
        LETTER_TYPES.BattleTextStats,
        i < 4 && isCritical ? LETTER_COLORS.Yellow : LETTER_COLORS.White
      ).texture
      // console.log('battleUI set', letter, text.children[i].material.map === textureLetter)
      if (text.children[i].material.map !== textureLetter) {
        text.children[i].material.map = textureLetter
        text.children[i].material.needsUpdate = true
      }
    }
    bar.position.x = x + 15 * percent
    bar.scale.set(percent, 1, 1)
  }
  let textTween = null
  return {
    set: (newCurrent, newMax, instant) => {
      if (instant) {
        update(newCurrent, newMax)
        values.current = newCurrent
        values.max = newMax
      } else {
        textTween = new TWEEN.Tween(values, BATTLE_TWEEN_UI_GROUP) // Not sure if this is 'paused' when game is paused
          .to({ current: newCurrent, max: newMax }, 250) // TODO I'm not sure if this is always same speed, I don't think it is
          .onUpdate(() => {
            update(Math.trunc(values.current), Math.trunc(values.max))
          })
          .onStop(() => {
            BATTLE_TWEEN_UI_GROUP.remove(textTween)
            textTween = null
          })
          .onComplete(() => {
            BATTLE_TWEEN_UI_GROUP.remove(textTween)
            textTween = null
          })
          .start()
      }
    }
  }
}
export {
  addPlayerName,
  addBattleBarrier,
  addBattleLimit,
  addTurnTimer,
  addPauseMenu,
  addBattleDescriptionsTextMenu,
  addBattleTextMenu,
  addHP,
  addMP,
  addFlashPlane,
  addBattleStartPlane
}
