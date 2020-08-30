import { KUJATA_BASE } from '../data/kernel-fetch-data.js'

const getSoundMetadata = async () => {
    const soundMetaRes = await fetch(`${KUJATA_BASE}/media/sounds/sounds-metadata.json`)
    const soundMeta = await soundMetaRes.json()
    return soundMeta
}
const getMusicMetadata = async () => {
    const musicMetaRes = await fetch(`${KUJATA_BASE}/media/music/music-metadata.json`)
    const musicMeta = await musicMetaRes.json()
    return musicMeta
}
const getMovieMetadata = async () => {
    const movieMetaRes = await fetch(`${KUJATA_BASE}/media/movies/movies-metadata.json`)
    const movieMeta = await movieMetaRes.json()
    return movieMeta
}

export {
    getSoundMetadata,
    getMusicMetadata,
    getMovieMetadata
}