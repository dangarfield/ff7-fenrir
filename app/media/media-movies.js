
import { getMovieMetadata } from '../data/media-fetch-data.js'

let movieMetadata
let nextMovie = {
    name: '',
    cameraData: {},
    frame: 0
}

const loadMovieMetadata = async () => {
    if (movieMetadata === undefined) {
        movieMetadata = await getMovieMetadata()
        console.log('movieMetadata', movieMetadata)
    }
}

const setNextMovie = async (i) => {
    // Need to find out which 'disc' the user is on to play the right video
    // Disc one - game moment <= 669 ??? - I think this is a bad idea as there will 
    // Ideally this will also work when changing fields
    // So I potentially COULD hardcode the field names for the disc 2, 3 videos...
    // For now, just assume everything is disc 1 and I'll fix later

    console.log('setNextMovie', movieMetadata, movieMetadata.disc1, i)
    nextMovie.name = movieMetadata.disc1[i]
    nextMovie.cameraData = await getCameraData(nextMovie.name)
    nextMovie.frame = 0
    console.log('nextMovie', nextMovie)
}
const getCameraData = async () => {
    // TBC
    return {}
}


export {
    loadMovieMetadata,
    setNextMovie
}