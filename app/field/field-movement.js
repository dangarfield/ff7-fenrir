import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { getModelByEntityName, getModelByEntityId, getModelByPartyMemberId, getDegreesFromTwoPoints } from './field-models.js'

const moveEntityWithoutAnimationOrRotation = async (entityName, x, y) => {
    await moveEntity(entityName, x / 4096, y / 4096, false, false)
}
const moveEntityWithAnimationAndRotation = async (entityName, x, y) => {
    await moveEntity(entityName, x / 4096, y / 4096, true, true)
}
const moveEntityWithoutAnimationButWithRotation = async (entityName, x, y) => {
    await moveEntity(entityName, x / 4096, y / 4096, true, false)
}
const moveEntityToEntityWithAnimationAndRotation = async (entityName, targetEntityId) => {
    // const model = getModelByEntityName(entityName)
    const targetModel = getModelByEntityId(targetEntityId)
    console.log('moveEntityToEntityWithAnimationAndRotation', targetModel)
    if (targetModel.scene.visible) {
        await moveEntity(entityName, targetModel.scene.position.x, targetModel.scene.position.y, true, true)
    }
}
const moveEntityToPartyMemberWithAnimationAndRotation = async (entityName, targetPartyMemberId) => {
    const targetModel = getModelByPartyMemberId(targetPartyMemberId)
    console.log('moveEntityToPartyMemberWithAnimationAndRotation', targetModel)
    if (targetModel.scene.visible) {
        await moveEntity(entityName, targetModel.scene.position.x, targetModel.scene.position.y, true, true)
    }
}
const moveEntity = async (entityName, x, y, rotate, animate) => {
    const model = getModelByEntityName(entityName)
    const speed = model.userData.movementSpeed
    console.log('moveEntity', entityName, x, y, rotate, animate, speed, model)

    console.log('current position', model.scene.position.x, model.scene.position.y)
    const directionDegrees = getDegreesFromTwoPoints(model.scene.position, { x: x, y: y })
    console.log('directionDegrees', directionDegrees)

    const from = { x: model.scene.position.x, y: model.scene.position.y }
    const to = { x: x, y: y }
    const distance = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2))
    const time = distance * model.userData.movementSpeed * 4 // TODO - Look at this properly, not sure of the scale here
    console.log('distance', from.x - to.x, from.y - to.y,
        Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2),
        distance, time
    )
    if (rotate && model.userData.rotationEnabled) {
        model.scene.rotation.y = THREE.Math.degToRad(directionDegrees)
    }
    if (animate) {
        model.mixer.stopAllAction()
        model.mixer.clipAction(model.animations[window.currentField.playerAnimations.run]).play()
    }
    let lastZ = model.scene.position.z
    return new Promise(async (resolve) => {
        new TWEEN.Tween(from)
            .to(to, time)
            .onUpdate(function () {
                // Find the z position
                let movementRay = new THREE.Raycaster()
                const rayO = new THREE.Vector3(from.x, from.y, lastZ + 0.01)
                const rayD = new THREE.Vector3(0, 0, -1).normalize()
                movementRay.set(rayO, rayD)
                movementRay.far = 0.02
                let intersects = movementRay.intersectObjects([window.currentField.walkmeshMesh])
                // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
                // window.currentField.fieldScene.add(new THREE.ArrowHelper(movementRay.ray.direction, movementRay.ray.origin, movementRay.far, 0xff00ff)) // For debugging walkmesh raycaster
                if (intersects.length === 0) {
                } else {
                    const point = intersects[0].point
                    // Adjust nextPosition height to adjust for any slopes
                    lastZ = point.z
                    model.scene.userData.triangleId = intersects[0].object.userData.triangleId
                }

                // Update the model position
                model.scene.position.x = from.x
                model.scene.position.y = from.y
                model.scene.position.z = lastZ
            })
            .onComplete(function () {
                console.log('move: END', from)
                if (animate) {
                    model.mixer.stopAllAction()
                }
                // model.mixer.clipAction(window.currentField.playerAnimations.walk).play()
                resolve()
            })
            .start()
    })
}

const getEntityPositionTriangle = (entityId) => {
    const model = getModelByEntityId(entityId)
    console.log('getEntityPositionTriangle', entityId, model)
    return model.scene.userData.triangleId ? model.scene.userData.triangleId : -1
}
const getEntityPositionXY = (entityId) => {
    const model = getModelByEntityId(entityId)
    console.log('getEntityPositionXY', entityId, model)
    return {
        x: Math.floor(model.scene.position.x * 4096),
        y: Math.floor(model.scene.position.y * 4096),
    }
}
const getEntityPositionXYZTriangle = (entityId) => {
    const model = getModelByEntityId(entityId)
    console.log('getEntityPositionXYZTriangle', entityId, model)
    return {
        x: Math.floor(model.scene.position.x * 4096),
        y: Math.floor(model.scene.position.y * 4096),
        z: Math.floor(model.scene.position.z * 4096),
        triangleId: model.scene.userData.triangleId ? model.scene.userData.triangleId : -1
    }
}
const getPartyMemberPositionXYZTriangle = (partyMemberId) => {
    const model = getModelByPartyMemberId(partyMemberId)
    console.log('getPartyMemberPositionXYZTriangle', partyMemberId, model)
    return {
        x: Math.floor(model.scene.position.x * 4096),
        y: Math.floor(model.scene.position.y * 4096),
        z: Math.floor(model.scene.position.z * 4096),
        triangleId: model.scene.userData.triangleId ? model.scene.userData.triangleId : -1
    }
}
const setTriangleBoundaryMovementAllowed = (triangleId, allowed) => {
    console.log('setTriangleBoundaryMovementAllowed', triangleId, allowed)

    // walkmeshMeshTriangle.userData.triangleId = i
    // walkmeshMeshTriangle.userData.movementAllowed = true
    const mesh = window.currentField.walkmeshMesh.children.filter(m => m.userData.triangleId === triangleId)[0]
    console.log('mesh: START', mesh, mesh.userData)
    mesh.userData.movementAllowed = allowed
    console.log('mesh: END', mesh.userData)
}

export {
    moveEntityWithAnimationAndRotation,
    moveEntityWithoutAnimationOrRotation,
    moveEntityWithoutAnimationButWithRotation,
    moveEntityToEntityWithAnimationAndRotation,
    moveEntityToPartyMemberWithAnimationAndRotation,
    getEntityPositionTriangle,
    getEntityPositionXY,
    getEntityPositionXYZTriangle,
    getPartyMemberPositionXYZTriangle,
    setTriangleBoundaryMovementAllowed
}