// Global Objects - Improve in a better way another time

window.currentField // Contains field data

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
        factor: 1  // Set to 0 to scale to available viewport size
    },
    debug: {
        active: true,
        showDebugCamera: false,
        showWalkmeshMesh: false,
        showWalkmeshLines: true,
        showBackgroundLayers: true,
        showModelHelpers: false,
        showAxes: false,
        runByDefault: true
    },
    raycast: {
        active: false,
        raycaster: undefined,
        mouse: undefined,
        raycasterHelper: undefined
    }
}

if (window.config.sizing.factor === 0) {
    const width = window.innerWidth || document.documentElement.clientWidth ||
        document.body.clientWidth
    const height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight
    window.config.sizing.factor = Math.min(width / window.config.sizing.width, height / window.config.sizing.height)
    // console.log('Set window sizing factor', width, height, window.config.sizing.factor)
}