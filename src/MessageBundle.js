const { intToByte, byteToInt } = require('./utilities.js');
const ToolSocketMessage = require('./ToolSocketMessage.js');

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** @typedef {Uint8Array | ArrayBuffer | Uint8Array[] | ArrayBuffer[]} MessageBinaryData */

/**
 * Represents a message that may or may not include binary data
 */
class MessageBundle {
    /**
     * Creates a MessageBundle.
     * @param {ToolSocketMessage} message - The message
     * @param {MessageBinaryData} binaryData - The binary data
     */
    constructor(message, binaryData) {
        this.message = message;
        this.binaryData = binaryData;
    }

    /**
     * Converts this message bundle into a binary representation
     * @returns {Uint8Array} - The binary representation of the message bundle
     */
    toBinary() {
        if (Array.isArray(this.binaryData)) {
            throw new Error('Cannot convert array-based binary data to single binary.');
        }
        const messageBuffer = encoder.encode(JSON.stringify(this.message));
        const messageLengthBuffer = intToByte(messageBuffer.length);
        const binaryDataBuffer = this.binaryData ? new Uint8Array(this.binaryData) : null;
        // Apologies for the terrible naming in this block, but this keeps the following line cleaner by hiding the ternary operator
        const binaryDataBufferLength = binaryDataBuffer ? binaryDataBuffer.length : 0;
        const binaryOutput = new Uint8Array(messageLengthBuffer.length + messageBuffer.length + binaryDataBufferLength);
        binaryOutput.set(messageLengthBuffer, 0);
        binaryOutput.set(messageBuffer, messageLengthBuffer.length);
        if (binaryDataBuffer) {
            binaryOutput.set(binaryDataBuffer, messageLengthBuffer.length + messageBuffer.length);
        }
        return binaryOutput;
    }

    /**
     * Creates a MessageBundle from a string message
     * @param {string} string - The message to convert into a MessageBundle
     * @returns {MessageBundle} - The created MessageBundle
     */
    static fromString(string) {
        return new MessageBundle(ToolSocketMessage.fromString(string), null);
    }

    /**
     * Creates a MessageBundle from a binary message
     * @param {Uint8Array} binary - The binary message to convert into a MessageBundle
     * @returns {MessageBundle} - The created MessageBundle
     */
    static fromBinary(binary) {
        const bufferLength = byteToInt(binary.slice(0, 4));
        const message = ToolSocketMessage.fromString(decoder.decode(binary.slice(4, bufferLength + 4)));
        const binaryData = binary.slice(bufferLength + 4, binary.length);
        return new MessageBundle(message, binaryData);
    }

    /**
     * Creates a MessageBundle from a BinaryBuffer
     * @param {BinaryBuffer} binaryBuffer - The BinaryBuffer to convert into a MessageBundle
     * @returns {MessageBundle} - The created MessageBundle
     */
    static fromBinaryBuffer(binaryBuffer) {
        if (!binaryBuffer.isFull) {
            throw new Error('Cannot create a MessageBundle from a BinaryBuffer that is not full.');
        }
        const message = binaryBuffer.mainMessage;
        /** @type Uint8Array[] */
        const binaryData = [];
        binaryBuffer.messageBuffer.forEach(message => {
            binaryData.push(message);
        });
        return new MessageBundle(message, binaryData);
    }
}

module.exports = MessageBundle;
