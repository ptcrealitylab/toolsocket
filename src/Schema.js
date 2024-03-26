/**
 * An object that validates constraints on an object's properties
 */
class Schema {
    /**
     * Creates a Schema
     * @param {[SchemaValidator]} validators - The validators to use for validation
     */
    constructor(validators) {
        this.validators = validators;
        this.failedValidator = null;
    }

    /**
     * A list of keys that are expected to be found when parsing
     * @returns {[string]}
     */
    get expectedKeys() {
        return this.validators.filter(v => v.expected).map(v => v.key);
    }

    /**
     * Converts the schema into the old schema format for backwards compatibility purposes
     * @returns {object} - The old-format schema
     */
    get oldFormat() {
        const schema = {
            type: 'object',
            items: {
                properties: {},
                required: this.validators.filter(v => v.required).map(v => v.key),
                expected: this.validators.filter(v => v.expected).map(v => v.key)
            }
        };

        /**
         * Gets the old-format type for a validator
         * @param {SchemaValidator} validator - The SchemaValidator
         * @returns {(string|*)[]|string} - The type output
         */
        function getEntryType(validator) {
            switch (validator.constructor) {
            case StringValidator:
                return 'string';
            case NumberValidator:
                return 'number';
            case BooleanValidator:
                return 'boolean';
            case NullValidator:
                return 'null';
            case UndefinedValidator:
                return 'undefined';
            case ArrayValidator:
                return 'array';
            case ObjectValidator:
                return 'object';
            case GroupValidator:
                return validator.validators.map(v => getEntryType(v));
            }
        }

        /**
         * Gets the old-format constraints for a validator
         * @param {SchemaValidator} validator - The SchemaValidator
         * @returns {object} - The constraints
         */
        function getConstraints(validator) {
            if (validator.constructor === GroupValidator) {
                return validator.validators.reduce((output, v) => {
                    Object.entries(v).forEach(entry => {
                        if (['required', 'expected', 'key'].includes(entry[0])) {
                            return;
                        }
                        if (entry[1] === null) {
                            return;
                        }
                        output[entry[0]] = entry[1];
                    });
                    return output;
                }, {});
            }
            const output = {};
            Object.entries(validator).forEach(entry => {
                if (['required', 'expected'].includes(entry[0])) {
                    return;
                }
                output[entry[0]] = entry[1];
            });
            return output;
        }

        this.validators.forEach(v => {
            schema.items.properties[v.key] = {
                type: getEntryType(v),
                ...getConstraints(v)
            };
        });
        return schema;
    }

    /**
     * Checks if the given object matches the requirements set by this Schema
     * @param {object} object - The object to check
     * @returns {boolean} - Whether the object meets the requirements
     */
    validate(object) {
        for (let validator of this.validators) {
            if (!validator.validate(object)) {
                this.failedValidator = validator;
                return false;
            }
        }
        this.failedValidator = null;
        return true;
    }

    /**
     * Parses a URL and extracts all `expected === true` keys from it.
     * @param {URL} url - The URL to parse
     * @returns {?ParsedUrl} - The extracted data
     */
    parseUrl(url) {
        const protocol = url.protocol.slice(0, -1); // Drop tailing colon
        let port;
        if (url.port !== '') {
            port = parseInt(url.port);
        } else {
            if (['wss', 'https'].includes(protocol)) {
                port = 443;
            } else if (['ws', 'http'].includes(protocol)) {
                port = 80;
            } else {
                return null;
            }
        }

        /**
         * @typedef {object} ParsedUrl
         * @property {string} protocol - The protocol scheme
         * @property {string} server - The hostname
         * @property {number} port - The port number
         * @property {string} route - The pathname with expected schema parameters removed
         * @property {string} [type] - The filetype
         * @property {string} query - The query parameters
         */

        const parsedRoute = this.parseRoute(url.pathname, true);
        const parsedUrl = {
            protocol: protocol,
            server: url.hostname,
            port: port,
            ...parsedRoute,
            query: url.searchParams.toString()
        };

        if (this.validate(parsedUrl)) {
            return parsedUrl;
        }
        return null;
    }

    /**
     * Parses a route and extracts all `expected === true` keys from it.
     * @param {string} route - The route to parse
     * @param {boolean?} skipValidation - Whether to skip validation, only used by parseUrl
     * @returns {?ParsedRoute} - The extracted data
     */
    parseRoute(route, skipValidation) {
        /**
         * @typedef {object} ParsedRoute
         * @property {string} route - The pathname with expected schema parameters removed
         * @property {string} [type] - The filetype
         * @property {string} query - The query parameters
         */

        /** @type {ParsedRoute} */
        const parsedRoute = {
            route: '',
            // type: filetype
            query: route.includes('?') ? route.slice(route.indexOf('?') + 1) : ''
        };

        const pathname = route.split('?')[0];
        const pathSegments = pathname.split('/');
        const lastPathSegment = pathSegments.at(-1);
        if (lastPathSegment.split('.').length > 1) {
            parsedRoute.type = lastPathSegment.split('.').at(-1);
        }

        for (let i = 0; i < pathSegments.length; i++) {
            const pathSegment = pathSegments[i];
            if (this.expectedKeys.includes(pathSegment)) {
                if (pathSegments[i + 1]) {
                    parsedRoute[pathSegment] = pathSegments[i + 1];
                }
                i++; // Skip to next pathSegment after key-value pair
                continue;
            }
            if (pathSegment === '') {
                continue;
            }
            parsedRoute.route += '/' + pathSegment;
        }

        if (skipValidation || this.validate(parsedRoute)) {
            return parsedRoute;
        }
        return null;
    }
}

/**
 * An object that validates constraints on one of an object's properties
 */
class SchemaValidator {
    /**
     * Creates a SchemaValidator
     * @param {string} key - The key to validate
     * @param {{
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        this.key = key;
        if (options === undefined) {
            options = {};
        }
        this.required = options.required !== undefined ? options.required : false;
        this.expected = options.expected !== undefined ? options.expected : false;
        this.enum = options.enum !== undefined ? options.enum : null;
    }

    /**
     * Checks if the given object matches the requirements set by this SchemaValidator
     * @param {object} object - The object to check
     * @returns {boolean} - Whether the object meets the requirements
     */
    validate(object) {
        if (this.required !== null && this.required) {
            if (!(this.key in object)) {
                return false;
            }
        }
        const value = object[this.key];
        if (this.key in object && this.enum !== null && !this.enum.includes(value)) {
            return false;
        }
        return true;
    }
}

/**
 * A SchemaValidator that validates string types
 */
class StringValidator extends SchemaValidator {
    /**
     * Creates a StringValidator
     * @param {string} key - The key to validate
     * @param {{
     *     minLength?: number,
     *     maxLength?: number,
     *     pattern?: RegExp,
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        super(key, options);
        if (options === undefined) {
            options = {};
        }
        this.minLength = options.minLength !== undefined ? options.minLength : null;
        this.maxLength = options.maxLength !== undefined ? options.maxLength : null;
        this.pattern = options.pattern !== undefined ? options.pattern : null;
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        const value = object[this.key];
        if (typeof value !== 'string') {
            return false;
        }
        if (this.minLength !== null && value.length < this.minLength) {
            return false;
        }
        if (this.maxLength !== null && value.length > this.maxLength) {
            return false;
        }
        if (this.pattern !== null && !value.match(this.pattern)) {
            return false;
        }
        return true;
    }
}

/**
 * A SchemaValidator that validates number types
 */
class NumberValidator extends SchemaValidator {
    /**
     * Creates a NumberValidator
     * @param {string} key - The key to validate
     * @param {{
     *     minValue?: number,
     *     maxValue?: number,
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        super(key, options);
        if (options === undefined) {
            options = {};
        }
        this.minValue = options.minValue !== undefined ? options.minValue : null;
        this.maxValue = options.maxValue !== undefined ? options.maxValue : null;
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        const value = object[this.key];
        if (typeof value !== 'number') {
            return false;
        }
        if (this.minValue !== null && value < this.minValue) {
            return false;
        }
        if (this.maxValue !== null && value > this.maxValue) {
            return false;
        }
        return true;
    }
}

/**
 * A SchemaValidator that validates boolean types
 */
class BooleanValidator extends SchemaValidator {
    /**
     * Creates a BooleanValidator
     * @param {string} key - The key to validate
     * @param {{
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        super(key, options);
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        return typeof object[this.key] === 'boolean';
    }
}

/**
 * A SchemaValidator that validates null types
 */
class NullValidator extends SchemaValidator {
    /**
     * Creates a NullValidator
     * @param {string} key - The key to validate
     * @param {{
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        super(key, options);
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        return object[this.key] === null;
    }
}

/**
 * A SchemaValidator that validates undefined types
 */
class UndefinedValidator extends SchemaValidator {
    /**
     * Creates an UndefinedValidator
     * @param {string} key - The key to validate
     * @param {{
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        super(key, options);
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        return object[this.key] === undefined;
    }
}

/**
 * A SchemaValidator that validates array types
 */
class ArrayValidator extends SchemaValidator {
    /**
     * Creates an ArrayValidator
     * @param {string} key - The key to validate
     * @param {{
     *     minLength?: number,
     *     maxLength?: number,
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        super(key, options);
        if (options === undefined) {
            options = {};
        }
        this.minLength = options.minLength !== undefined ? options.minLength : null;
        this.maxLength = options.maxLength !== undefined ? options.maxLength : null;
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        const value = object[this.key];
        if (!Array.isArray(value)) {
            return false;
        }
        if (this.minLength !== null && value.length < this.minLength) {
            return false;
        }
        if (this.maxLength !== null && value.length > this.maxLength) {
            return false;
        }
        return true;
    }
}

/**
 * A SchemaValidator that validates object types
 */
class ObjectValidator extends SchemaValidator {
    /**
     * Creates an ObjectValidator
     * @param {string} key - The key to validate
     * @param {{
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, options) {
        super(key, options);
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        const value = object[this.key];
        return typeof value === 'object' && !Array.isArray(value);
    }
}

/**
 * A SchemaValidator that uses multiple sub-validators to support multiple type options for a given
 * key.
 */
class GroupValidator extends SchemaValidator {
    /**
     * Creates an ObjectValidator
     * @param {string} key - The key to validate
     * @param {[SchemaValidator]} validators - The validators to validate with
     * @param {{
     *     required?: boolean,
     *     expected?: boolean,
     *     enum?: [object]
     * }} [options] - Options that define how this validates objects
     */
    constructor(key, validators, options) {
        super(key, options);
        if (validators.some(validator => validator.key !== key)) {
            throw new Error(`Cannot create a GroupValidator from validators with different keys.\n${JSON.stringify(validators)}`);
        }
        this.validators = validators;
    }

    validate(object) {
        if (!super.validate(object)) {
            return false;
        }
        if (!(this.key in object)) {
            return true; // If not required, passes trivially when not present
        }
        return this.validators.some(validator => validator.validate(object));
    }
}

Schema.StringValidator = StringValidator;
Schema.NumberValidator = NumberValidator;
Schema.BooleanValidator = BooleanValidator;
Schema.NullValidator = NullValidator;
Schema.UndefinedValidator = UndefinedValidator;
Schema.ArrayValidator = ArrayValidator;
Schema.ObjectValidator = ObjectValidator;
Schema.GroupValidator = GroupValidator;

module.exports = Schema;
