const express = require('express')
const cors = require('cors')
const fileupload = require("express-fileupload");
const {spawn} = require('child_process')
const app = express()

app.use(fileupload());
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello')
})

app.get('/download/marksheet',(req,res)=>{
    var execFile = require('child_process').execFile;
    execFile('zip', ['-r', '-j','marksheet','./output'], function(err, stdout) {
        if(err){
            console.log(err);
            throw err;
        }
        res.download(__dirname+'/marksheet.zip')
    });
})
app.post('/upload',(req,res)=>{
    var master_roll=`./input/master_roll.csv`
    var responses=`./input/responses.csv`
    res.app.locals.positive = req.body.positive
    res.app.locals.negative = req.body.negative
    req.files.master_roll.mv(master_roll, err =>{
        if(err)
        {
            console.log(err)
            res.status(200).send({
                message : "Unexpected error while uploading",
                variant : "danzer"
            })
        }
        
    })
    req.files.responses.mv(responses, err =>{
        if(err)
        {
            console.log(err)
            res.status(200).send({
                message : "Unexpected error while uploading",
                variant : "danzer"
            })
        }
    })
    res.status(200).send({
        message : "Files uploaded successfully",
        variant : "success"
    })
})

app.post('/generatemarksheet',(req,res)=>{
    var dataToSend;
    const python = spawn('python3', ['generate_marksheet.py',res.app.locals.positive,res.app.locals.negative]);
    
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        res.app.locals.email = data.toString();
    });
    
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        if(code)
            res.status(404).send({
                message : "Error 404! Please check the format of response sheet.",
                variant : "danger"
            })
        else
            res.status(200).send({
                message : "Result sheet prepared succcessfully",
                variant : "success"
            })
    })
    
})

app.post('/generateconcisemarksheet',(req,res)=>{
    var dataToSend;
    const python = spawn('python3', ['generate_concise_marksheet.py']);
    
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        res.app.locals.email = data.toString();
    });
    
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        if(code)
            res.status(404).send({
                message : "Error 404! Please check the format of response sheet.",
                variant : "danger"
            })
        else
            res.status(200).send({
                message : "Concise marksheet prepared succcessfully",
                variant : "success"
            })
    })
})

app.post('/sendemail',(req,res)=>{
    var dataToSend;
    const python = spawn('python3', ['sendemail.py']);
    
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        // res.app.locals.email = data.toString();
    });
    
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        if(code)
            res.status(404).send({
                message : "Error 404! Can't send email.",
                variant : "danger"
            })
        else
            res.status(200).send({
                message : "Email sent succcessfully",
                variant : "success"
            })
    })
})

app.listen((process.env.PORT || 5000), ()=>{
    console.log('Backend started...')
})