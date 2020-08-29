import { KUJATA_BASE } from '../data/kernel-fetch-data.js'
import { getMovieMetadata } from '../data/media-fetch-data.js'
import { createVideoBackground } from '../field/field-ortho-bg-scene.js'

let movieMetadata
let movies = []
let nextMovie = {
    name: '',
    cameraData: {},
    frame: 0,
    video: undefined
}

const getMusicUrl = (name) => {
    return `${KUJATA_BASE}/media/movies/${name}.mp4`
}
const loadMovieMetadata = async () => {
    if (movieMetadata === undefined) {
        movieMetadata = await getMovieMetadata()
        console.log('movieMetadata', movieMetadata)
    }
}
const getMovieName = (i) => {
    return movieMetadata.disc1[i]
}
const loadMovie = (i) => {
    // Should really add a download progress loader
    // Although, this is only enough buffered to begin playback
    return new Promise(async (resolve, reject) => {
        const name = getMovieName(i)
        console.log('loadMovie', i, name)
        const video = document.createElement('video')
        video.src = getMusicUrl(getMovieName(i))
        video.load()
        video.oncanplay = () => {
            console.log(' - loadMovie canplay', name)
            resolve()
            movies.push({ name, video })
            console.log('movies', movies)
        }
    })
}
const setNextMovie = async (i) => {
    // Need to find out which 'disc' the user is on to play the right video
    // Disc one - game moment <= 669 ??? - I think this is a bad idea as there will 
    // Ideally this will also work when changing fields
    // So I potentially COULD hardcode the field names for the disc 2, 3 videos...
    // For now, just assume everything is disc 1 and I'll fix later

    console.log('setNextMovie', movieMetadata, movieMetadata.disc1, i)
    nextMovie.name = getMovieName(i)
    nextMovie.cameraData = await getCameraData(nextMovie.name)
    nextMovie.frame = 0
    nextMovie.video = movies.filter(v => v.name === nextMovie.name)[0].video
    console.log('nextMovie', nextMovie)

    // TODO: Setup videoCamera in position and get tweens ready
}
const getCameraData = async () => {
    // TBC
    return {}
}
const getCurrentMovieFrame = () => {
    return nextMovie.frame
}

const playNextMovie = async () => {
    // This needs to be sync, eg, halt the current script 
    // Characters can and will still move around, field music will continue unless explicitly stopped
    // This script also hides the hand pointer above players' head which needs reenabling after with SPECIAL:POINT
    // This script also has a camera attached to it from moveicam.lgp which needs to be decyphered
    // The movie cam is turned on and off with MVCAM, I'm not sure whether it is on by default if moviecam exists

    // TODO - Position of movie is not 100%, but I'm also not sure if the field position is ok either as it is a static camera in md1stin
    // TODO - Extract Video Camera data, create videoCamera and add to renderer and get videoBackground to follow camera
    // TODO - Something strange about AKAO2 music pan being set before and after VIDEO

    // Problem:
    // md1stin opening scene. dir entity Init stops music and then dir entity Main script starts the movie absolutely fine absolutely fine. The View entity init then looks for the movie frame (assume 6 frames per second) then after 664 frames (about 1m50s) starts the music (index 1). Index 0 = oa, index 1 = ob
    // The issue I'm having is that oa (music) is basically contains 1m50 of intro music (eg, from the movie with no train sound effects) and then it has same bombing mission loop (2m28) as ob.
    // So I'm thinking that the either:
    // - the offset loop is triggered oa is triggered after 1m50 instead of playing from beginning
    // - the oa music is actually triggered after 62 seconds so that the music and the video are in sync
    // - The AKAO2 music pan (akaoOp: 200, eg 0xC8) which gets triggered before and after the MOVIE (dir entity s0 Main script) actually contains a long (28672 and 32767) rather than 0-127 for a standard pan, so maybe its not a pan at all, but instead a pre-emptive music offset?
    // - Something else entirely

    return new Promise(async (resolve, reject) => {
        // Disable hand pointer

        // Hide all backgrounds
        window.currentField.backgroundLayers.visible = false

        // Create videotexture and place on scene
        createVideoBackground(nextMovie.video)
        window.currentField.backgroundVideo.visible = true
        console.log('window.currentField.backgroundVideo', window.currentField.backgroundVideo)
        // Swap to videoCamera (if relevant and start videoCamera position tweens)

        // Play video
        // nextMovie.video.currentTime = 114
        nextMovie.video.play()

        // Begin capturing frame
        const frameCaptureInterval = setInterval(() => { nextMovie.frame++ }, 1000 / 15) // Looks like 15 frames per second
        //frame 664 roughly equal to 117 seconds
        // Once video has finished
        nextMovie.video.onended = () => {
            console.log('video.onended', nextMovie.name)
            // - clear capture frame interval
            clearInterval(frameCaptureInterval)
            // - switch back to field camera
            // - destroy the objects in the backgroundVideo group
            console.log('window.currentField.backgroundVideo', window.currentField.backgroundVideo)
            window.currentField.backgroundVideo.remove(...window.currentField.backgroundVideo.children)
            console.log('window.currentField.backgroundVideo', window.currentField.backgroundVideo)

            // - make the background layers visible again
            window.currentField.backgroundLayers.visible = true
            // - Resolve the promise to proceed to the next script
            resolve()
        }
    })
}

export {
    loadMovieMetadata,
    setNextMovie,
    playNextMovie,
    loadMovie,
    getCurrentMovieFrame
}