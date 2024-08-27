window.console = (function (origConsole) {
  if (!window.console || !origConsole) {
    origConsole = {}
  }
  const limit = true
  return {
    terms: [
      // 'FLOW ERROR',
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
      // 'battleUI',
      // 'battleQueue'
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
      'loading',
      'battle preload',
      'battle parsed gltf',
      'location'
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
