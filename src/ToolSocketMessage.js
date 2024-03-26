/**
 * A message in ToolSocket's format
 */
class ToolSocketMessage {
    // TODO: define body type and parameter descriptions better
    /**
     * Creates a ToolSocketMessage
     * @param {string} origin - The origin
     * @param {string} network - The network
     * @param {string} method - The method being performed (e.g. get, post)
     * @param {string} route - The route to send the message to
     * @param {any} body - The message body
     * @param {string?} id - An ID for listening to responses
     */
    constructor(origin, network, method, route, body, id) {
        // These parameters are impossible to read in code, use the getters and setters
        this.o = origin;
        this.n = network;
        this.m = method;
        this.r = route;
        this.b = body;
        this.i = id;
        this.s = null;
        /** @type {?number} */
        this.f = null;
    }

    /** @type {string} */
    get origin() {
        return this.o;
    }

    /** @param {string} newOrigin */
    set origin(newOrigin) {
        this.o = newOrigin;
    }

    /** @type {string} */
    get network() {
        return this.n;
    }

    /** @param {string} newNetwork */
    set network(newNetwork) {
        this.n = newNetwork;
    }

    /** @type {string} */
    get method() {
        return this.m;
    }

    /** @param {string} newMethod */
    set method(newMethod) {
        this.m = newMethod;
    }

    /** @type {string} */
    get route() {
        return this.r;
    }

    /** @param {string} newRoute */
    set route(newRoute) {
        this.r = newRoute;
    }

    /** @type {any} */
    get body() {
        return this.b;
    }

    /** @param {any} newBody */
    set body(newBody) {
        this.b = newBody;
    }

    /** @type {?string} */
    get id() {
        return this.i;
    }

    /** @param {?string} newId */
    set id(newId) {
        this.i = newId;
    }

    // TODO: figure out what .s is

    /** @type {?number} */
    get frameCount() {
        return this.f;
    }

    /** @param {?number} newFrameCount */
    set frameCount(newFrameCount) {
        this.f = newFrameCount;
    }

    /**
     * Creates a ToolSocketMessage from a JSON string
     * @param {string} string - The JSON string
     * @return {ToolSocketMessage} - The generated ToolSocketMessage
     */
    static fromString(string) {
        const object = JSON.parse(string);
        if ([object.o, object.n, object.m, object.r, object.b].some(value => value === undefined)) {
            throw new Error(`Cannot parse ToolSocketMessageString, required value is undefined: ${JSON.stringify(object)}`);
        }
        const message = new ToolSocketMessage(object.o, object.n, object.m, object.r, object.b, object.i);
        message.s = object.s !== undefined ? object.s : null;
        message.f = object.f !== undefined ? object.f : null;
        return message;
    }
}

module.exports = ToolSocketMessage;
