const changeBackgroundParamState = (param, state, isActive) => {
    // console.log('changeBackgroundParamState', param, state, isActive)
    const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.param === param && l.userData.state === state)
    bgLayers.map(l => l.visible = isActive)
}
const clearBackgroundParam = (param) => {
    // console.log('clearBackgroundParam', param)
    const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.param === param)
    bgLayers.map(l => l.visible = false)
}

export {
    changeBackgroundParamState,
    clearBackgroundParam
}