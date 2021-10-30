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
    res.download(__dirname+'/marksheet.zip')
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
    res.status(202).send({
        message: "Request submitted! Processing...",
        variant: "success"
    })
    const python = spawn('python3', ['generate_marksheet.py',res.app.locals.positive,res.app.locals.negative]);
    
    python.stdout.on('data', function (data) {
        console.log('Hello from generate marksheet endpoint ...');
        dataToSend = data.toString();
    });
    
    python.on('close', (code) => {
        if(code)
        {
            console.log(`Error in generating marksheet`);
            res.app.locals.marksheetStatus = {
                message : "Error 404! Please check the format of response sheet.",
                variant : "danger",
                data: dataToSend,
                status: 404
            }
        }
        else
        {
            console.log("Marksheet generated succcessfully")
            res.app.locals.marksheetStatus = {
                message : "Marksheet prepared succcessfully",
                variant : "success",
                data: dataToSend,
                status: 200
            }
        }
    })
    
})
app.get('/generatemarksheet/status',(req,res)=>{
    console.log("Hi from marksheet status")
    if(res.app.locals.marksheetStatus)
    {
        res.status(res.app.locals.marksheetStatus.status).send(res.app.locals.marksheetStatus)
        res.app.locals.marksheetStatus= undefined
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

app.post('/generateconcisemarksheet',(req,res)=>{
    var dataToSend;
    res.status(202).send({
        message: "Request submitted! Processing...",
        variant: "success"
    })
    const python = spawn('python3', ['generate_concise_marksheet.py']);
    console.log('Hello from generate concise marksheet endpoint ...');
    python.stdout.on('data', function (data) {
        dataToSend = data.toString();
    });
    
    python.on('close', (code) => {
        if(code)
        {
            console.log(`Error in generating concise marksheet`);
            res.app.locals.CSmarksheetStatus = {
                message : "Error 404! Please check the format of response sheet.",
                variant : "danger",
                data : dataToSend,
                status: 404
            }
        }
        else
        {
            console.log("Concise marksheet generated succcessfully")
            res.app.locals.CSmarksheetStatus = {
                message : "Concise marksheet prepared succcessfully",
                variant : "success",
                data : dataToSend,
                status: 200
            }
        }
    })
})
app.get('/generateconcisemarksheet/status',(req,res)=>{
    console.log("Hi from concise status")
    if(res.app.locals.CSmarksheetStatus)
    {
        res.status(res.app.locals.CSmarksheetStatus.status).send(res.app.locals.CSmarksheetStatus)
        res.app.locals.CSmarksheetStatus= undefined
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
            res.app.locals.sendemailStatus = {
                message : "Error 404! Can't send email.",
                variant : "danger",
                data: dataToSend,
                status: 404
            }
        }
        else
        {
            console.log("Email sent successfully",dataToSend)
            res.app.locals.sendemailStatus = {
                message : "Email sent succcessfully",
                variant : "success",
                data : dataToSend,
                status: 200
            }
        }
    })
})

app.get('/sendemail/status',(req,res)=>{
    console.log("Hi from email status")
    if(res.app.locals.sendemailStatus)
    {
        res.status(res.app.locals.sendemailStatus.status).send(res.app.locals.sendemailStatus)
        res.app.locals.sendemailStatus= undefined
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

app.listen((process.env.PORT || 4000), ()=>{
    console.log(`Backend started at ${(process.env.PORT || 4000)}...`)
})