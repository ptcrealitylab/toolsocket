const ToolSocketMessage = require('./ToolSocketMessage.js');
const MessageBundle = require('./MessageBundle.js');

/**
 * An object that allows for responses for a specific message to be sent
 */
class ToolSocketResponse {
    /**
     * Creates a ToolSocketResponse
     * @param {ToolSocket} toolSocket - The ToolSocket used for communication
     * @param {ToolSocketMessage} originalMessage - The message that triggered this response
     */
    constructor(toolSocket, originalMessage) {
        if (!originalMessage.id) {
            throw new Error('Cannot create ToolSocketResponse for message with no ID.');
        }
        this.toolSocket = toolSocket;
        this.originalMessage = originalMessage;
        this.sent = false;
    }

    /**
     * Sends a response
     * @param {any} body - The message body to send
     * @param {MessageBinaryData} binaryData - The binary data to send with the message
     */
    send(body, binaryData) {
        if (this.sent) {
            console.error('Attempted to send response, but response was already sent.');
            return;
        }
        this.sent = true;
        if (body === undefined || body === null) {
            body = 204;
        }
        const message = new ToolSocketMessage(this.toolSocket.origin, this.originalMessage.network, 'res', this.originalMessage.route, body, this.originalMessage.id);
        const messageBundle = new MessageBundle(message, binaryData);
        this.toolSocket.send(messageBundle, null);
    }
}

module.exports = ToolSocketResponse;
