const { WebSocketWrapper } = require('./utilities.js');
const { URL_SCHEMA, MESSAGE_BUNDLE_SCHEMA } = require('./schemas.js');
const IncomingToolSocket = require('./IncomingToolSocket');
const {generateUniqueId} = require("./utilities");

/**
 * A server for ToolSocket
 */
class ToolSocketServer {
    /**
     * Constructs a ToolSocketServer
     * @param {Object} options - Options to pass to the WebSocket.Server constructor
     * @param {string} [origin] - The origin
     */
    constructor(options, origin) {
        this.origin = origin || 'server';
        this.server = new WebSocketWrapper.Server(options);

        /** @type [ToolSocket] */
        this.sockets = [];

        this.eventCallbacks = {}; // For internal events

        this.pendingParallelRequests = new Map();

        this.server.on('listening', (...args) => {
            this.triggerEvent('listening', ...args);
        });

        this.server.on('connection', socket => {
            const toolSocket = new IncomingToolSocket(socket, this);
            this.sockets.push(toolSocket);
            this.triggerEvent('connection', toolSocket);

            toolSocket.on('confirmParallel', id => {
                if (this.pendingParallelRequests.has(id)) {
                    const resolve = this.pendingParallelRequests.get(id);
                    resolve(toolSocket);
                    this.pendingParallelRequests.delete(id);
                }
            });

            socket.on('close', () => {
                this.sockets.splice(this.sockets.indexOf(toolSocket), 1);
            });
        });

        this.server.on('close', (...args) => {
            this.triggerEvent('close', ...args);
        });

        this.configureAliases();
    }

    /**
     * Adds an event listener to internal events
     * @param {string} eventType - The event type to listen to
     * @param {function} callback - The function to call when the event occurs
     */
    addEventListener(eventType, callback) {
        if (!this.eventCallbacks[eventType]) {
            this.eventCallbacks[eventType] = [];
        }
        this.eventCallbacks[eventType].push(callback);
    }

    /**
     * Triggers event listeners for a given event
     * @param {string} eventType - The event type to trigger
     * @param {...any} args - The arguments to pass to the event listeners
     */
    triggerEvent(eventType, ...args) {
        if (!this.eventCallbacks[eventType]) {
            return;
        }
        this.eventCallbacks[eventType].forEach(callback => callback(...args));
    }

    /**
     * Clears all event listeners
     */
    removeAllListeners() {
        this.eventCallbacks = [];
    }

    /**
     * Adds aliases for backwards compatibility
     */
    configureAliases() {
        this.on = this.addEventListener;
        this.emitInt = this.triggerEvent;
        this.dataPackageSchema = MESSAGE_BUNDLE_SCHEMA.oldFormat;
        this.routeSchema = URL_SCHEMA.oldFormat;
        this.server.server = this.server;
    }

    /**
     * Requests the source to create another ToolSocket connection for parallel data transfer.
     * @param {ToolSocket} toolSocket - The toolSocket requesting a parallel connection.
     * @return {Promise<ToolSocket>} - The parallel socket we just created.
     */
    requestParallelSocket(toolSocket) {
        const id = generateUniqueId(8);
        toolSocket.meta('requestParallel', id, null, null);
        let resolve;
        const promise = new Promise((res) => {
            resolve = res;
        });
        this.pendingParallelRequests.set(id, resolve);
        return promise;
    }

    close() {
        this.server.close();
    }
}

module.exports = ToolSocketServer;
