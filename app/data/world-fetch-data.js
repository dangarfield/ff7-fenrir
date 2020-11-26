import { KUJATA_BASE } from '../data/kernel-fetch-data.js'

const getFieldToWorldMapTransitionData = async () => {
    const dataRes = await fetch(`${KUJATA_BASE}/metadata/field-id-to-world-map-coords.json`)
    const data = await dataRes.json()
    return data
}
const getWorldToFieldTransitionData = async () => {
    const dataRes = await fetch(`${KUJATA_BASE}/data/wm/world_us.lgp/field.tbl.json`)
    const data = await dataRes.json()
    return data
}
const getSceneGraph = async () => {
    const dataRes = await fetch(`${KUJATA_BASE}/metadata/scene-graph.json`)
    const data = await dataRes.json()
    return data
}

export {
    getFieldToWorldMapTransitionData,
    getWorldToFieldTransitionData,
    getSceneGraph
}