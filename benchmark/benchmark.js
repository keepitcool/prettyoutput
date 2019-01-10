'use strict'
/* eslint-disable no-console */

const util = require('util')
const columnify = require('columnify')
const _ = require('lodash')
const prettyjson = require('prettyjson')

const fixture = require('./fixture')
const prettyoutput = require('../lib/prettyoutput')
const stats = require('./stats')

function runFunction(loopCount, fn) {
    const diffs = []

    for (let i = 0; i < loopCount; i++) {
        const time = process.hrtime()
        fn()
        const rawDiff = process.hrtime(time)
        const diff = rawDiff[0] * 1e9 + rawDiff[1]
        diffs.push(diff)
    }

    return diffs
}

function runPrettyOutput(element, loopCount) {
    return runFunction(loopCount, () => {
        prettyoutput(element, { noColor: true, maxDepth: 100 })
    })
}

function runUtilInspect(element, loopCount) {
    return runFunction(loopCount, () => {
        util.inspect(element, { depth: 100 })
    })
}

function runPrettyJson(element, loopCount) {
    return runFunction(loopCount, () => {
        prettyjson.render(element, { noColor: true })
    })
}

function prettyWeights(weights) {
    let result = ''
    _.forOwn(weights, (value, key) => {
        result += `${key}: ${value}    `
    })
    return result
}

function makeBench(weights, levels, keysCount, loopCount) {
    console.log('\n')

    const benchDesc = _.assign({ levels: levels, keys: keysCount, loops: loopCount }, { weigths: prettyWeights(weights) })
    console.log(columnify([benchDesc], { columnSplitter: ' | ' }), '\n')

    const element = fixture.makeElement(weights, levels, keysCount)

    const prettyOutputDiffs = runPrettyOutput(element, loopCount)
    const prettyJsonDiffs = runPrettyJson(element, loopCount)
    const utilInspectDiffs = runUtilInspect(element, loopCount)

    const prettyOutputStats = stats.stats(prettyOutputDiffs)
    const prettyJsonStats = stats.stats(prettyJsonDiffs)
    const utilInspectStats = stats.stats(utilInspectDiffs)

    const result = [
        _.assign({ name: 'prettyoutput' }, stats.prettyStats(prettyOutputStats)),
        _.assign({ name: 'prettyjson' }, stats.prettyStats(prettyJsonStats)),
        _.assign({ name: 'util.inspect' }, stats.prettyStats(utilInspectStats))
    ]

    console.log(columnify(result, { columnSplitter: ' | ' }))
    console.log('--------------------------------------------------------------------------------------------------------------')
}

const tests = [
    { loops: 100, levels: 3, keys: 20, weights: { serializable: 0.9, array: 0.3, object: 0.5, multilineString: 0.3, error: 0.2 } },
    { loops: 100, levels: 4, keys: 20, weights: { serializable: 0.9, array: 0.3, object: 0.5, multilineString: 0.3, error: 0.2 } },
    { loops: 100, levels: 5, keys: 20, weights: { serializable: 0.9, array: 0.3, object: 0.5, multilineString: 0.3, error: 0.2 } }
]

_.forEach(tests, test => {
    makeBench(test.weights, test.levels, test.keys, test.loops)
})
