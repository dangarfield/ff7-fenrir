window.console = (function (origConsole) {
    if (!window.console || !origConsole) {
        origConsole = {}
    }
    let limit = true
    return {
        terms: [
            'FLOW ERROR',
            'isSlipDirection',
            'canOKLoopBeTriggeredOnMovement'
        ],
        log: function () {
            if (limit) {
                for (let i = 0; i < arguments.length; i++) {
                    const argument = arguments[i]
                    if (typeof (argument) === 'string') {
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
            origConsole.warn.apply(origConsole, arguments)
        },
        error: function () {
            origConsole.error.apply(origConsole, arguments)
        },
        info: function (v) {
            origConsole.info.apply(origConsole, arguments)
        }
    }
}(window.console))