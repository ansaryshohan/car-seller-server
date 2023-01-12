const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const jwt= require('jsonwebtoken')

const app=express();
const port= process.env.PORT||5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.evsael1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run=()=>{
  const userDataBase= client.db('carSellerDB').collection('users')

try{

  app.put('/user/:email',async(req,res)=>{
    const email=req.params.email;
    const query= {email:email};
    const user= req.body;
    const options= {upsert: true};
    const updateDoc= { $set:user}
    const result= await userDataBase.updateOne(query, updateDoc, options)
    
    const jwtToken= jwt.sign(user,process.env.JWT_KEY,{expiresIn:"1d"})
    res.send({message:true, data:result , jwtToken})
})
}
catch(error){
  console.log(error)
}

}
run() .catch(error=>console.log(error))

app.get('/',(req,res)=>{
  res.send({message:true, data: "server is running"})
})

app.listen(port, ()=>{
  console.log("port number is:",port)
})