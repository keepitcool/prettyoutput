'use strict'

const _ = require('lodash')
const utils = require('./utils')

/**
 * Get color of an input
 * @param {*} input
 * @param {colors} colors
 * @return {string|null} - color or null if no color
 */
exports.inputColor = function(input, colors) {
    if (!colors) return null

    const type = typeof input

    // Print strings in regular terminal color
    if (type === 'string') return colors.string

    if (input === true) return colors.true

    if (input === false) return colors.false

    if (input === null) return colors.null

    if (input === undefined) return colors.undefined

    if (type === 'number') return colors.number

    return null
}

exports.indent = function(input, options) {
    return `${options.indentation}${input}`
}

exports.renderSerializable = function(input, options, indentation) {
    if (Array.isArray(input)) return exports.renderEmptyArray(options, indentation)

    const color = exports.inputColor(input, options.colors)
    const inputResult = utils.colorString(input, color)

    return `${indentation}${inputResult}\n`
}

exports.renderMultilineString = function(input, options, indentation) {
    const color = exports.inputColor(input, options.colors)
    const indentedString = utils.alignString(input, exports.indent(indentation, options))
    const output = `${indentation}"""\n${indentedString}\n${indentation}"""\n`

    return utils.colorString(output, color)
}

exports.renderEmptyArray = function(options, indentation) {
    return `${indentation}(empty array)\n`
}

exports.renderObjectKey = function(key, options, indentation) {
    const colors = options.colors || {}
    const output = `${indentation}${key}: `

    return utils.colorString(output, colors.keys)
}

exports.renderDash = function(options, indentation) {
    const colors = options.colors || {}
    const output = `${indentation}- `

    return utils.colorString(output, colors.dash)
}

exports.renderMaxDepth = function(options, indentation) {
    return `${indentation}(max depth reached)\n`
}

exports.renderSerializableObjectValue = function(key, value, valueColumn, options, indentation) {
    const renderedKey = exports.renderObjectKey(key, options, indentation)
    const alignSpaces = _.repeat(' ', valueColumn - key.length)
    const renderedValue = exports.renderSerializable(value, options, alignSpaces)

    return `${renderedKey}${renderedValue}`
}

exports.renderMaxDepthObjectValue = function(key, valueColumn, options, indentation) {
    const renderedKey = exports.renderObjectKey(key, options, indentation)
    const alignSpaces = _.repeat(' ', valueColumn - key.length)
    const renderedValue = exports.renderMaxDepth(options, alignSpaces)

    return `${renderedKey}${renderedValue}`
}

exports.renderSerializableArrayValue = function(value, options, indentation) {
    const renderedDash = exports.renderDash(options, indentation)
    const renderedValue = exports.renderSerializable(value, options, '')

    return `${renderedDash}${renderedValue}`
}

exports.renderMaxDepthArrayValue = function(options, indentation) {
    const renderedDash = exports.renderDash(options, indentation)
    const renderedValue = exports.renderMaxDepth(options, '')

    return `${renderedDash}${renderedValue}`
}

exports.renderErrorStack = function(stack, options, indentation) {
    const color = exports.inputColor(stack, options.colors)
    const indentedDash = exports.renderDash(options, indentation)
    const indentedStack = utils.alignString(stack, indentedDash)

    return utils.colorString(indentedStack, color)
}

exports.renderObjectErrorStack = function(key, stack, options, indentation) {
    const renderedKey = exports.renderObjectKey(key, options, indentation)
    const stackIndentation = exports.indent(indentation, options)
    const renderedStack = exports.renderErrorStack(stack, options, stackIndentation)
    return `${renderedKey}\n${renderedStack}\n`
}
