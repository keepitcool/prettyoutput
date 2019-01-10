'use strict'

/**
 * Serializable values are boolean, number, null, Date, Single line strings, empty arrays
 * @param {*} input
 * @return {boolean}
 */
exports.isSerializable = function(input) {
    const type = typeof input
    return (
        type === 'boolean' ||
        type === 'number' ||
        input === null ||
        input instanceof Date ||
        input === undefined ||
        exports.isSingleLineString(input) ||
        exports.isEmptyArray(input)
    )
}

/**
 *
 * @param {*} data
 * @return {boolean} - true if it's a string and it's single line
 */
exports.isSingleLineString = function(data) {
    return typeof data === 'string' && data.indexOf('\n') === -1
}

/**
 *
 * @param {*} input
 * @return {boolean}
 */
exports.isEmptyArray = function(input) {
    return Array.isArray(input) && input.length <= 0
}
