/* global describe, test, expect */
const utilities = require('./utilities.js');

describe('Utilities', () => {
    test('intToByte should convert integer to byte array', () => {
        const num = 1234567890;
        const expected = new Uint8Array([73, 150, 2, 210]);
        expect(utilities.intToByte(num)).toEqual(expected);
    });

    test('byteToInt should convert byte array to integer', () => {
        const bytes = new Uint8Array([73, 150, 2, 210]);
        const expected = 1234567890;
        expect(utilities.byteToInt(bytes)).toBe(expected);
    });

    test('generateUniqueId should generate different IDs of specified length', () => {
        const length = 8;
        const id1 = utilities.generateUniqueId(length);
        const id2 = utilities.generateUniqueId(length);
        expect(id1.length).toBe(length);
        expect(id2.length).toBe(length);
        expect(id1).not.toBe(id2);
    });
});
