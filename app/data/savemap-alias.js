import { getBankData, setBankData } from './savemap.js'


const setFieldPointersActive = (active) => {
    setBankData(13, 30, active ? 0x02 : 0x00)
}
const areFieldPointersActive = () => {
    return getBankData(13, 30)
}

const getCurrentCountdownClockTime = () => {
    return {
        h: getBankData(1, 20),
        m: getBankData(1, 21),
        s: getBankData(1, 22)
    }
}
const setCurrentCountdownClockTime = (h, m, s) => {
    setBankData(1, 20, h)
    setBankData(1, 21, m)
    setBankData(1, 22, s)
}
const decrementCountdownClock = () => {
    let { h, m, s } = getCurrentCountdownClockTime()
    // console.log('decrementCountdownClock OLD', h, m, s)
    let activeCountdown = true
    if (h === 0 && m === 0 && s === 0) {
        activeCountdown = false
    }
    s--
    if (s < 0) {
        m--
        s = 59
    }
    if (m < 0) {
        h--
        m = 59
    }
    if (h < 0) {
        h--
        h = 0
    }
    if (activeCountdown) {
        setCurrentCountdownClockTime(h, m, s)
    }
    // console.log('decrementCountdownClock NEW', h, m, s, activeCountdown)
    return activeCountdown
}
const getCurrentDisc = () => {
    let disc = getBankData(13, 0)
    if (disc === 0) {
        setBankData(13, 0, 1)
        disc = getBankData(13, 0)
    }
    return disc
}
const setCurrentDisc = (disc) => {
    setBankData(13, 0, disc)
}
export {
    areFieldPointersActive,
    setFieldPointersActive,
    getCurrentCountdownClockTime,
    setCurrentCountdownClockTime,
    decrementCountdownClock,
    getCurrentDisc,
    setCurrentDisc
}