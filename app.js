const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const collection = "courses";
const app = express();

const schema = Joi.object().keys({
    courses : Joi.string().required()
});

app.use(bodyParser.json());

//Get (Read)
app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/getCourses',(req,res) => {
    db.getDB().collection(collection).find({}).toArray((err,documents) =>{
        if(err)
            console.log(err);
        else {
            res.json(documents);
        }
    });
});

//Put (Update)
app.put('/:id',(req,res) => {
    const coursesID = req.params.id;
    const userInput = req.body;

    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(coursesID)},{$set : {courses : userInput.courses}},{returnOriginal : false},(err,result) => {
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
    });
});

//Post (Create)
app.post('/',(req,res,next) => {
    const userInput = req.body;

    Joi.validate(userInput,schema,(err,result) => {
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput,(err,result) => {
                if(err){
                    const error = new Error("Failed to insert Courses Document");
                    error.status = 400;
                    next(error);
                }
                else
                    res.json({result : result, documents : result.ops[0],msg : "Successfully inserted Courses!!!",error : null});
            });
        }
    })
});

//Delete (Delete)
app.delete('/:id',(req,res) => {
    const coursesID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(coursesID)},(err,result) => {
        if(err)
            console.log(err);
        else
            res.json(result);
    });
});

app.use((err,req,res,next) => {
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
}) 

//Port
db.connect((err) => {
    if(err){
        console.log('Unable to connect to the database');
        process.exit(1);
    }
    else{
        app.listen(3000,() => {
            console.log('Connected to the database,app listening on port 3000')
        });
    }
});

 