const Schema = require('./Schema.js');
const ToolSocket = require('./ToolSocket.js');
const ToolSocketServer = require('./ToolSocketServer.js');

const { intToByte, byteToInt, generateUniqueId, isBrowser } = require('./utilities.js');
const { URL_SCHEMA, MESSAGE_BUNDLE_SCHEMA } = require('./schemas.js');

ToolSocket.MESSAGE_BUNDLE_SCHEMA = MESSAGE_BUNDLE_SCHEMA;
ToolSocket.URL_SCHEMA = URL_SCHEMA;
ToolSocket.Io = ToolSocket;
ToolSocket.intToByte = intToByte;
ToolSocket.byteToInt = byteToInt;
ToolSocket.uuidShort = generateUniqueId;
ToolSocket.generateUniqueId = generateUniqueId;
ToolSocket.Schema = Schema;

if (isBrowser) {
    window.io = new ToolSocket();
} else {
    ToolSocket.Server = ToolSocketServer;
}
module.exports = ToolSocket;
