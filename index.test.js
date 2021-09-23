const ToolSocket = require('./index.js');
let client = new ToolSocket("ws://localhost:1234", "xkjhasdflk", "web");
var server = new ToolSocket.Server({port: 1234})

setTimeout(function(){
    process.exit();
},3000);

test('server & client connection test', done => {
    let string = "";
    while(string.length<1000000){
        string = string +"client";
    }
    let packageCount = 0;
    let packageRes = 0;
    let hello = false;
    let simple = false;
    client.on('open', function connection() {
        client.dataPackageSchema.items.properties.m.enum.map(method => {
            if(method !== "res") {
                packageCount++;
                client[method]('/', 'hello', function (m) {
                    expect(m).toBe('hello');
                })
            }
        });

        packageCount++;
        client.post('/', string, function (m) {
            expect(m).toBe('hello');
        })

        client.dataPackageSchema.items.properties.m.enum.map(method => {
            if(method !== "res") {
                packageCount++;
                client[method]('/x/', 'hello', function (m) {
                    expect(m).toBe('hola');
                })
            }
        });

        client.dataPackageSchema.items.properties.m.enum.map(method => {
            if(method !== "res") {
                packageCount++;
                client[method]('/y/', 'simple')
            }
        });
    })
    server.on('connection', function connection(ws) {
        setTimeout(function(){
            ws.close();
        },1000);
        client.dataPackageSchema.items.properties.m.enum.map(method => {
            ws.on(method, function (route, msg, res) {
                if(route === "action/ping"){
                    packageRes++;
                }
                if(route === "/") {
                    packageRes++;
                    res.send('hello');
                    hello = true;
                }
                else if(route === "/x/"){
                    packageRes++;
                    res.send('hola');
                }
                else if(route === "/y/"){
                    packageRes++;
                    expect(msg).toBe('simple');
                    simple = true;
                }

            });
        });
        setTimeout(function(){
            expect(Object.keys(client.packageCb).length).toBe(0);
            expect(packageCount).toBe(packageRes);
            expect(hello).toBe(true);
            expect(simple).toBe(true);
            done();
        },500);
        setTimeout(function(){
            client.socket.close();
        },1000);
    });
});

test('validate(): normal package validation', () => {
    client.dataPackageSchema.items.properties.o.enum.map(origin => {
        client.dataPackageSchema.items.properties.m.enum.map(method => {
            expect(client.validate(new client.DataPackage(origin, "dklasdjd", method, "/", "{test:rest}", 2), 2000, client.dataPackageSchema)).toBe(false);
        });
    });
    expect(client.validate(new client.DataPackage("client", "dklasdjd", "post", "/", "{test:rest}", null), 2000, client.dataPackageSchema)).toBe(false);
    expect(client.validate(new client.DataPackage("client", "dklasdjd", "post", "/", "{test:rest}", 0), 2000, client.dataPackageSchema)).toBe(false);
});
test('validate(): out of range ID validation', () => {
    var obj = new client.DataPackage("client", "dklasdjd", "post", "/", "{test:rest}",  Number.MAX_SAFE_INTEGER+1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
     obj = new client.DataPackage("client", "dklasdjd", "post", "/", "{test:rest}",  "sdsds");
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("client", "dklasdjd", "post", "/", "{test:rest}",  -1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
});
test('validate(): out of range origin validation', () => {
    var obj = new client.DataPackage("cl&ient", "dklasdjd", "post", "/", "{test:rest}", 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage(2394876234983649892738462398746, "dklasdjd", "post", "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("something", "dklasdjd", "post", "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    let string = "";
    while(string.length<2000){
        string = string +"client";
    }
    obj = new client.DataPackage(string, "dklasdjd", "post", "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
});

test('validate(): out of range method validation', () => {
    var obj = new client.DataPackage("client", "dklasdjd", "po''st", "/", "{test:rest}", 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("client", "dklasdjd", 2348734092387402394867230492376492347639487, "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("client", "dklasdjd", null, "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    let string = "";
    while(string.length<2000){
        string = string +"post";
    }
    obj = new client.DataPackage("client", "dklasdjd", string, "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
});

test('validate(): out of range network validation', () => {
    var obj = new client.DataPackage("client", "cli''ent", "post", "/", "{test:rest}", 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("client", 2, "post", "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("client", "some%$thing", "post", "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    let string = "";
    while(string.length<2000){
        string = string +"client";
    }
    obj = new client.DataPackage("client", string, "post", "/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
});
test('validate(): out of range route validation', () => {
    var obj = new client.DataPackage("client", "dklasdjd", "post", "/''", "{test:rest}", 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("client", "dklasdjd", "post", 232312423423543523534565436456, "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    obj = new client.DataPackage("client", "dklasdjd", "post", "/&%(/$&)/=()(/", "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
    let string = "";
    while(string.length<2000){
        string = string +"client";
    }
    obj = new client.DataPackage('client', "dklasdjd", "post", string, "{test:rest}",  1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(true);
});

test('validate(): body validation', () => {
    var obj = new client.DataPackage("client", "dklasdjd", "post", "/", 0, 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(false);
    var obj = new client.DataPackage("client", "dklasdjd", "post", "/", "''zwidugaodig826/%&(8758765", 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(false);
    var obj = new client.DataPackage("client", "dklasdjd", "post", "/", {test : 0}, 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(false);
    var obj = new client.DataPackage("client", "dklasdjd", "post", "/", null, 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(false);
    var obj = new client.DataPackage("client", "dklasdjd", "post", "/", [0,1,4,2,4,5], 1);
    expect(client.validate(obj, 2000, client.dataPackageSchema)).toBe(false);
});

test('validate(): out of range body validation', () => {
    let string = "";
    while(string.length<70000002){
        string = string +"client";
    }
    obj = new client.DataPackage('client', "dklasdjd", "post", "/", string,  1);
    expect(client.validate(obj, string.length, client.dataPackageSchema)).toBe(true);

    let array = [];
    while(string.length<70000002){
        array.push("cl");
    }
    obj = new client.DataPackage('client', "dklasdjd", "post", "/", string,  1);
    expect(client.validate(obj, JSON.stringify(array).length, client.dataPackageSchema)).toBe(true);

    let object = {};
    for (let step = 0; step < 87500; step++) {
        object[step] = "xl"
    }
    obj = new client.DataPackage('client', "dklasdjd", "post", "/", string,  1);
    expect(client.validate(obj, JSON.stringify(object).length, client.dataPackageSchema)).toBe(true);
});


