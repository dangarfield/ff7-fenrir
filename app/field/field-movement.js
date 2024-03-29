import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import {
  getModelByEntityId,
  getModelByPartyMemberId,
  getModelByCharacterName,
  getDegreesFromTwoPoints,
  turnModelToFaceEntity,
  turnModelToFaceDirection,
  setModelCollisionEnabled,
  setModelTalkEnabled,
  setModelVisibility,
  placeModel,
  setModelDirection
} from './field-models.js'
import { sleep } from '../helpers/helpers.js'
import {
  setCameraPosition,
  calculateViewClippingPointFromVector3,
  FIELD_TWEEN_GROUP
} from './field-scene.js'
import { updateCursorPositionHelpers } from './field-position-helpers.js'
import {
  updateCurrentTriangleId,
  getNextPositionRaycast, removeSplash, applySplash
} from './field-movement-player.js'
import { isMoviePlaying } from '../media/media-movies.js'

const moveEntityWithoutAnimationOrRotation = async (entityId, x, y) => {
  await moveEntity(entityId, x / 4096, y / 4096, false, false)
}
const moveEntityWithAnimationAndRotation = async (entityId, x, y) => {
  await moveEntity(entityId, x / 4096, y / 4096, true, true)
}
const moveEntityWithoutAnimationButWithRotation = async (entityId, x, y) => {
  await moveEntity(entityId, x / 4096, y / 4096, true, false)
}
const moveEntityToEntityWithAnimationAndRotation = async (
  entityId,
  targetEntityId
) => {
  const targetModel = getModelByEntityId(targetEntityId)
  console.log('moveEntityToEntityWithAnimationAndRotation', targetModel)
  await moveEntityToEntity(entityId, targetModel)
}
const moveEntityToPartyMemberWithAnimationAndRotation = async (
  entityId,
  targetPartyMemberId
) => {
  const targetModel = getModelByPartyMemberId(targetPartyMemberId)
  console.log('moveEntityToPartyMemberWithAnimationAndRotation', targetModel)
  await moveEntityToEntity(entityId, targetModel)
}
const moveEntityToEntity = async (entityId, targetModel) => {
  console.log('moveEntityToEntity', targetModel)
  if (targetModel.scene.visible) {
    // Move until they are within collision distance
    // TODO - Whilst moveEntity now takes into account the walkmesh, this really should have 'slippability'
    const sourceModel = getModelByEntityId(entityId)
    console.log(
      'moveEntityToEntity source',
      sourceModel,
      sourceModel.userData.collisionRadius,
      sourceModel.scene.position
    )
    console.log(
      'moveEntityToEntity target',
      targetModel,
      targetModel.userData.collisionRadius,
      targetModel.scene.position
    )
    const totalDistance = sourceModel.scene.position.distanceTo(
      targetModel.scene.position
    )
    const collisionDistance = 0.01 * 2 // TODO replace with userData collisionRadius (sourceModel.userData.collisionRadius + targetModel.userData.collisionRadius) / 4096
    const interpolationFactor = 1 - collisionDistance / totalDistance
    const collisionEdgeVector = new THREE.Vector3().lerpVectors(
      sourceModel.scene.position,
      targetModel.scene.position,
      interpolationFactor
    )
    console.log(
      'moveEntityToEntity distance',
      totalDistance,
      collisionDistance,
      interpolationFactor,
      collisionEdgeVector
    )
    await moveEntity(
      entityId,
      collisionEdgeVector.x,
      collisionEdgeVector.y,
      true,
      true
    )
  }
}
const moveEntityJump = async (entityId, x, y, triangleId, height) => {
  const triangle =
    window.currentField.data.walkmeshSection.triangles[triangleId].vertices
  const targetX = x / 4096
  const targetY = y / 4096
  const targetZ = (triangle[0].z + triangle[1].z + triangle[2].z) / 3 / 4096

  const model = getModelByEntityId(entityId)
  console.log(
    'moveEntityJump',
    entityId,
    triangleId,
    targetX,
    targetY,
    targetZ,
    model
  )
  // const directionDegrees = getDegreesFromTwoPoints(model.scene.position, { x: targetX, y: targetY })
  // model.scene.children[0].rotation.y = THREE.MathUtils.degToRad(directionDegrees) // TODO - Not sure if this works properly
  // Don't change direction degree - pillar_3 ba. Need to see if this breaks anything elsewhere

  const heightAdjustment = 0.00235 * height // 0.04 <-> 17 // TODO - Need to test with other JUMP heights
  const time = 35 * height // 600 <-> 17 // TODO - Need to test with other JUMP heights

  const fromXY = { x: model.scene.position.x, y: model.scene.position.y }
  const toXY = { x: targetX, y: targetY }

  const fromZ1 = { z: model.scene.position.z }
  const toZ1 = { z: targetZ + heightAdjustment }
  const fromZ2 = { z: targetZ + heightAdjustment }
  const toZ2 = { z: targetZ }

  return new Promise(resolve => {
    // A little messy, but I couldn't get different interpolations of different values working
    // This will do for the time being
    new TWEEN.Tween(fromXY, FIELD_TWEEN_GROUP)
      .to(toXY, time)
      .onUpdate(function () {
        console.log('moveEntityJump XY: UPDATE', fromXY)
        model.scene.position.x = fromXY.x
        model.scene.position.y = fromXY.y
        // TODO - Update camera position
        if (model.userData.isPlayableCharacter) {
          const relativeToCamera = calculateViewClippingPointFromVector3(
            window.currentField.playableCharacter.scene.position
          )
          console.log('setCameraPosition moveEntityJump')
          setCameraPosition(relativeToCamera.x, relativeToCamera.y)
        }
        updateCursorPositionHelpers()
      })
      .onComplete(function () {
        console.log('moveEntityJump XY: END', fromXY)
        // Disable the reverse 'move' on land
        if (model.userData.isPlayableCharacter) {
          console.log('moveEntityJump: land')
          const targetVector = new THREE.Vector3(targetX, targetY, targetZ)
          for (
            let i = 0;
            i < window.currentField.lineLines.children.length;
            i++
          ) {
            const line = window.currentField.lineLines.children[i]
            if (line.userData.enabled) {
              const linePos = line.geometry.getAttribute('position')
              const closestPointOnLine = new THREE.Line3(
                { x: linePos.getX(0), y: linePos.getY(0), z: linePos.getZ(0) },
                { x: linePos.getX(1), y: linePos.getY(1), z: linePos.getZ(1) }
              ).closestPointToPoint(targetVector, true, new THREE.Vector3())
              const distance = targetVector.distanceTo(closestPointOnLine)
              // const entityId = line.userData.entityId

              console.log('moveEntityJump: land', line.userData)
              if (distance < 0.01) {
                if (line.userData.triggered === false) {
                  line.userData.triggered = true
                  // lineMoveTriggered(entityId, line)
                }
              }
            }
          }
          updateCurrentTriangleId(model, model.scene.position)
        }
        resolve()
      })
      .start()

    new TWEEN.Tween(fromZ1, FIELD_TWEEN_GROUP)
      .to(toZ1, time / 2)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function () {
        console.log('moveEntityJump Z1: UPDATE', fromZ1)
        model.scene.position.z = fromZ1.z
      })
      .onComplete(function () {
        console.log('moveEntityJump Z1: END', fromZ1)
        new TWEEN.Tween(fromZ2, FIELD_TWEEN_GROUP)
          .to(toZ2, time / 2)
          .easing(TWEEN.Easing.Quadratic.In)
          .onUpdate(function () {
            console.log('moveEntityJump Z2: UPDATE', fromZ2)
            model.scene.position.z = fromZ2.z
          })
          .onComplete(function () {
            console.log('moveEntityJump Z2: END', fromZ2)
          })
          .start()
      })
      .start()
  })
}

const updateMoveEntityMovement = delta => {
  const RAY_HEIGHT = 0.1
  if (window.currentField.models) {
    for (let i = 0; i < window.currentField.models.length; i++) {
      const model = window.currentField.models[i]

      // if (model.userData.moveEntity && model.userData.entityName === 'ba') {
      if (model.userData.moveEntity) {
        removeSplash(model)
        const direction = getDegreesFromTwoPoints(model.scene.position, {
          x: model.userData.moveEntity.to.x,
          y: model.userData.moveEntity.to.y
        })
        console.log(
          'moveEntity updateMoveEntityMovement: START',
          model.userData.entityName,
          model.userData.moveEntity,
          direction
        )

        if (model.userData.moveEntity.rotate) {
          model.scene.children[0].rotation.y = THREE.MathUtils.degToRad(direction)
        }

        const SLIP_ANGLE_1 = 45
        const SLIP_ANGLE_2 = 89
        const directions = [
          direction,
          direction - SLIP_ANGLE_1,
          direction + SLIP_ANGLE_1,
          direction - SLIP_ANGLE_2,
          direction + SLIP_ANGLE_2
        ]
        let nextPosition
        let walkmeshFound = false
        console.log(
          'moveEntity updateMoveEntityMovement: speed',
          model.userData.entityName,
          delta,
          model.userData.moveEntity.speed,
          model.userData.moveEntity.speed * delta
        )
        // const speed = 0.0013//(window.currentField.data.model.header.modelScale / 4400) * delta//model.userData.moveEntity.speed * delta

        const speed = (model.userData.moveEntity.speed * delta) / 37809 // Factor seems ok // Not right on sininb41 - game moment 370

        // delta - 0.01630500005558133
        // speed - 0.0013 should be about this for barret
        // movement speed - 3072 barret
        // movement speed - 1024 default

        // movement speed * delta = 49.152
        // movememt speed * delta / factor =
        // factor = 37809

        for (let i = 0; i < directions.length; i++) {
          const potentialDirection = directions[i]
          const directionRadians = THREE.MathUtils.degToRad(180 - potentialDirection)
          const directionVector = new THREE.Vector3(
            Math.sin(directionRadians),
            Math.cos(directionRadians),
            0
          )
          nextPosition = model.scene.position
            .clone()
            .addScaledVector(directionVector, speed)
          // Need to add additional offset for NPC moves like in field-movement-player.js ???
          console.log(
            'moveEntity direction',
            model.userData.entityName,
            i,
            nextPosition,
            speed
          )

          const movementRay = new THREE.Raycaster()

          const rayO = new THREE.Vector3(
            nextPosition.x,
            nextPosition.y,
            nextPosition.z + RAY_HEIGHT
          )
          const rayD = new THREE.Vector3(0, 0, -1).normalize()
          movementRay.set(rayO, rayD)
          movementRay.far = RAY_HEIGHT * 2
          const intersects = movementRay.intersectObjects(
            window.currentField.walkmeshMesh.children
          )
          console.log(
            'moveEntity intersects',
            model.userData.entityName,
            intersects
          )
          if (window.config.debug.showMovementHelpers) {
            window.currentField.movementHelpers.add(
              new THREE.ArrowHelper(
                movementRay.ray.direction,
                movementRay.ray.origin,
                movementRay.far,
                0x229922
              )
            ) // For debugging walkmesh raycaster
          }
          if (intersects.length === 0) {
            // Player is off walkmap
            continue
          } else if (!intersects[0].object.userData.movementAllowed) {
            // Triangle locked through IDLCK
            continue
          } else {
            const intersect = getNextPositionRaycast(nextPosition)
            if (!intersect) {
              continue
            }
            // If movement starts walking off the edge, uncomment this
            updateCurrentTriangleId(model, model.scene.position)
            // const currentTriangleId = model.scene.userData.triangleId
            // const nextTriangleId = intersect.object.userData.triangleId
            // const nextTriangleMovementAllowed = currentTriangleId === nextTriangleId ? true : window.currentField.data.walkmeshSection.accessors[nextTriangleId].includes(currentTriangleId)
            // console.log('moveEntity nextTriangle', intersects, currentTriangleId, nextTriangleId, nextTriangleMovementAllowed)
            // if (!nextTriangleMovementAllowed && currentTriangleId !== undefined) {
            //     console.log('moveEntity nextTriangle STOP')
            //     continue
            // }

            nextPosition.z = intersect.point.z
            walkmeshFound = true

            break
          }
        }
        if (!walkmeshFound) {
          // console.log('no walkmesh found')
          model.mixer.stopAllAction()
          model.userData.moveEntity.resolve()
          delete model.userData.moveEntity
          return
        }

        // If walk/run is toggled, stop the existing window.animation
        for (let i = 0; i < model.animations.length; i++) {
          const animation = model.animations[i]
          if (i === model.userData.moveEntity.animationId) {
            model.mixer.clipAction(animation).play()
          } else {
            model.mixer.clipAction(animation).stop()
          }
        }

        // if (model.animations.length === 1) { // Edge case for single animation models - blackbg
        //     const action = model.mixer.clipAction(model.animations[window.currentField.playerAnimations.stand])
        //     action.loop = THREE.LoopRepeat
        //     action.play()
        // } else if (model.userData.moveEntity.animationId === 2 && model.animations[window.currentField.playerAnimations.run]) { // Run
        //     model.mixer.clipAction(model.animations[window.currentField.playerAnimations.stand]).stop() // Probably a more efficient way to change these animations
        //     model.mixer.clipAction(model.animations[window.currentField.playerAnimations.walk]).stop()
        //     const action = model.mixer.clipAction(model.animations[window.currentField.playerAnimations.run])
        //     action.loop = THREE.LoopRepeat
        //     action.play()
        // } else { // Walk
        //     model.mixer.clipAction(model.animations[window.currentField.playerAnimations.stand]).stop()
        //     if (model.animations[window.currentField.playerAnimations.run]) { model.mixer.clipAction(model.animations[window.currentField.playerAnimations.run]).stop() }
        //     const action = model.mixer.clipAction(model.animations[window.currentField.playerAnimations.walk])
        //     action.loop = THREE.LoopRepeat
        //     action.play()
        // }

        // There is movement, set next position
        model.scene.position.x = nextPosition.x
        model.scene.position.y = nextPosition.y
        model.scene.position.z = nextPosition.z
        applySplash(model)
        // Camera follow
        if (
          (window.currentField.fieldCameraFollowPlayer &&
            model.scene.uuid ===
              window.currentField.playableCharacter.scene.uuid) ||
          model.userData.cameraFollowMe
        ) {
          // Update camera position if this is the main character
          const relativeToCamera = calculateViewClippingPointFromVector3(
            model.scene.position
          )
          console.log('setCameraPosition moveEntity')
          setCameraPosition(relativeToCamera.x, relativeToCamera.y)
        }

        // Distance and resolve
        const distance =
          4096 *
          Math.sqrt(
            Math.pow(
              model.scene.position.x - model.userData.moveEntity.to.x,
              2
            ) +
              Math.pow(
                model.scene.position.y - model.userData.moveEntity.to.y,
                2
              )
          )
        console.log('moveEntity distance', model.userData.entityName, distance)
        if (distance < 8) { // Adðjust to 8 to fix jessie in nmkin_1
          console.log(
            'moveEntity updateMoveEntityMovement: END',
            model.userData.entityName
          )
          model.scene.position.x = model.userData.moveEntity.to.x
          model.scene.position.y = model.userData.moveEntity.to.y
          model.scene.position.z = nextPosition.z

          if (
            window.currentField.playableCharacter &&
            window.currentField.playableCharacter.userData &&
            model.scene.uuid ===
              window.currentField.playableCharacter.scene.uuid
          ) {
            updateCurrentTriangleId(model, model.scene.position)
          }

          const timeStart = model.userData.moveEntity.timeStart
          const timeEnd = new Date().getTime()
          const time = timeEnd - timeStart
          const distance = model.userData.moveEntity.distance
          console.log(
            'moveEntity TIME',
            model.userData.entityName,
            distance,
            time,
            'd/t',
            distance / time,
            's',
            model.userData.moveEntity.speed,
            '->',
            speed,
            's/d/t',
            model.userData.moveEntity.speed / (distance / time)
          )
          model.userData.moveEntity.resolve()
          delete model.userData.moveEntity
          model.mixer.stopAllAction()
          const action = model.mixer.clipAction(
            model.animations[window.currentField.playerAnimations.stand]
          )
          action.loop = THREE.LoopRepeat
          action.play()
        }
        applySplash(model)
      }
    }
  }
}
const moveEntity = async (entityId, x, y, rotate, animate, speedInFrames) => {
  const model = getModelByEntityId(entityId)
  console.log(
    'moveEntity: START',
    model.userData.entityName,
    entityId,
    x,
    y,
    rotate,
    animate,
    's',
    model.userData.movementSpeed,
    speedInFrames,
    model
  )

  const distance =
    4096 *
    Math.sqrt(
      Math.pow(model.scene.position.x - x, 2) +
        Math.pow(model.scene.position.y - y, 2)
    )
  const speed = model.userData.movementSpeed // This 'seems' ok, at least for modelScale 512 fields
  // TODO - Work out speedInFrames -> speed for JOIN and LEAVE
  let animationId = 2 // window.currentField.playerAnimations.run, is this applied globally?!
  if (speed < 1600) {
    animationId = 1 // window.currentField.playerAnimations.walk
  }
  // Ensure correct animation id is allocated, some models dont have all animation types
  while (model.animations.length < animationId) {
    animationId--
  }
  model.mixer.stopAllAction() // Stop all existing actions

  return new Promise(resolve => {
    model.userData.moveEntity = {
      to: { x, y },
      rotate,
      animate,
      speed,
      animationId,
      resolve,
      timeStart: new Date().getTime(),
      distance
    }
    console.log(
      'moveEntity: SET',
      model.userData.entityName,
      model.userData.moveEntity
    )
  })
}
// No longer used, will keep it here temporarily until I fix JOIN and LEAVE speed
// const moveEntityOld = async (
//   entityId,
//   x,
//   y,
//   rotate,
//   animate,
//   desiredSpeed,
//   desiredFrames,
//   enforceWalkmesh
// ) => {
//   const model = getModelByEntityId(entityId)
//   console.log(
//     'moveEntity: START',
//     model.userData.entityName,
//     entityId,
//     x,
//     y,
//     rotate,
//     animate,
//     model.userData.movementSpeed,
//     window.currentField.data.model.header.modelScale,
//     model
//   )

//   console.log(
//     'current position',
//     model.scene.position.x,
//     model.scene.position.y
//   )
//   const directionDegrees = getDegreesFromTwoPoints(model.scene.position, {
//     x,
//     y
//   })

//   // console.log('directionDegrees', directionDegrees, window.currentField.data.triggers.header.controlDirectionDegrees,
//   //     // 180 + (directionDegrees * -1)
//   // )

//   const from = { x: model.scene.position.x, y: model.scene.position.y }
//   const to = { x, y }
//   const distance =
//     4096 * Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2))
//   const speed =
//     (model.userData.movementSpeed / 8.6428) *
//     (window.currentField.data.model.header.modelScale / 512) // This 'seems' ok, at least for modelScale 512 fields
//   let time = (distance / speed) * 1000
//   console.log('moveEntity distance', distance)
//   console.log('speed', speed)
//   console.log(
//     'workings out',
//     entityId,
//     model.userData.entityName,
//     '-',
//     model.userData.movementSpeed,
//     window.currentField.data.model.header.modelScale,
//     'dst',
//     distance,
//     speed,
//     time
//   )
//   console.log('time', time)
//   // at 512 & 2048 - speed = 8192

//   let animationId = window.currentField.playerAnimations.run
//   // if ((desiredSpeed && desiredSpeed >= 30)) { // TODO - Set with 'JOIN' and 'SPLIT', need to look at again
//   if (
//     (desiredSpeed && desiredSpeed >= 30) ||
//     model.userData.movementSpeed < 1600
//   ) {
//     // TODO - Set with 'JOIN' and 'SPLIT', need to look at again
//     // time = 1000 / 30 * desiredSpeed
//     animationId = window.currentField.playerAnimations.walk
//   }

//   if (desiredFrames !== undefined) {
//     // Desired frames sets the absolute time of the movement
//     const distancePerFrame = distance / desiredFrames
//     console.log(
//       'moveEntity desired frames',
//       desiredFrames,
//       distance,
//       '->',
//       distancePerFrame
//     )
//     if (distancePerFrame >= 10) {
//       animationId = window.currentField.playerAnimations.run
//     } else {
//       animationId = window.currentField.playerAnimations.walk
//     }
//     time = (desiredFrames / 30) * 1000
//   }

//   // console.log('moveEntity animationId', animationId, model.userData.movementSpeed, desiredSpeed)
//   if (rotate && model.userData.rotationEnabled) {
//     model.scene.children[0].rotation.y = THREE.MathUtils.degToRad(directionDegrees)
//   }
//   if (animate && model.animations[animationId]) {
//     // console.log('stopAllAction C', model.userData.entityName)
//     model.mixer.stopAllAction()
//     const action = model.mixer.clipAction(model.animations[animationId])
//     action.setLoop(THREE.LoopRepeat)
//     action.userData = {
//       entityName: model.userData.entityName,
//       entityId,
//       animationId,
//       type: 'movement'
//     }
//     action.play()
//   }
//   let lastZ = model.scene.position.z

//   console.log('moveEntity READY', entityId, from, to, lastZ, distance, time)
//   return new Promise(async resolve => {
//     const moveTween = new TWEEN.Tween(from, FIELD_TWEEN_GROUP).to(to, time)
//     moveTween.onUpdate(function () {
//       // Find the z position
//       const movementRay = new THREE.Raycaster()
//       const rayO = new THREE.Vector3(from.x, from.y, lastZ + 0.01)
//       const rayD = new THREE.Vector3(0, 0, -1).normalize()
//       movementRay.set(rayO, rayD)
//       movementRay.far = 0.02

//       const intersects = movementRay.intersectObjects(
//         window.currentField.walkmeshMesh.children
//       )
//       // console.log('move UPDATE', entityId, intersects, from, to, lastZ)
//       // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
//       if (window.config.debug.showMovementHelpers) {
//         window.currentField.movementHelpers.add(
//           new THREE.ArrowHelper(
//             movementRay.ray.direction,
//             movementRay.ray.origin,
//             movementRay.far,
//             0x229922
//           )
//         ) // For debugging walkmesh raycaster
//       }
//       if (intersects.length === 0) {
//         console.log('moveEntity: no intersects')
//         // TWEEN.remove(moveTween)
//         if (enforceWalkmesh !== undefined && enforceWalkmesh) {
//           moveTween.stop()
//         }
//       } else {
//         console.log('moveEntity: intersects')
//         const point = intersects[0].point
//         lastZ = point.z
//         model.scene.userData.triangleId =
//           intersects[0].object.userData.triangleId

//         // Update the model position
//         model.scene.position.x = from.x
//         model.scene.position.y = from.y
//         model.scene.position.z = lastZ

//         // Camera follow
//         if (
//           model.scene.uuid ===
//             window.currentField.playableCharacter.scene.uuid &&
//           window.currentField.fieldCameraFollowPlayer
//         ) {
//           // Update camera position if this is the main character
//           const relativeToCamera = calculateViewClippingPointFromVector3(
//             model.scene.position
//           )
//           console.log('setCameraPosition moveEntity')
//           setCameraPosition(relativeToCamera.x, relativeToCamera.y)
//         }
//       }
//     })
//     moveTween.onStop(async () => {
//       console.log('moveEntity: END (COMPLETE)', entityId, from, to, lastZ)
//       if (animate) {
//         // console.log('stopAllAction D', model.userData.entityName)
//         model.mixer.stopAllAction()
//       }
//       if (model.userData.isPlayableCharacter) {
//         updateCurrentTriangleId(model, model.scene.position)
//       }
//       await sleep(1000 / 30)
//       // model.mixer.clipAction(window.currentField.playerAnimations.walk).play()
//       resolve()
//     })
//     moveTween.onComplete(async () => {
//       console.log('moveEntity: END (STOP)', entityId, from, to, lastZ)
//       if (animate) {
//         // console.log('stopAllAction D', model.userData.entityName)
//         model.mixer.stopAllAction()
//       }
//       if (model.userData.isPlayableCharacter) {
//         updateCurrentTriangleId(model, model.scene.position)
//       }
//       await sleep(1000 / 30)
//       // model.mixer.clipAction(window.currentField.playerAnimations.walk).play()
//       resolve()
//     })
//     moveTween.start()
//   })
// }
const moveEntityLadder = async (
  entityId,
  x,
  y,
  z,
  triangleId,
  keys,
  animationId,
  direction,
  speed
) => {
  const model = getModelByEntityId(entityId)
  if (
    model.scene.uuid === window.currentField.playableCharacter.scene.uuid &&
    window.currentField.playableCharacterCanMove
  ) {
    // This should be the active character
    await moveEntityLadderPlayableCharacter(
      entityId,
      x,
      y,
      z,
      triangleId,
      keys,
      animationId,
      direction,
      speed,
      model
    )
  } else {
    await moveEntityLadderNPC(
      entityId,
      x,
      y,
      z,
      triangleId,
      keys,
      animationId,
      direction,
      speed,
      model
    )
  }
}
const moveEntityLadderPlayableCharacter = async (
  entityId,
  x,
  y,
  z,
  triangleId,
  keys,
  animationId,
  direction,
  speed,
  model
) => {
  console.log(
    'moveEntityLadderPlayableCharacter',
    entityId,
    x,
    y,
    z,
    triangleId,
    keys,
    animationId,
    direction,
    speed,
    model
  )
  return new Promise(resolve => {
    // console.log('stopAllAction E', model.userData.entityName)
    model.mixer.stopAllAction()
    setModelDirection(entityId, direction)
    let keysForwards
    let keysBackwards
    switch (keys) {
      case 0:
        keysForwards = 'down'
        keysBackwards = 'up'
        break
      case 1:
        keysForwards = 'up'
        keysBackwards = 'down'
        break
      case 2:
        keysForwards = 'right'
        keysBackwards = 'left'
        break
      case 3:
        keysForwards = 'left'
        keysBackwards = 'right'
        break
    }
    model.userData.ladder = {
      from: {
        x: model.scene.position.x,
        y: model.scene.position.y,
        z: model.scene.position.z
      },
      to: { x: x / 4096, y: y / 4096, z: z / 4096 },
      animationId,
      direction,
      speed,
      keysForwards,
      keysBackwards,
      atStart: true,
      resolve: function () {
        resolve()
        console.log('moveEntityLadderPlayableCharacter: END')
        delete model.userData.ladder
        console.log('moveEntityLadderPlayableCharacter: CLEAN', model.userData)
      }
    }
    console.log(
      'moveEntityLadderPlayableCharacter: READY',
      model.userData.ladder
    )
    // model.userData.ladder.resolve()
  })
}
const moveEntityLadderNPC = async (
  entityId,
  x,
  y,
  z,
  triangleId,
  keys,
  animationId,
  direction,
  animationSpeed,
  model
) => {
  console.log(
    'moveEntityLadderNPC',
    entityId,
    x,
    y,
    z,
    triangleId,
    '-',
    keys,
    animationId,
    direction,
    animationSpeed,
    model
  )
  // console.log('stopAllAction F', model.userData.entityName)
  model.mixer.stopAllAction()
  setModelDirection(entityId, direction)
  model.mixer.clipAction(model.animations[animationId]).play()
  // model.mixer.clipAction(model.animations[animationId]).timeScale = -1 // TODO Animation speed & direction?!

  // Facing direction for diagonal (eg non pure vertical) ladders is taken care of in the animation
  const from = {
    x: model.scene.position.x,
    y: model.scene.position.y,
    z: model.scene.position.z
  }
  const to = { x: x / 4096, y: y / 4096, z: z / 4096 }

  const distance = new THREE.Vector3(from.x, from.y, from.z).distanceTo(
    new THREE.Vector3(to.x, to.y, to.z)
  )
  const speed =
    model.userData.movementSpeed *
    (1 / window.currentField.data.model.header.modelScale) *
    1024 *
    2 // TODO - Look at this properly, not sure of the scale here
  const time = distance * speed
  // TODO - The speed is very wrong
  console.log(
    'moveEntityLadderNPC ready',
    entityId,
    from,
    to,
    distance,
    speed,
    time
  )
  return new Promise(resolve => {
    new TWEEN.Tween(from, FIELD_TWEEN_GROUP)
      .to(to, time)
      .onUpdate(function () {
        // Update the model position
        model.scene.position.x = from.x
        model.scene.position.y = from.y
        model.scene.position.z = from.z
        console.log('moveEntityLadderNPC update', entityId, from)

        if (
          model.scene.uuid === window.currentField.playableCharacter.scene.uuid
        ) {
          // Update camera position if this is the main character
          const relativeToCamera = calculateViewClippingPointFromVector3(from)
          console.log('setCameraPosition moveEntityLadderNPC')
          setCameraPosition(relativeToCamera.x, relativeToCamera.y)
        }
      })
      .onComplete(function () {
        console.log('moveEntityLadderNPC: END', entityId)
        // console.log('stopAllAction G', model.userData.entityName)
        model.mixer.stopAllAction()
        updateCurrentTriangleId(model, from)
        resolve()
      })
      .start()
  })
}
const getEntityPositionTriangle = entityId => {
  const model = getModelByEntityId(entityId)
  console.log(
    'getEntityPositionTriangle',
    entityId,
    model.scene.userData.triangleId,
    model.scene.userData.triangleId === undefined,
    model
  )
  return model.scene.userData.triangleId !== undefined
    ? model.scene.userData.triangleId
    : -1
}
const getEntityPositionXY = entityId => {
  const model = getModelByEntityId(entityId)
  console.log('getEntityPositionXY', entityId, model)
  return {
    x: Math.floor(model.scene.position.x * 4096),
    y: Math.floor(model.scene.position.y * 4096)
  }
}
const getEntityPositionXYZTriangle = entityId => {
  const model = getModelByEntityId(entityId)
  console.log('getEntityPositionXYZTriangle', entityId, model)
  return {
    x: Math.floor(model.scene.position.x * 4096),
    y: Math.floor(model.scene.position.y * 4096),
    z: Math.floor(model.scene.position.z * 4096),
    triangleId:
      model.scene.userData.triangleId !== undefined
        ? model.scene.userData.triangleId
        : -1
  }
}
const getPartyMemberPositionXYZTriangle = partyMemberId => {
  const model = getModelByPartyMemberId(partyMemberId)
  console.log('getPartyMemberPositionXYZTriangle', partyMemberId, model)
  return {
    x: Math.floor(model.scene.position.x * 4096),
    y: Math.floor(model.scene.position.y * 4096),
    z: Math.floor(model.scene.position.z * 4096),
    triangleId:
      model.scene.userData.triangleId !== undefined
        ? model.scene.userData.triangleId
        : -1
  }
}
const setTriangleBoundaryMovementAllowed = (triangleId, allowed) => {
  console.log('setTriangleBoundaryMovementAllowed', triangleId, allowed)

  // walkmeshMeshTriangle.userData.triangleId = i
  // walkmeshMeshTriangle.userData.movementAllowed = true
  const mesh = window.currentField.walkmeshMesh.children.filter(
    m => m.userData.triangleId === triangleId
  )[0]
  console.log('mesh: START', mesh, mesh.userData)
  mesh.userData.movementAllowed = allowed
  if (allowed) {
    mesh.material.color.setHex(0x2194ce)
  } else {
    mesh.material.color.setHex(0xce2194)
  }
  console.log('mesh: END', mesh.userData)
}
const offsetEntity = (window.offsetEntity = async (
  entityId,
  x,
  y,
  z,
  frames,
  type
) => {
  // TODO - Need to check this later as in the doc it says: (which I haven't done yet)
  // Offsets the field object, belonging to the entity whose script this opcode resides in,
  // by a certain amount. After being offset, the character continues to be constrained in
  // movement as defined by the walkmesh's shape, but at a certain distance away from the
  // normal walkmesh position. Other field objects are unaffected, and their position or
  // movements are maintained on the walkmesh's original position

  // UPDATE - I've applied the offset (with -x rotation) to the root container of the gltf, this keeps
  // everything a lot simpler as offsets in local space to the child element of the model for movement
  // and collisions etc, also need to think about if camera movement should follow the offset position to

  const model = getModelByEntityId(entityId)
  model.userData.offsetInProgress = true
  console.log('offsetEntity: START', entityId, x, y, z, frames, type, model)

  // Note: If multiple offsets are chained, then they are relative to the 'pre-offset' position
  // : nivl_3 -> cloud -> Script 7
  if (model.scene.userData.currentOffset === undefined) {
    model.scene.userData.currentOffset = { x: 0, y: 0, z: 0 }
  }

  const factor = 1248
  x = (x / 4096) * factor // TODO: Not sure why, but a factor (guess) seems to have to be applied in junair & junonr1
  y = (y / 4096) * factor
  z = (z / 4096) * factor
  const from = {
    x: model.scene.children[0].position.x,
    y: model.scene.children[0].position.y,
    z: model.scene.children[0].position.z
  }
  const to = {
    x:
      model.scene.children[0].position.x +
      (x - model.scene.userData.currentOffset.x),
    y:
      model.scene.children[0].position.y +
      (y - model.scene.userData.currentOffset.y),
    z:
      model.scene.children[0].position.z +
      (z - model.scene.userData.currentOffset.z)
  }
  // 0 - instant
  let time = type === 0 ? 1 : (1000 / 30) * frames
  let easingType = TWEEN.Easing.Linear.None // 1 - linear
  if (type === 2) {
    easingType = TWEEN.Easing.Quadratic.InOut // 2 - smooth
  }
  if (type > 0 && isMoviePlaying()) {
    time = time * 2 // Slows to 15fps with movies
  }
  console.log('offsetEntity: Time ', time)
  return new Promise(resolve => {
    new TWEEN.Tween(from, FIELD_TWEEN_GROUP)
      .to(to, time)
      .easing(easingType)
      .onUpdate(function () {
        // Update the model position
        model.scene.children[0].position.x = from.x
        model.scene.children[0].position.y = from.y
        model.scene.children[0].position.z = from.z
        // console.log('offsetEntity: UPDATE', entityId, x, y, z, frames, type, model)
      })
      .onComplete(function () {
        console.log('offsetEntity: END', entityId, from)
        model.scene.userData.currentOffset = { x, y, z }
        delete model.userData.offsetInProgress
        resolve()
      })
      .start()
  })
})
const waitForOffset = async entityId => {
  console.log('waitForOffset ', entityId)
  const model = getModelByEntityId(entityId)
  while (model.userData.offsetInProgress) {
    // Should really replace this with promises...
    await sleep((1000 / 30) * 2)
    console.log('waitForOffset ', entityId, 'waiting...')
  }
}

const joinLeader = async speed => {
  const leaderModel = getModelByPartyMemberId(1) // 1-3, not 0
  const targetX = leaderModel.scene.position.x
  const targetY = leaderModel.scene.position.y
  const joinerNames = window.data.savemap.party.members.filter(
    m => m !== 'None' && m !== leaderModel.userData.characterName
  )
  console.log('joinLeader', leaderModel, joinerNames, speed)
  const result = await Promise.all(
    joinerNames.map(async joinerName => {
      const model = getModelByCharacterName(joinerName)
      console.log('model', model)
      await turnModelToFaceEntity(
        model.userData.entityId,
        leaderModel.userData.entityId,
        2,
        15
      ) // TODO not sure about speed here
      await moveEntity(
        model.userData.entityId,
        targetX,
        targetY,
        true,
        true,
        speed
      )
      setModelCollisionEnabled(model.userData.entityId, false)
      setModelTalkEnabled(model.userData.entityId, false)
      setModelVisibility(model.userData.entityId, false)
      return model
    })
  )
  console.log('result', result)
}
const splitPartyFromLeader = async (char1, char2, speed) => {
  console.log('splitPartyFromLeader', char1, char2, speed)

  const leaderModel = getModelByPartyMemberId(1) // 1-3, not 0
  const targetX = leaderModel.scene.position.x
  const targetY = leaderModel.scene.position.y
  const targetZ = leaderModel.scene.position.z
  const leavers = window.data.savemap.party.members.filter(
    m => m !== 'None' && m !== leaderModel.userData.characterName
  )
  if (leavers.length > 0) {
    leavers[0] = {
      name: leavers[0],
      x: char1.x / 4096,
      y: char1.y / 4096,
      z: targetZ,
      direction: char1.direction
    }
  }
  if (leavers.length > 1) {
    leavers[1] = {
      name: leavers[1],
      x: char2.x / 4096,
      y: char2.y / 4096,
      z: targetZ,
      direction: char2.direction
    }
  }
  console.log('splitPartyFromLeader joinLeader', leaderModel, leavers)
  const result = await Promise.all(
    leavers.map(async leaver => {
      const model = getModelByCharacterName(leaver.name)
      console.log('model', model)
      placeModel(
        model.userData.entityId,
        targetX * 4096,
        targetY * 4096,
        targetZ * 4096
      )

      setModelVisibility(model.userData.entityId, true)
      await turnModelToFaceDirection(
        model.userData.entityId,
        255 - leaver.direction,
        2,
        15,
        2
      ) // TODO not sure about speed here
      await moveEntity(
        model.userData.entityId,
        leaver.x,
        leaver.y,
        true,
        true,
        speed
      )
      await turnModelToFaceDirection(
        model.userData.entityId,
        leaver.direction,
        2,
        15,
        2
      ) // TODO not sure about speed here
      setModelCollisionEnabled(model.userData.entityId, true)
      setModelTalkEnabled(model.userData.entityId, true)
      return model
    })
  )
  console.log('splitPartyFromLeader', result)
}
export {
  moveEntityWithAnimationAndRotation,
  moveEntityWithoutAnimationOrRotation,
  moveEntityWithoutAnimationButWithRotation,
  moveEntityToEntityWithAnimationAndRotation,
  moveEntityToPartyMemberWithAnimationAndRotation,
  moveEntityJump,
  moveEntityLadder,
  getEntityPositionTriangle,
  getEntityPositionXY,
  getEntityPositionXYZTriangle,
  getPartyMemberPositionXYZTriangle,
  setTriangleBoundaryMovementAllowed,
  offsetEntity,
  waitForOffset,
  joinLeader,
  splitPartyFromLeader,
  updateMoveEntityMovement
}
