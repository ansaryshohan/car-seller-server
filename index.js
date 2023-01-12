const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app=express();
const port= process.env.PORT||5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.evsael1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run=()=>{


}
run() .catch(error=>console.log(error))

app.get('/',(req,res)=>{
  res.send({message:true, data: "server is running"})
})

app.listen(port, ()=>{
  console.log("port number is:",port)
})