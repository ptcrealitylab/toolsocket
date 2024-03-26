/**
 * A convenience class for receiving and storing buffer data split into multiple messages
 */
class BinaryBuffer {
    /**
     * Creates a BinaryBuffer
     * @param {number} length - The length of the underlying buffer
     */
    constructor(length) {
        // this.buffer = new Uint8Array(length);
        /** @type {?ToolSocketMessage} */
        this.mainMessage = null; // Object that contains data about the whole message
        this.messageBuffer = []; // TODO: look into if this can be replaced with a Uint8Array
        this.length = length;
    }

    /**
     * Returns true if `this.messageBuffer.length` meets or exceeds `this.length`
     * @returns {boolean}
     */
    get isFull() {
        return this.messageBuffer.length >= this.length;
    }

    // TODO: determine the type of `message`, are we pushing Uint8Arrays?
    /**
     * Pushes a message to the messageBuffer. Throws an error if pushing would cause the buffer
     * length to exceed `this.length`.
     * @param message
     */
    push(message) {
        if (this.isFull) {
            throw new Error('Cannot append more data to BinaryBuffer, length exceeded.');
        }
        this.messageBuffer.push(message);
    }
}

module.exports = BinaryBuffer;
