import { showDebugText } from './menu-scene.js'
import { temporaryPHSMenuSetParty } from '../field/field-op-codes-party-helper.js'

const loadPartySelectMenu = async () => {
    console.log('loadPartySelectMenu')
    showDebugText('Party Select')
    temporaryPHSMenuSetParty()
}

export {
    loadPartySelectMenu
}