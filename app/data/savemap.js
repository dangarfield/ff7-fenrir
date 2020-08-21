const initNewSaveMap = () => {
    console.log('initNewSaveMap: START')
    // console.log('window.data.kernel', window.data.kernel)
    window.data.savemap = Object.assign({}, window.data.kernel.initData.data)
    console.log('window.data.savemap', window.data.savemap)
    console.log('initNewSaveMap: END')
}

export {
    initNewSaveMap
}