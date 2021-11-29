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
    res.sendFile(__dirname+'/marksheet.zip')
})

app.post('/upload',(req,res)=>{
    var master_roll=`./input/master_roll.csv`
    var responses=`./input/responses.csv`
    req.files.master_roll.mv(master_roll, err =>{
        if(err)
        {
            console.log("Unexpected error while uploading")
        }
        
    })
    req.files.responses.mv(responses, err =>{
        if(err)
        {
            console.log("Unexpected error while uploading")
        }
    })
    const python = spawn('python3', ['make_dir.py']);
    console.log('Hello from generate upload endpoint ...');
    python.stdout.on('data',(data)=>{
        console.log(data.toString())
    });
    
    python.on('close', (code) => {
        res.status(200).send({
            message : "Files uploaded successfully",
            variant : "success"
        })
    })
})

app.post('/generatemarksheet',(req,res)=>{
    var dataToSend;
    res.status(202).send({
        message: "Request submitted! Processing...",
        variant: "success"
    })
    const python = spawn('python3', ['generate_marksheet.py',req.body.positive,req.body.negative,req.body.name]);
    
    python.stdout.on('data', function (data) {
        console.log('Hello from generate marksheet endpoint ...');
        dataToSend = Number(data.toString());
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
    const python = spawn('python3', ['generate_concise_marksheet.py',res.app.locals.positive,res.app.locals.negative]);
    console.log('Hello from generate concise marksheet endpoint ...');
    python.stdout.on('data', function (data) {
        dataToSend = Number(data.toString());
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

app.post('/sendemail/:id',(req,res)=>{
    var dataToSend;
    console.log('From send email endpoint ...',req.params.id);
    res.status(200).send({
        message: "Request submitted! Processing...",
        variant: "success"
    })
    
    const python = spawn('python3', ['sendemail.py',req.body.subject,req.body.body,req.body.signature,req.params.id]);
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

app.listen((process.env.PORT || 4000), ()=>{
    console.log(`Backend started at ${(process.env.PORT || 4000)}...`)
})