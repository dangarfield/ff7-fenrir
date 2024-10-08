// Global Objects - Improve in a better way another time

window.libraries = {
  howler: {
    Howl: window.Howl,
    Howler: window.Howler
  },
  async: window.async
}
console.log('window.libraries', window.Howler)

window.developerMode = window.location.host.includes('localhost')

window.currentField = {} // Contains field data

window.anim = {
  container: undefined,
  stats: undefined,
  gui: undefined,
  clock: undefined,
  renderer: undefined,
  axesHelper: undefined,
  activeScene: undefined
}

window.config = {
  sizing: {
    width: 320,
    height: 240,
    factor: 2 // 2.67 // Set to 0 to scale to available viewport size
  },
  debug: {
    active: true,
    debugModeNoOpLoops: window.location.search.includes('debug'),
    showDebugCamera: false,
    showWalkmeshMesh: false,
    showWalkmeshLines: false,
    showBackgroundLayers: true,
    showModelHelpers: false,
    showAxes: false,
    showMovementHelpers: false,
    runByDefault: true
  },
  raycast: {
    active: false,
    raycaster: undefined,
    mouse: undefined,
    raycasterHelper: undefined
  },
  save: {
    cardId: 1,
    slotId: 1
  },
  saveAnywhere: window.developerMode
}

window.data = {
  kernel: undefined,
  savemap: undefined
}

if (window.config.sizing.factor === 0) {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth
  const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  window.config.sizing.factor = Math.min(
    width / window.config.sizing.width,
    height / window.config.sizing.height
  )
  // console.log('Set window sizing factor', width, height, window.config.sizing.factor)
}
