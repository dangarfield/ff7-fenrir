import { getBankData, setBankData } from './savemap.js'


const setFieldPointersActive = (active) => {
    setBankData(13, 30, active ? 0x02 : 0x00)
}
const areFieldPointersActive = () => {
    return getBankData(13, 30)
}

export {
    areFieldPointersActive,
    setFieldPointersActive
}