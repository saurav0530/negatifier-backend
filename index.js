const express = require('express')
const uuid = require('uuid')
const cors = require('cors')
const fileupload = require("express-fileupload");
const {spawn} = require('child_process')
const app = express()

app.use(fileupload());
app.use(cors())
app.use(express.json())

// console.log(uuid.v4())

app.get('/',(req,res)=>{
    var data=req
    console.log(req)
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
        console.log('Hello from generate marksheet endpoint ...');
        res.app.locals.email = data.toString();
    });
    
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        if(code)
        {
            console.log(`Error in generating marksheet`);
            res.status(404).send({
                message : "Error 404! Please check the format of response sheet.",
                variant : "danger"
            })
        }
        else
        {
            console.log("Marksheet generated succcessfully")
            res.status(200).send({
                message : "Marksheet prepared succcessfully",
                variant : "success"
            })
        }
    })
    
})

app.post('/generateconcisemarksheet',(req,res)=>{
    var dataToSend;
    const python = spawn('python3', ['generate_concise_marksheet.py']);
    console.log('Hello from generate concise marksheet endpoint ...');
    python.stdout.on('data', function (data) {
        res.app.locals.email = data.toString();
    });
    
    python.on('close', (code) => {
        if(code)
        {
            console.log(`Error in generating concise marksheet`);
            res.status(404).send({
                message : "Error 404! Please check the format of response sheet.",
                variant : "danger"
            })
        }
        else
        {
            console.log("Concise marksheet generated succcessfully")
            res.status(200).send({
                message : "Concise marksheet prepared succcessfully",
                variant : "success"
            })
        }
    })
})

app.get('/status',(req,res)=>{
    console.log("Hi from status")
    if(res.app.locals.status)
    {
        res.status(res.app.locals.status.status).send(res.app.locals.status)
        res.app.locals.status= undefined
    }
    else
    {
        res.status(202).send({
            message: "Still processing! Please wait...",
            variant: 'success',
            status: 202
        })
    }
})

app.get('/sendemail',(req,res)=>{
    var dataToSend;
    console.log('From send email endpoint ...');
    res.status(202).send({
        message: "Request submitted! Processing...",
        variant: "success"
    })
    
    const python = spawn('python3', ['sendemail.py']);
    python.stdout.on('data', function (data) {
        dataToSend = data.toString()
    });
    
    python.on('close', (code) => {
        if(code)
        {
            console.log("Email not sent",dataToSend)
            res.app.locals.status = {
                message : "Error 404! Can't send email.",
                variant : "danger",
                data: dataToSend,
                status: 404
            }
        }
        else
        {
            console.log("Email sent successfully",dataToSend)
            res.app.locals.status = {
                message : "Email sent succcessfully",
                variant : "success",
                data : dataToSend,
                status: 200
            }
        }
    })
})

app.listen((process.env.PORT || 4000), ()=>{
    console.log(`Backend started at ${(process.env.PORT || 4000)}...`)
})