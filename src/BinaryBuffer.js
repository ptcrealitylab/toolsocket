/**
 * A convenience class for receiving and storing buffer data split into multiple messages
 */
class BinaryBuffer {
    /**
     * Creates a BinaryBuffer
     * @param {number} length - The length of the underlying buffer
     */
    constructor(length) {
        /** @type {?ToolSocketMessage} */
        this.mainMessage = null; // Contains the original message that asked for a BinaryBuffer to be created
        /** @type {Uint8Array[]} */
        this.messageBuffer = [];
        this.length = length;
    }

    /**
     * Returns true if `this.messageBuffer.length` meets or exceeds `this.length`
     * @returns {boolean}
     */
    get isFull() {
        return this.messageBuffer.length >= this.length;
    }

    /**
     * Pushes a message to the messageBuffer. Throws an error if pushing would cause the buffer
     * length to exceed `this.length`.
     * @param {Uint8Array} message
     */
    push(message) {
        if (this.isFull) {
            throw new Error('Cannot append more data to BinaryBuffer, length exceeded.');
        }
        this.messageBuffer.push(message);
    }
}

module.exports = BinaryBuffer;
