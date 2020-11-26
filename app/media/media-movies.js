import { KUJATA_BASE } from '../data/kernel-fetch-data.js'
import { getMovieMetadata, getMoviecamMetadata, getMoviecamData } from '../data/media-fetch-data.js'
import { createVideoBackground } from '../field/field-ortho-bg-scene.js'
import { setFieldPointersEnabled } from '../field/field-position-helpers.js'
import { getCurrentDisc } from '../data/savemap-alias.js'
import { updateVideoCameraPosition } from '../field/field-scene.js'
import { setFaderVisible } from '../field/field-fader.js'
import { setVisibilityForAllModels } from '../field/field-models.js'

let movieMetadata
let moviecamMetadata
let movies = []
let moviecams = []
let nextMovie = {
    name: '',
    cameraData: undefined,
    frame: 0,
    video: undefined
}
let movieLockEnabled = false

const isMovieLockEnabled = () => { return movieLockEnabled }
const setMovieLockEnabled = (enabled) => {
    movieLockEnabled = enabled
    console.log('setMovieLockEnabled', isMovieLockEnabled())
}
const getMusicUrl = (name) => {
    return `${KUJATA_BASE}/media/movies/${name}.mp4`
}
const loadMovieMetadata = async () => {
    if (movieMetadata === undefined) {
        movieMetadata = await getMovieMetadata()
        console.log('movieMetadata', movieMetadata)
    }
    if (moviecamMetadata === undefined) {
        moviecamMetadata = await getMoviecamMetadata()
        console.log('moviecamMetadata', moviecamMetadata)
    }
}
const getMovieName = (i) => {
    const disc = getCurrentDisc()
    console.log('getMovieName', `disc${disc}`, i, movieMetadata, movieMetadata[`disc${disc}`], movieMetadata[`disc${disc}`][i])
    return movieMetadata[`disc${disc}`][i]
}
const loadMoviecam = async (name) => {
    if (moviecamMetadata.includes(name)) {

        const camData = await getMoviecamData(name)
        moviecams.push({ name, camData })
        console.log('loadMoviecam moviecam', name, camData, moviecams)
    }
}
const loadMovie = (i) => {
    // Should really add a download progress loader
    // Although, this is only enough buffered to begin playback
    return new Promise(async (resolve) => {
        const name = getMovieName(i)
        console.log('loadMovie', i, name)
        await loadMoviecam(name)
        const video = document.createElement('video')
        video.setAttribute('crossorigin', 'anonymous')
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
// setTimeout(async () => {
//     console.log('moviecam TEST: START')
//     setNextMovie(20)
//     playNextMovie()
// }, 10000)

const setNextMovie = (i) => {
    // Need to find out which 'disc' the user is on to play the right video
    // Disc one - game moment <= 669 ??? - I think this is a bad idea as there will 
    // Ideally this will also work when changing fields
    // So I potentially COULD hardcode the field names for the disc 2, 3 videos...
    // For now, just assume everything is disc 1 and I'll fix later
    // Update - Save memory Bank D/E has 0x0EA4, 1 byte - Which game-play Disc is needed, could be used


    nextMovie.name = getMovieName(i)
    console.log('setNextMovie', movieMetadata, i, nextMovie.name)
    const potentialMoviecamList = moviecams.filter(c => c.name === nextMovie.name)
    if (potentialMoviecamList.length > 0) {
        nextMovie.cameraData = potentialMoviecamList[0].camData
        // Some camera data files are full of [0,0,0] coords. This appears to be the flag to not show the field models
        nextMovie.doNotUseModels = nextMovie.cameraData.length === nextMovie.cameraData.filter(f => f.xAxis.x === 0 && f.zoom === 0).length
    }
    nextMovie.frame = 0
    nextMovie.video = movies.filter(v => v.name === nextMovie.name)[0].video
    console.log('setNextMovie nextMovie', nextMovie)
    window.currentField.videoCamera = window.currentField.fieldCamera.clone()
    console.log('setNextMovie moviecam', window.currentField.videoCamera, window.currentField.fieldCamera)
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
        // Is movie lock on?
        console.log('playNextMovie isMovieLockEnabled', isMovieLockEnabled())
        if (isMovieLockEnabled()) {
            resolve()
            return
        }

        // Disable hand pointer
        setFieldPointersEnabled(false)

        // Create videotexture and place on scene
        createVideoBackground(nextMovie.video)

        console.log('playNextMovie nextMovie', nextMovie)

        // Register onplay and onend callbacks 
        let frameCaptureInterval
        nextMovie.video.onplay = () => {
            // Hide all backgrounds
            window.currentField.backgroundLayers.visible = false
            window.currentField.backgroundVideo.visible = true
            setFaderVisible(false)
            console.log('playNextMovie window.currentField.backgroundVideo', window.currentField.backgroundVideo, nextMovie.cameraData, window.currentField.allowVideoCamera)
            // Swap to videoCamera if applicable
            if (nextMovie.cameraData !== undefined && window.currentField.allowVideoCamera) {
                window.currentField.showVideoCamera = true // Override with op code
                if (nextMovie.doNotUseModels) {
                    setVisibilityForAllModels(false)
                }
            } else if (nextMovie.cameraData === undefined) {
                setVisibilityForAllModels(false)
            }

            // Begin capturing frame
            const fovAdjustment = window.currentField.metaData.assetDimensions.height / window.config.sizing.height
            frameCaptureInterval = setInterval(() => {
                if (nextMovie.cameraData !== undefined) {
                    if (window.currentField.allowVideoCamera) {
                        window.currentField.showVideoCamera = true
                    } else {
                        window.currentField.showVideoCamera = false
                    }
                    if (window.currentField.showVideoCamera) {
                        const positionData = nextMovie.cameraData[nextMovie.frame]
                        if (positionData) {
                            updateVideoCameraPosition(positionData, fovAdjustment)
                        }
                    }
                }
                nextMovie.frame++
            }, 1000 / 15) // Looks like 15 frames per second
        }

        // frame 664 roughly equal to 117 seconds
        // Once video has finished
        nextMovie.video.onended = () => {
            console.log('playNextMovie video.onended', nextMovie.name)
            // - clear capture frame interval
            clearInterval(frameCaptureInterval)
            // - switch back to field camera
            if (nextMovie.cameraData !== undefined) {
                window.currentField.showVideoCamera = false
                if (nextMovie.doNotUseModels) {
                    setVisibilityForAllModels(true)
                }
            } else if (nextMovie.cameraData === undefined) {
                setVisibilityForAllModels(true)
            }
            // - destroy the objects in the backgroundVideo group
            console.log('playNextMovie window.currentField.backgroundVideo', window.currentField.backgroundVideo)
            window.currentField.backgroundVideo.remove(...window.currentField.backgroundVideo.children)
            console.log('playNextMovie window.currentField.backgroundVideo', window.currentField.backgroundVideo)

            // - make the background layers visible again
            window.currentField.backgroundLayers.visible = true
            setFaderVisible(true)

            // - Resolve the promise to proceed to the next script
            resolve()
        }

        // Play video
        nextMovie.video.play()
    })
}

const stopCurrentMovie = async () => {
    nextMovie.video.stop() // onend should trigger once again
    nextMovie.frame = 0
}
const activateMovieCam = async (isActive) => {
    window.currentField.allowVideoCamera = isActive
}
export {
    loadMovieMetadata,
    setNextMovie,
    playNextMovie,
    stopCurrentMovie,
    loadMovie,
    getCurrentMovieFrame,
    isMovieLockEnabled,
    setMovieLockEnabled,
    activateMovieCam
}