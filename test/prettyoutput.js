'use strict'

const prettyoutput = require('../lib/prettyoutput')
const should = require('should') //eslint-disable-line no-unused-vars
const colors = require('colors/safe')

describe('prettyoutput general tests', () => {
    it('should output a string exactly equal as the input', () => {
        const input = 'This is a string'
        const output = prettyoutput(input)

        output.should.equal(`${input}\n`)
    })

    it('should output a string with indentation', () => {
        const input = 'This is a string'
        const output = prettyoutput(input, {}, 4)

        output.should.equal(`    ${input}\n`)
    })

    it('should output a multiline string with indentation', () => {
        const input = 'multiple\nlines'
        const output = prettyoutput(input, {}, 4)

        output.should.equal('    """\n      multiple\n      lines\n    """\n')
    })

    it('should output an array of strings', () => {
        const input = ['first string', 'second string']
        const output = prettyoutput(input)

        output.should.equal([colors.green('- ') + input[0], colors.green('- ') + input[1], ''].join('\n'))
    })

    it('should output an array of arrays', () => {
        const input = ['first string', ['nested 1', 'nested 2'], 'second string']
        const output = prettyoutput(input)

        output.should.equal(
            [
                colors.green('- ') + input[0],
                colors.green('- '),
                colors.green('  - ') + input[1][0],
                colors.green('  - ') + input[1][1],
                colors.green('- ') + input[2],
                ''
            ].join('\n')
        )
    })

    it('should output a hash of strings', () => {
        const input = { param1: 'first string', param2: 'second string' }
        const output = prettyoutput(input)

        output.should.equal([`${colors.green('param1: ')}first string`, `${colors.green('param2: ')}second string`, ''].join('\n'))
    })

    it('should output a hash of hashes', () => {
        const input = { firstParam: { subparam: 'first string', subparam2: 'another string' }, secondParam: 'second string' }
        const output = prettyoutput(input)

        output.should.equal(
            [
                colors.green('firstParam: '),
                `${colors.green('  subparam: ')} first string`,
                `${colors.green('  subparam2: ')}another string`,
                `${colors.green('secondParam: ')}second string`,
                ''
            ].join('\n')
        )
    })

    it('should indent correctly the hashes keys', () => {
        const input = { veryLargeParam: 'first string', param: 'second string' }
        const output = prettyoutput(input)

        output.should.equal(
            [`${colors.green('veryLargeParam: ')}first string`, `${colors.green('param: ')}         second string`, ''].join('\n')
        )
    })

    it('should output a really nested object', () => {
        const input = {
            firstParam: {
                subparam: 'first string',
                subparam2: 'another string',
                subparam3: ['different', 'values', 'in an array']
            },
            secondParam: 'second string',
            anArray: [
                {
                    param3: 'value',
                    param10: 'other value'
                }
            ],
            emptyArray: []
        }

        const output = prettyoutput(input)

        output.should.equal(
            [
                colors.green('firstParam: '),
                `${colors.green('  subparam: ')} first string`,
                `${colors.green('  subparam2: ')}another string`,
                colors.green('  subparam3: '),
                `${colors.green('    - ')}different`,
                `${colors.green('    - ')}values`,
                `${colors.green('    - ')}in an array`,
                `${colors.green('secondParam: ')}second string`,
                colors.green('anArray: '),
                colors.green('  - '),
                `${colors.green('    param3: ')} value`,
                `${colors.green('    param10: ')}other value`,
                `${colors.green('emptyArray: ')} (empty array)`,
                ''
            ].join('\n')
        )
    })

    it('should allow to configure colors for hash keys', () => {
        const input = { param1: 'first string', param2: 'second string' }
        const output = prettyoutput(input, { colors: { keys: 'blue' } })

        output.should.equal([`${colors.blue('param1: ')}first string`, `${colors.blue('param2: ')}second string`, ''].join('\n'))
    })

    it('should allow to configure colors for numbers', () => {
        const input = { param1: 17, param2: 22.3 }
        const output = prettyoutput(input, { colors: { number: 'red' } })

        output.should.equal([colors.green('param1: ') + colors.red('17'), colors.green('param2: ') + colors.red('22.3'), ''].join('\n'))
    })

    it('should allow to configure rainbow as color', () => {
        const input = { paramLong: 'first string', param2: 'second string' }
        const output = prettyoutput(input, { colors: { keys: 'rainbow' } })

        output.should.equal(
            [`${colors.rainbow('paramLong: ')}first string`, `${colors.rainbow('param2: ')}   second string`, ''].join('\n')
        )
    })

    it('should allow to configure the default indentation', () => {
        const input = { param: ['first string', 'second string'] }
        const output = prettyoutput(input, { indentationLength: 4 })

        output.should.equal(
            [colors.green('param: '), `${colors.green('    - ')}first string`, `${colors.green('    - ')}second string`, ''].join('\n')
        )
    })

    it('should allow to configure the empty message for arrays', () => {
        const input = []
        const output = prettyoutput(input, { emptyArrayMsg: '(empty)' })

        output.should.equal(['(empty array)', ''].join('\n'))
    })

    it('should allow to configure colors for strings', () => {
        const input = { param1: 'first string', param2: 'second string' }
        const output = prettyoutput(input, { colors: { keys: 'blue', string: 'red' } })

        output.should.equal(
            [colors.blue('param1: ') + colors.red('first string'), colors.blue('param2: ') + colors.red('second string'), ''].join('\n')
        )
    })

    it('should allow to not use colors', () => {
        const input = { param1: 'first string', param2: ['second string'] }
        const output = prettyoutput(input, { noColor: true })

        output.should.equal(['param1: first string', 'param2: ', '  - second string', ''].join('\n'))
    })

    it('should not print an object prototype', () => {
        const Input = function() {
            this.param1 = 'first string'
            this.param2 = 'second string'
        }
        Input.prototype = { randomProperty: 'idontcare' }

        const output = prettyoutput(new Input())

        output.should.equal([`${colors.green('param1: ')}first string`, `${colors.green('param2: ')}second string`, ''].join('\n'))
    })

    it('should allow turning off aligning hash key values', () => {
        const input = { veryLargeParam: 'first string', param: 'second string' }
        const output = prettyoutput(input, { alignKeyValues: false })

        output.should.equal([`${colors.green('veryLargeParam: ')}first string`, `${colors.green('param: ')}second string`, ''].join('\n'))
    })
})

describe('Printing numbers, booleans and other objects', () => {
    it('should print numbers correctly ', () => {
        const input = 12345
        const output = prettyoutput(input, {}, 4)

        output.should.equal(`    ${colors.blue('12345')}\n`)
    })

    it('should print booleans correctly ', () => {
        let input = true
        let output = prettyoutput(input, {}, 4)

        output.should.equal(`    ${colors.green('true')}\n`)

        input = false
        output = prettyoutput(input, {}, 4)

        output.should.equal(`    ${colors.red('false')}\n`)
    })

    it('should print a null object correctly ', () => {
        const input = null
        const output = prettyoutput(input, {}, 4)

        output.should.equal(`    ${colors.grey('null')}\n`)
    })

    it('should print undefined correctly ', () => {
        const input = undefined
        const output = prettyoutput(input, {}, 4)

        output.should.equal(`    ${colors.grey('undefined')}\n`)
    })

    it('should print an Error correctly ', () => {
        Error.stackTraceLimit = 1
        const input = new Error('foo')
        const stack = input.stack.split('\n')
        const output = prettyoutput(input, {}, 4)

        output.should.equal(
            [
                colors.green('    stack: '),
                colors.green('      - ') + stack[0],
                colors.green('      - ') + stack[1],
                `${colors.green('    message: ')}foo`,
                ''
            ].join('\n')
        )
    })

    it('should print serializable items in an array inline', () => {
        const dt = new Date()
        const output = prettyoutput(['a', 3, null, true, false, dt])

        output.should.equal(
            [
                `${colors.green('- ')}a`,
                colors.green('- ') + colors.blue('3'),
                colors.green('- ') + colors.grey('null'),
                colors.green('- ') + colors.green('true'),
                colors.green('- ') + colors.red('false'),
                colors.green('- ') + dt,
                ''
            ].join('\n')
        )
    })

    it('should print dates correctly', () => {
        const input = new Date()
        const expected = input.toString()
        const output = prettyoutput(input, {}, 4)

        output.should.equal(`    ${expected}\n`)
    })

    it('should print dates in objects correctly', () => {
        const dt1 = new Date()
        const dt2 = new Date()

        const input = {
            dt1: dt2,
            dt2: dt2
        }

        const output = prettyoutput(input, {}, 4)

        output.should.equal([colors.green('    dt1: ') + dt1.toString(), colors.green('    dt2: ') + dt2.toString(), ''].join('\n'))
    })
})
