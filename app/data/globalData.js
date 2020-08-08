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
        factor: 2
    },
    debug: {
        showDebugCamera: false,
        showWalkmeshMesh: false,
        showWalkmeshLines: true,
        showBackgroundLayers: true,
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