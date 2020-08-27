import { KUJATA_BASE } from '../data/kernel-fetch-data.js'

const getSoundMetadata = async () => {
    const soundMetaRes = await fetch(`${KUJATA_BASE}/media/sounds/sounds-metadata.json`)
    const soundMeta = await soundMetaRes.json()
    return soundMeta
}

export {
    getSoundMetadata
}