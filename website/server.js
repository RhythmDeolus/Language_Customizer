let express = require('express');

let path = require('path');

let app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/js', express.static(path.join(__dirname, 'dist')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(8080, function(err) {
    if (err) console.error("Error while starting the server.\n",err);
    console.log("Runing the server on 8080");
})