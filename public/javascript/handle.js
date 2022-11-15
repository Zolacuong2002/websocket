
    // Create WebSocket connection.
    const socket = new WebSocket('ws://localhost:3000');

    // Connection opened
    socket.addEventListener('open', function (event) {
        console.log('Connected to the WS Server!')
    });

    // Connection closed
    socket.addEventListener('close', function (event) {
        console.log('Disconnected from the WS Server!')
    });

        // Listen for messages
        socket.addEventListener('message', function (event) {
        if (event.data instanceof Blob) {
            // I have to read the data that comes as a Blob with a FileReader
            reader = new FileReader();

            reader.onload = () => {
                addTag(reader.result)
            };

            reader.readAsText(event.data);
        } else {
            addTag(event.data)
        }
        console.log(event.data);
    });

    const addTag = (data) =>{
        var div = document.getElementsByClassName('chatBox');
        var p = document.createElement('p');
        p.innerHTML = data;
        p.setAttribute('id', 'chat');
        div[0].append(p)
        location.reload();
    }
    // Send a msg to the websocket
    const sendMsg = (uid) => {
        var msg = document.getElementById('msg').value;
        document.getElementById('msg').value = '';
        socket.send(uid+msg);
        location.reload();
    }
