const ToolSocket = require("./ToolSocket");

class IncomingToolSocket extends ToolSocket {
    /**
     * Creates an IncomingToolSocket from an incoming WebSocket connection. Used by ToolSocketServer.
     * @param {WebSocket} websocket - The incoming WebSocket connection.
     * @param {ToolSocketServer} server - The ToolSocketServer this is attached to.
     */
    constructor(websocket, server) {
        super();
        this.socket = websocket;
        this.networkId = 'toolbox'; // Or 'io'?
        this.origin = server.origin;
        this.server = server;
        this.configureSocket();
    }

    /**
     * Requests the source to create another ToolSocket connection for parallel data transfer.
     * @return {Promise<ToolSocket>} - The parallel socket we just created.
     */
    requestParallelSocket() {
        return this.server.requestParallelSocket(this);
    }
}

module.exports = IncomingToolSocket;
