'use strict'
const _ = require('lodash')

const internals = {}
internals.make = {}

internals.make.array = () => {
    return []
}

internals.make.object = () => {
    return {}
}

internals.make.multilineString = () => {
    return 'A multi \nline \nstring'
}

internals.make.serializable = () => {
    const set = [true, false, 1, 2.3, null, new Date(), 'A single line string', []]
    const idx = Math.floor(Math.random() * set.length)
    return set[idx]
}

internals.make.error = () => {
    return new Error('An error')
}

internals.weightedRand = weigths => {
    const entries = _.toPairs(weigths)

    let runningSum = 0
    const weightSum = entries.reduce((sum, value) => sum + value[1], 0)
    const randomPointer = Math.random() * weightSum

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]

        runningSum = runningSum + entry[1]

        if (randomPointer < runningSum) {
            return entry[0]
        }
    }

    return null
}

internals.weightedRands = (weigths, count) => {
    const result = []

    for (let i = 0; i < count; i++) {
        result.push(internals.weightedRand(weigths))
    }

    return result
}

internals.makeLevelArray = (weights, keysCount) => {
    let result = []

    const types = internals.weightedRands(weights, keysCount)
    _.forEach(types, type => {
        result.push(internals.make[type]())
    })
    return result
}

internals.makeLevelObject = (weights, keysCount) => {
    let result = {}

    const types = internals.weightedRands(weights, keysCount)
    for (let i = 0; i < types.length; i++) {
        const type = types[i]
        const key = `key${i}`
        result[key] = internals.make[type]()
    }
    return result
}

internals.makeLevelElements = (weights, keysCount, levelElements) => {
    const nextLevel = []

    while (levelElements.length > 0) {
        const currentElement = levelElements.pop()

        if (JSON.stringify(currentElement) === '[]') {
            const elementContent = internals.makeLevelArray(weights, keysCount)

            _.forEach(elementContent, element => {
                currentElement.push(element)
                nextLevel.push(element)
            })
        } else if (JSON.stringify(currentElement) === '{}') {
            const elementContent = internals.makeLevelObject(weights, keysCount)
            _.forOwn(elementContent, (value, key) => {
                currentElement[key] = value
                nextLevel.push(value)
            })
        }
    }

    return nextLevel
}

exports.makeElement = (weights, levels, keysCount) => {
    const topType = internals.weightedRand({ array: 0.5, object: 0.5 })
    const top = internals.make[topType]()

    let levelElements = [top]

    for (let level = 0; level < levels; level++) {
        const nextLevel = internals.makeLevelElements(weights, keysCount, levelElements)
        levelElements = nextLevel
    }

    return top
}

/*const weights = {serializable: 0.9, array: 0.3, object: 0.4, multilineString: 0.3, error: 0.2}
const levels = 4
const keysCount = 5
console.log(JSON.stringify(exports.makeElement(weights, levels, keysCount)))*/
