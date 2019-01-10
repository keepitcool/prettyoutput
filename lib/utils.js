'use strict'

const _ = require('lodash')
const colorString = require('colors/safe')

/**
 * Creates a string with specified spaces count
 * @param {number} spaceCount - space count
 * @return {string}
 */
exports.indent = function indent(spaceCount) {
    return _.repeat(' ', spaceCount)
}

/**
 * Gets longest string length
 * @param {Array<string>} strings
 * @return {number}
 */
exports.maxLength = function(strings) {
    let maxLength = 0
    _.forEach(strings, string => {
        const length = string.length
        if (length > maxLength) maxLength = length
    })

    return maxLength
}

/**
 *
 * @param {string} string - single or multiline string
 * @param {string} indentation - indentation space as string
 * @return {string} - Indented multiline string
 */
exports.alignString = function(string, indentation) {
    const pattern = new RegExp('\n', 'g') //eslint-disable-line no-control-regex
    return `${indentation}${string}`.replace(pattern, `\n${indentation}`)
}

/**
 *
 * @param {string} string
 * @param {string} color name
 * @return {string} - colored string (for terminal output)
 */
exports.colorString = function(string, color) {
    if (!color) return string
    if (string === null) string = 'null'
    if (string === undefined) string = 'undefined'
    return colorString[color](string)
}
