const MAX_MESSAGE_SIZE = 300 * 1024 * 1024;
const VALID_FILETYPES = ['css', 'csv', 'dat', 'fbx', 'gif', 'glb', 'htm', 'html', 'jpg', 'jpeg', 'js', 'json', 'map', 'mp4', 'obj', 'otf', 'pdf', 'ply', 'png', 'splat', 'svg', 'ttf', 'wasm', 'webm', 'webp', 'woff', 'xml', 'zip', '3dt'];
/**
 * @typedef {'action' | 'beat' | 'delete' | 'get' | 'io' | 'keys' | 'message' | 'new' | 'patch' | 'ping' | 'post' | 'pub' | 'put' | 'res' | 'sub' | 'unsub'} MethodString
 */
/** @type MethodString[] */
const VALID_METHODS = ['action', 'beat', 'delete', 'get', 'io', 'keys', 'message', 'new', 'patch', 'ping', 'post', 'pub', 'put', 'res', 'sub', 'unsub'];

module.exports = {
    MAX_MESSAGE_SIZE,
    VALID_FILETYPES,
    VALID_METHODS
};
