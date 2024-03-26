const Schema = require('./Schema.js');
const { MAX_MESSAGE_SIZE, VALID_FILETYPES, VALID_METHODS} = require('./constants.js');

const REGEXES = {
    n: /^[A-Za-z0-9_]*$/,
    i: /^[A-Za-z0-9_]*$/,
    s: /^[A-Za-z0-9_]*$/,
    r: /^[A-Za-z0-9_/?:&+.%=-]*$/,
    query: /^[A-Za-z0-9~!@$%^&*()\-_=+{}|;:,./?]*$/,
    route: /^[A-Za-z0-9/~!@$%^&*()\-_=+|;:,.]*$/,
    server: /^[A-Za-z0-9~!@$%^&*()\-_=+|;:,.]*$/
};

const URL_SCHEMA = new Schema([
    new Schema.StringValidator('n', {
        minLength: 1,
        maxLength: 25,
        pattern: REGEXES.n,
        required: true,
        expected: true
    }),
    new Schema.StringValidator('type', {
        // minLength: 1,
        // maxLength: 5,
        enum: VALID_FILETYPES
    }),
    new Schema.StringValidator('protocol', {
        enum: ['spatialtoolbox', 'ws', 'wss', 'http', 'https']
    }),
    new Schema.StringValidator('query', {
        minLength: 0,
        maxLength: 2000,
        pattern: REGEXES.query
    }),
    new Schema.StringValidator('route', {
        minLength: 0,
        maxLength: 2000,
        pattern: REGEXES.route
    }),
    new Schema.StringValidator('server', {
        minLength: 0,
        maxLength: 2000,
        pattern: REGEXES.server
    }),
    new Schema.NumberValidator('port', {
        minValue: 0,
        maxValue: 99999
    })
]);

const MESSAGE_BUNDLE_SCHEMA = new Schema([
    // id
    new Schema.GroupValidator('i', [
        new Schema.StringValidator('i', {
            minLength: 1,
            maxLength: 22,
            pattern: REGEXES.i
        }),
        new Schema.NullValidator('i'),
        new Schema.UndefinedValidator('i')
    ]),
    // origin
    new Schema.StringValidator('o', {
        enum: ['server', 'client', 'web', 'edge', 'proxy'],
        required: true
    }),
    // network
    new Schema.StringValidator('n', {
        minLength: 1,
        maxLength: 25,
        pattern: REGEXES.n,
        required: true
    }),
    // method
    new Schema.StringValidator('m', {
        enum: VALID_METHODS,
        required: true
    }),
    // route
    new Schema.StringValidator('r', {
        minLength: 0,
        maxLength: 2000,
        pattern: REGEXES.r,
        required: true
    }),
    // body
    new Schema.GroupValidator('b', [
        new Schema.BooleanValidator('b'),
        new Schema.ArrayValidator('b', {
            minLength: 0,
            maxLength: MAX_MESSAGE_SIZE
        }),
        new Schema.NumberValidator('b'),
        new Schema.StringValidator('b', {
            minLength: 0,
            maxLength: MAX_MESSAGE_SIZE
        }),
        new Schema.ObjectValidator('b')
    ], { required: true }),
    // unknown, doesn't seem to be used
    new Schema.GroupValidator('s', [
        new Schema.StringValidator('s', {
            minLength: 0,
            maxLength: 45,
            pattern: REGEXES.s
        }),
        new Schema.NullValidator('s'),
        new Schema.UndefinedValidator('s')
    ]),
    // Number of frames to expect in binary message?
    new Schema.GroupValidator('f', [
        new Schema.NumberValidator('f', {
            minValue: 1,
            maxValue: 99
        }),
        new Schema.NullValidator('f'),
        new Schema.UndefinedValidator('f')
    ])
]);

module.exports = {
    URL_SCHEMA,
    MESSAGE_BUNDLE_SCHEMA
}
