# toolsocket

### install
add the following to your package.json
```json
 "dependencies": {
    "toolsocket": "ptcrealitylab/toolsocket#main"
  }
  ```
`npm install`

### Initialize Server
```javascript
const ToolSocket = require('toolsocket');
let serverPort= 12345;
let webSocketServer = new ToolSocket.Server({port: serverPort, origin: 'proxy'});

webSocketServer.on('connection', function connection(socket) {
  // place your socket code here
});
```

### Initialize Client in Nodejs

```javascript
const ToolSocket = require("toolsocket");
socket = new ToolSocket('ws://localhost:12345', 'networkID', 'client');
```

### Initialize Client in Web-Browser

```html
<script src="node_modules/toolsocket/index.js"></script>
<script>
    socket = new ToolSocket('ws://localhost:12345', 'networkID', 'web');
</script>
```

Network ID is like a Room that allows you to group messages by a specific Network.

### Send a Message via the Socket
#### with req/res style callback
```javascript
// with req/res call back
let route = "/";
let msg = "hello";
socket.post(route, msg, function (msg) {
    console.log(msg); // "hi"
});
```
#### message without acknowledgment 
```javascript
let route = "/";
let msg = "hello";
socket.post(route, msg);
```

### Receive a Message via the Socket
#### with req/res style callback
```javascript
socket.on('post', function (route, msg, res) {
    if(route === "/") {
        console.log(msg) // "hello"
        res.send('hi');
    }
}) 
``` 
#### message without acknowledgment
```javascript
socket.on('post', function (route, msg) {
    if(route === "/")
    console.log(msg) // "hello"
}) 
``` 

Every ``post`` can be replaced with `"beat", "action", "get", "post", "put", "patch", "delete", "new", "message"`

### Other Socket Events:

```javascript
socket.on('network', function incoming(newNet, oldNet) {
    console.log(newNet, oldNet) // new networkID, old networkID
});

socket.on('close', function connection() {
    console.log('CONNECTION LOST'); // 'CONNECTION LOST'
})

socket.on('open', function open() {
    // Place your socket event code here to call it at the right moment.
});

socket.on("status", function(status){
    if(status === socket.OPEN){
        // test for socket open
    } else if(status === socket.OPEN){
        // test for socket closed
    }
})

socket.on('error', function open(e) {
    console.log(e); // output error message
});

socket.on('connected', function open() {});

```

### Setter 

```javascript
socket.close();
```