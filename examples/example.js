const prettyoutput = require('../lib/prettyoutput')

/* eslint-disable no-console */

const data = {
    username: 'kic',
    url: 'https://github.com/keepitcool',
    projects: ['prettyoutput', '3m2tuio']
}

console.log(prettyoutput(data))
