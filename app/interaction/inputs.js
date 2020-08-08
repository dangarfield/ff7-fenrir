let input = {
    up: false,
    right: false,
    down: false,
    left: false,
    x: false,
    o: false,
    square: false,
    triangle: false,
    l1: false,
    l2: false,
    r1: false,
    r2: false,
    select: false,
    start: false
}

const getActiveInputs = () => {
    return input
}
const setKeyPress = (keyCode, state) => {
    if (keyCode === 87) { // w -> up
        input.up = state
    } else if (keyCode === 68) { // d -> right
        input.right = state
    } else if (keyCode === 83) { // s -> down
        input.down = state
    } else if (keyCode === 65) { // a -> left
        input.left = state

    } else if (keyCode === 74) { // j -> X
        input.x = state
    } else if (keyCode === 75) { // k -> O
        input.o = state
    } else if (keyCode === 85) { // u -> Square
        input.square = state
    } else if (keyCode === 73) { // i -> Triangle
        input.triangle = state

    } else if (keyCode === 72) { // h -> L1
        input.l1 = state
    } else if (keyCode === 89) { // y -> L2
        input.l2 = state
    } else if (keyCode === 76) { // l -> R1
        input.r1 = state
    } else if (keyCode === 79) { // o -> R2
        input.r2 = state

    } else if (keyCode === 55) { // 7 -> Select
        input.select = state
    } else if (keyCode === 56) { // 8 -> Start
        input.start = state
    }
}
const setupInputs = () => {
    document.addEventListener('keydown', (e) => {
        setKeyPress(event.which, true)
    }, false)
    document.addEventListener('keyup', (e) => {
        setKeyPress(event.which, false)
    }, false)
}
export {
    setupInputs,
    getActiveInputs
}