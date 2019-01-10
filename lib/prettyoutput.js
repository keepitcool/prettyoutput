'use strict'

const _ = require('lodash')

const utils = require('./utils')
const renderer = require('./renderer')
const typeInspect = require('./typeInspect')

const internals = {}
exports.internals = internals

/**
 * @typedef {object} options
 * @property {number} [indentationLength] - Space count for an indentation
 * @property {number} [maxDepth] - maximum sublevel of nested objects/arrays to go to. Default: 5
 * @property {boolean} [noColor] - Disable coloring. Default: false
 * @property {colors} [colors] - input colors
 * @property {boolean} [alignKeyValues] - Align key values. Default: true
 */

/**
 * @typedef {object} colors
 * @property {string|null} [keys] - Objects keys color. Default: green
 * @property {string|null} [dash] - Array prefixing values dash. Default: green
 * @property {string|null} [number] - Numbers color. Default: blue
 * @property {string|null} [string] - Strings color. Default: no color
 * @property {string|null} [true] - Boolean value 'true' color. Default: green
 * @property {string|null} [false] - Boolean value 'false' color. Default: red
 * @property {string|null} [null] - 'Null' color. Default: grey
 */

/**
 *
 * @param {options} opts
 * @return {{indentation: string, maxDepth: number, colors: colors}}
 */
internals.parseOptions = opts => {
    opts = opts || {} //eslint-disable-line no-param-reassign
    const optsColors = opts.colors || {}

    const colors = {
        keys: optsColors.keys || 'green',
        dash: optsColors.dash || 'green',
        number: optsColors.number || 'blue',
        string: optsColors.string || null,
        true: optsColors.true || 'green',
        false: optsColors.false || 'red',
        null: optsColors.null || 'grey',
        undefined: optsColors.undefined || 'grey'
    }

    const indentation = opts.indentationLength ? utils.indent(opts.indentationLength) : utils.indent(2)

    return {
        indentation: indentation,
        maxDepth: opts.maxDepth || 3,
        colors: !opts.noColor ? colors : null,
        alignKeyValues: _.isBoolean(opts.alignKeyValues) ? opts.alignKeyValues : true
    }
}

/**
 * Format a js/json object to YAML style output.
 * @param {*} input
 * @param {options} [opts]
 * @param {number} [indent] - initial level of indent
 * @return {string}
 */
module.exports = function(input, opts, indent) {
    const options = internals.parseOptions(opts)

    const indentation = indent ? utils.indent(indent) : ''
    const stack = [{ indentation: indentation, depth: 0, input: input }]

    let output = ''

    while (stack.length > 0) {
        const stackElement = stack.pop() //eslint-disable-line no-shadow

        const depth = stackElement.depth
        const indentation = stackElement.indentation
        const input = stackElement.input
        const noRender = stackElement.noRender

        if (noRender) {
            output = `${output}${input}`
        } else if (depth > options.maxDepth) {
            output = `${output}${renderer.renderMaxDepth(options, indentation)}`
        } else if (typeInspect.isSerializable(input)) {
            output = `${output}${renderer.renderSerializable(input, options, indentation)}`
        } else if (typeof input === 'string') {
            //unserializable string means it's multiline
            output = `${output}${renderer.renderMultilineString(input, options, indentation)}`
        } else if (Array.isArray(input)) {
            _.forEachRight(input, value => {
                if (typeInspect.isSerializable(value)) {
                    const result = renderer.renderSerializableArrayValue(value, options, indentation)
                    stack.push({ input: result, noRender: true })
                    return true
                }

                if (depth + 1 > options.maxDepth) {
                    const result = renderer.renderMaxDepthArrayValue(options, indentation)
                    stack.push({ input: result, noRender: true })
                    return true
                }

                // In all other cases
                stack.push({ input: value, indentation: renderer.indent(indentation, options), depth: depth + 1 })
                const dash = renderer.renderDash(options, indentation)
                stack.push({ input: `${dash}\n`, noRender: true })
            })
        } else {
            // Else render an object
            const isError = input instanceof Error
            const keys = Object.getOwnPropertyNames(input)
            const valueColumn = options.alignKeyValues ? utils.maxLength(keys) : 0
            _.forEachRight(keys, key => {
                const value = input[key]

                if (isError && key === 'stack') {
                    const result = renderer.renderObjectErrorStack(key, value, options, indentation)
                    stack.push({ input: result, noRender: true })
                    return true
                }

                if (typeInspect.isSerializable(value)) {
                    const result = renderer.renderSerializableObjectValue(key, value, valueColumn, options, indentation)
                    stack.push({ input: result, noRender: true })
                    return true
                }

                if (depth + 1 > options.maxDepth) {
                    const result = renderer.renderMaxDepthObjectValue(key, valueColumn, options, indentation)
                    stack.push({ input: result, noRender: true })
                    return true
                }

                // In all other case
                stack.push({ input: value, depth: depth + 1, indentation: renderer.indent(indentation, options) })
                const renderedKey = renderer.renderObjectKey(key, options, indentation)
                stack.push({ input: `${renderedKey}\n`, noRender: true })
            })
        }
    }

    return output
}
