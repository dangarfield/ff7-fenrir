import { getBankData, setBankData } from './savemap.js'

const areFieldPointersActive = () => {
    return getBankData(13, 30)
}
const setFieldPointersActive = (active) => {
    setBankData(13, 30, active ? 0x02 : 0x00)
}

export {
    areFieldPointersActive,
    setFieldPointersActive
}