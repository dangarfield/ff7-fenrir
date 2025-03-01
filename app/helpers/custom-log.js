window.console = (function (origConsole) {
  if (!window.console || !origConsole) {
    origConsole = {}
  }
  const limit = true
  return {
    terms: [
      // 'press',
      // 'executeOpDEBUG',
      // 'executeOp',
      // 'joinLeader'
      // 'loadBattle',
      // 'battle',
      // 'battleOP',
      // 'battleMemory',
      // 'battleTimer',
      // 'battleQueue',
      // 'battleStack',
      // 'battleMenu',
      // 'battleStack',
      // 'battleUI',
      // 'battleUI SLOTS',
      // 'CAMERA pos',
      // 'CAMERA focus',
      // 'CAMERA calcPosition',
      // 'sceneData'
      // 'getOrientedOpZ'
      // 'BONE'
      // 'LOGG'
      // 'battleUI LIMIT'
      // 'battlePointer',
      // 'battleQueue',
      // 'executeEnemyAction',
      // 'executePlayerAction',
      // 'getActionSequenceForCommand',
      // 'CAMERA runScriptPair',
      // 'battleUI',
      // 'battleQueue addPlayerActionToQueue',
      // 'battleQueue player action',
      // 'cannotExecuteAction',
      'ACTION runActionSequence',
      'battleStats'
      // 'ACTION'
      // 'HURT',
      // 'DAMAGE',
      // 'LOAD BATTLE SOUNDS',
      // 'ACTION triggerSound',
      // 'battleOp COPY',
      // 'battleOp GLOB',
      // 'battleMemory',
      // 'getGlobalValueFromAlias',
      // 'executeEnemyAction'
      // 'battleOP DISPLAY'
      // 'executeEnemyAction',
      // 'battleStack',
      // 'battleOp'
      // 'LOAD BATTLE SOUNDS',
      // 'EFFECT'
      // 'updateOrthoPosition'
      // 'renderToTexture',
      // 'doSwirl',
      // 'loadField',
      // 'transitionIn',
      // 'initialiseOpLoops',
      // 'initEntityInit',
      // 'initLoop',
      // 'executeScriptLoop',
      // 'executeScriptLoopDEBUG',
      // 'SCR2D',
      // 'textureLetter',
      // 'getImageTexture',
      // 'SET MENU TEXTURES',
      // 'sceneData'
    ],
    log: function () {
      if (limit) {
        for (let i = 0; i < arguments.length; i++) {
          const argument = arguments[i]
          if (typeof argument === 'string') {
            for (let j = 0; j < this.terms.length; j++) {
              const term = this.terms[j]
              if (argument.includes(term)) {
                origConsole.log.apply(origConsole, arguments)
                break
              }
            }
          }
        }
      } else {
        origConsole.log.apply(origConsole, arguments)
      }
    },
    warn: function () {
      // if (
      //   arguments[0] !==
      //   'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.'
      // ) {
      origConsole.warn.apply(origConsole, arguments)
      // }
    },
    error: function () {
      origConsole.error.apply(origConsole, arguments)
    },
    info: function (v) {
      origConsole.info.apply(origConsole, arguments)
    }
  }
})(window.console)
