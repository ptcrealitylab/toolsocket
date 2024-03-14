/* global describe, test, expect */
const ToolSocket = require('./index.js');

describe('Utilities', () => {
    test('intToByte should convert integer to byte array', () => {
        const num = 1234567890;
        const expected = new Uint8Array([73, 150, 2, 210]);
        expect(ToolSocket.intToByte(num)).toEqual(expected);
    });

    test('byteToInt should convert byte array to integer', () => {
        const bytes = new Uint8Array([73, 150, 2, 210]);
        const expected = 1234567890;
        expect(ToolSocket.byteToInt(bytes)).toBe(expected);
    });

    test('generateUniqueId should generate different IDs of specified length', () => {
        const length = 8;
        const id1 = ToolSocket.generateUniqueId(length);
        const id2 = ToolSocket.generateUniqueId(length);
        expect(id1.length).toBe(length);
        expect(id2.length).toBe(length);
        expect(id1).not.toBe(id2);
    });

    test('validate should return true for valid object', () => {
        const obj = {
            i: '123',
            o: 'client',
            n: 'network',
            m: 'action',
            r: '/route',
            b: {data: 'test'},
        };
        const schema = ToolSocket.MESSAGE_BUNDLE_SCHEMA;
        expect(schema.validate(obj)).toBe(true);
    });

    test('validate should return false for object missing required', () => {
        const obj = {
            i: '123',
            n: 'network',
            m: 'action',
            r: '/route',
            b: {data: 'test'},
        };
        const schema = ToolSocket.MESSAGE_BUNDLE_SCHEMA;
        expect(schema.validate(obj)).toBe(false);
    });

    test('validate should return false for object not matching enum', () => {
        const obj = {
            i: '123',
            o: 'whatever',
            n: 'network',
            m: 'action',
            r: '/route',
            b: {data: 'test'},
        };
        const schema = ToolSocket.MESSAGE_BUNDLE_SCHEMA;
        expect(schema.validate(obj)).toBe(false);
    });

    test('parseUrl should parse a URL according to a schema', () => {
        const url = new URL('ws://example.com/n/networkSecret/path?query=value');
        const schema = ToolSocket.URL_SCHEMA;
        const expected = {
            protocol: 'ws',
            server: 'example.com',
            port: 80,
            route: '/path',
            query: 'query=value',
            n: 'networkSecret'
        };
        expect(schema.parseUrl(url)).toEqual(expected);
    });

    test('parseRoute should parse a route according to a schema', () => {
        const route = '/n/networkSecret/path?query=value';
        const schema = ToolSocket.URL_SCHEMA;
        const expected = {
            route: '/path',
            query: 'query=value',
            n: 'networkSecret'
        };
        expect(schema.parseRoute(route)).toEqual(expected);
    });
});
