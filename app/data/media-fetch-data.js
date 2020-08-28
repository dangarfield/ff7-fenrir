import { KUJATA_BASE } from '../data/kernel-fetch-data.js'

const getSoundMetadata = async () => {
    const soundMetaRes = await fetch(`${KUJATA_BASE}/media/sounds/sounds-metadata.json`)
    const soundMeta = await soundMetaRes.json()
    return soundMeta
}
const getMovieMetadata = async () => {
    const movieMetaRes = await fetch(`${KUJATA_BASE}/media/movies/movies.json`)
    const movieMeta = await movieMetaRes.json()
    return movieMeta
}

export {
    getSoundMetadata,
    getMovieMetadata
}