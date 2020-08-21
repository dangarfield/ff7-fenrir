
const getConfigFieldMessageSpeed = () => { // 0-255 fast-slow
    return window.data.savemap.config.fieldMessageSpeed
}
const getConfigWindowColours = () => {
    return [
        // 'rgb(0,88,176)'
        `rgb(${window.data.savemap.config.windowColorTL})`,
        `rgb(${window.data.savemap.config.windowColorTR})`,
        `rgb(${window.data.savemap.config.windowColorBL})`,
        `rgb(${window.data.savemap.config.windowColorBR})`
    ]
}

export {
    getConfigFieldMessageSpeed,
    getConfigWindowColours
}