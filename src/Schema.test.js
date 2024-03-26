/* global describe, test, expect */

const Schema = require('./Schema.js');

const personSchema = new Schema([
    new Schema.StringValidator('name', { required: true }),
    new Schema.NumberValidator('age', { minValue: 0 }),
]);

describe('Schema', () => {
    describe('validate', () => {
        test('should validate a valid object', () => {
            const validObject = { name: 'John', age: 25 };
            expect(personSchema.validate(validObject)).toBe(true);
        });

        test('should validate a valid object with missing non-required key', () => {
            const validObject = { name: 'John' };
            expect(personSchema.validate(validObject)).toBe(true);
        });

        test('should invalidate an object with missing required properties', () => {
            const invalidObject = { age: 25 };
            expect(personSchema.validate(invalidObject)).toBe(false);
        });

        test('should invalidate an object with invalid property types', () => {
            const invalidObject = { name: 'John', age: 'twenty-five' };
            expect(personSchema.validate(invalidObject)).toBe(false);
        });

        test('should invalidate an object with invalid requirements', () => {
            const invalidObject = { name: 'John', age: -1 };
            expect(personSchema.validate(invalidObject)).toBe(false);
        });

        test('failedValidator should point to validator that failed', () => {
            const invalidObject = { name: 'John', age: -1 };
            personSchema.validate(invalidObject);
            expect(personSchema.failedValidator).toBeInstanceOf(Schema.NumberValidator);
        });

        describe('StringValidator', () => {
            const stringSchema = new Schema([
                new Schema.StringValidator('string', {
                    minLength: 2,
                    maxLength: 4,
                    pattern: /^[A-z]*$/,
                })
            ]);
            const stringEnumSchema = new Schema([
                new Schema.StringValidator('string', {
                    enum: ['http', 'ws']
                })
            ]);

            test('should validate strings of the right length', () => {
                expect(stringSchema.validate({string: 'ab'})).toBe(true);
                expect(stringSchema.validate({string: 'abc'})).toBe(true);
                expect(stringSchema.validate({string: 'abcd'})).toBe(true);
            });

            test('should invalidate short strings', () => {
                expect(stringSchema.validate({string: 'a'})).toBe(false);
            });

            test('should invalidate long strings', () => {
                expect(stringSchema.validate({string: 'abcde'})).toBe(false);
            });

            test('should invalidate strings that do not match pattern', () => {
                expect(stringSchema.validate({string: '1234'})).toBe(false);
            });

            test('should validate strings that match enum', () => {
                expect(stringEnumSchema.validate({string: 'ws'})).toBe(true);
            });

            test('should invalidate strings that do not match enum', () => {
                expect(stringEnumSchema.validate({string: 'abcd'})).toBe(false);
            });
        });

        describe('NumberValidator', () => {
            const numberSchema = new Schema([
                new Schema.NumberValidator('number', {
                    minValue: 2,
                    maxValue: 4,
                })
            ]);
            const numberEnumSchema = new Schema([
                new Schema.NumberValidator('number', {
                    enum: [1, 2, 4, 8, 16, 32]
                })
            ]);

            test('should validate numbers in range', () => {
                expect(numberSchema.validate({number: 2})).toBe(true);
                expect(numberSchema.validate({number: 3})).toBe(true);
                expect(numberSchema.validate({number: 4})).toBe(true);
            });

            test('should invalidate small numbers', () => {
                expect(numberSchema.validate({number: 1})).toBe(false);
            });

            test('should invalidate big numbers', () => {
                expect(numberSchema.validate({number: 5})).toBe(false);
            });

            test('should validate numbers that match enum', () => {
                expect(numberEnumSchema.validate({number: 16})).toBe(true);
            });

            test('should invalidate numbers that do not match enum', () => {
                expect(numberEnumSchema.validate({number: 3})).toBe(false);
            });
        });

        describe('ArrayValidator', () => {
            const arraySchema = new Schema([
                new Schema.ArrayValidator('array', {
                    minLength: 2,
                    maxLength: 4,
                })
            ]);

            test('should validate arrays with length in range', () => {
                expect(arraySchema.validate({array: [1, 2]})).toBe(true);
                expect(arraySchema.validate({array: [1, 2, 3]})).toBe(true);
                expect(arraySchema.validate({array: [1, 2, 3, 4]})).toBe(true);
            });

            test('should invalidate short arrays', () => {
                expect(arraySchema.validate({array: [1]})).toBe(false);
            });

            test('should invalidate long arrays', () => {
                expect(arraySchema.validate({array: [1, 2, 3, 4, 5]})).toBe(false);
            });
        });

        describe('ObjectValidator', () => {
            const objectSchema = new Schema([
                new Schema.ObjectValidator('object', {})
            ]);

            test('should invalidate arrays', () => {
                expect(objectSchema.validate({object: [1]})).toBe(false);
            });
        });

        describe('GroupValidator', () => {
            const groupSchema = new Schema([
                new Schema.GroupValidator('group', [
                    new Schema.StringValidator('group', {
                        minLength: 2,
                        maxLength: 4,
                        pattern: /^[A-z]*$/
                    }),
                    new Schema.NumberValidator('group', {
                        minValue: 2,
                        maxValue: 4,
                    })
                ])
            ]);

            test('should validate if at least one validator matches', () => {
                expect(groupSchema.validate({group: 'hi'})).toBe(true);
                expect(groupSchema.validate({group: 2})).toBe(true);
            });

            test('should invalidate if nothing matches', () => {
                expect(groupSchema.validate({group: 'wrong pattern'})).toBe(false);
                expect(groupSchema.validate({group: 0})).toBe(false);
                expect(groupSchema.validate({group: true})).toBe(false);
            });

            test('should throw error if sub-validators do not match key', () => {
                expect(() => new Schema.GroupValidator('key', [
                    new Schema.StringValidator('otherKey', {
                        minLength: 2,
                        maxLength: 4,
                        pattern: /^[A-z]*$/
                    }),
                    new Schema.NumberValidator('otherKey', {
                        minValue: 2,
                        maxValue: 4,
                    })
                ])).toThrow(/Cannot create a GroupValidator from validators with different keys/);
            });
        });
    });

    describe('parseUrl', () => {
        test('should parse a valid URL', () => {
            const schema = new Schema([
                new Schema.StringValidator('protocol', { enum: ['http', 'https'] }),
                new Schema.StringValidator('server', { required: true }),
                new Schema.NumberValidator('port', { minValue: 0, maxValue: 65535 }),
            ]);

            const url = new URL('https://example.com:8080');
            const parsedUrl = schema.parseUrl(url);
            expect(parsedUrl).toEqual({
                protocol: 'https',
                server: 'example.com',
                port: 8080,
                query: '',
                route: ''
            });
        });

        test('should extract expected values from a valid URL', () => {
            const schema = new Schema([
                new Schema.StringValidator('protocol', { enum: ['http', 'https'] }),
                new Schema.StringValidator('server', { required: true }),
                new Schema.NumberValidator('port', { minValue: 0, maxValue: 65535 }),
                new Schema.StringValidator('toExtract', {expected: true})
            ]);

            const url = new URL('https://example.com:8080/toExtract/message');
            const parsedUrl = schema.parseUrl(url);
            expect(parsedUrl).toEqual({
                protocol: 'https',
                server: 'example.com',
                port: 8080,
                query: '',
                route: '',
                toExtract: 'message'
            });
        });

        test('should extract query from a valid URL with query params', () => {
            const schema = new Schema([
                new Schema.StringValidator('protocol', { enum: ['http', 'https'] }),
                new Schema.StringValidator('server', { required: true }),
                new Schema.NumberValidator('port', { minValue: 0, maxValue: 65535 }),
            ]);

            const url = new URL('https://example.com:8080/path?key=value');
            const parsedUrl = schema.parseUrl(url);
            expect(parsedUrl).toEqual({
                protocol: 'https',
                server: 'example.com',
                port: 8080,
                query: 'key=value',
                route: '/path',
            });
        });

        test('should infer port from a valid port-less URL', () => {
            const schema = new Schema([
                new Schema.StringValidator('protocol', { enum: ['http', 'https', 'ws', 'wss'] }),
                new Schema.StringValidator('server', { required: true }),
                new Schema.NumberValidator('port', { minValue: 0, maxValue: 65535 }),
            ]);

            expect(schema.parseUrl(new URL('http://example.com'))).toEqual({
                protocol: 'http',
                server: 'example.com',
                port: 80,
                query: '',
                route: '',
            });

            expect(schema.parseUrl(new URL('https://example.com'))).toEqual({
                protocol: 'https',
                server: 'example.com',
                port: 443,
                query: '',
                route: '',
            });

            expect(schema.parseUrl(new URL('ws://example.com'))).toEqual({
                protocol: 'ws',
                server: 'example.com',
                port: 80,
                query: '',
                route: '',
            });

            expect(schema.parseUrl(new URL('wss://example.com'))).toEqual({
                protocol: 'wss',
                server: 'example.com',
                port: 443,
                query: '',
                route: '',
            });
        });

        test('should return null for an invalid URL', () => {
            const schema = new Schema([
                new Schema.StringValidator('protocol', { enum: ['http', 'https'] }),
                new Schema.StringValidator('server', { required: true }),
                new Schema.NumberValidator('port', { minValue: 0, maxValue: 65535 })
            ]);

            const url = new URL('ftp://example.com');
            const parsedUrl = schema.parseUrl(url);
            expect(parsedUrl).toBeNull();
        });
    });

    describe('parseRoute', () => {
        test('should parse a valid route', () => {
            const schema = new Schema([
                new Schema.StringValidator('type', { enum: ['json', 'xml'] })
            ]);

            const route = '/api/data.json';
            const parsedRoute = schema.parseRoute(route);
            expect(parsedRoute).toEqual({
                route: '/api/data.json',
                type: 'json',
                query: '',
            });
        });

        test('should return null for an invalid route', () => {
            const schema = new Schema([
                new Schema.StringValidator('type', { enum: ['json', 'xml'] })
            ]);

            const route = '/api/data.csv';
            const parsedRoute = schema.parseRoute(route);
            expect(parsedRoute).toBeNull();
        });

        test('should extract query from a valid route with query params', () => {
            const schema = new Schema([
                new Schema.StringValidator('type', { enum: ['json', 'xml'] })
            ]);

            const route = '/path?key=value';
            const parsedRoute = schema.parseRoute(route);
            expect(parsedRoute).toEqual({
                route: '/path',
                query: 'key=value'
            });
        });
    });
});
