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

function run(){
  const userDataBase= client.db('carSellerDB').collection('users')
  const productsDataBase= client.db('carSellerDB').collection('products')
  const bookingDataBase= client.db('carSellerDB').collection('bookings')

try{
  app.get('/user/:email',async(req,res)=>{
    const email= req.params.email;
    const query= {email:email};
    const result= await userDataBase.findOne(query)
    res.send({message:true, data:result})
  })

 app.put('/user/:email',async(req,res)=>{
  // console.log('form user id email')
    const email=req.params.email;
    const query= {email:email};
    const user= req.body;
    const options= {upsert: true};
    const updateDoc= { $set:user}
    const result= await userDataBase.updateOne(query, updateDoc, options)
    console.log(result)
    
    const jwtToken= jwt.sign(user,process.env.JWT_KEY,{expiresIn:"1d"})
    res.send({message:true, data:result , jwtToken})
})

app.get('/products',async(req,res)=>{
  const microBusQuery= {category: "Micro Bus"};
  const luxuryCarQuery= {category: "Luxury car"};
  const electricCarQuery= {category: "Electric car"};

  const microBus=  await productsDataBase.find(microBusQuery).toArray()
  const luxuryCar=  await productsDataBase.find(luxuryCarQuery).toArray()
  const electricCar=  await productsDataBase.find(electricCarQuery).toArray()
  res.send({message:true, data: {microBus,luxuryCar,electricCar}})
})

app.post('/booking', async(req,res)=>{
  const booking=req.body;
  const result= await bookingDataBase.insertOne(booking);
  res.send({message:true, data:result})
})

}
catch(error){
  console.log(error)
}
}
run();

app.get('/',(req,res)=>{
  res.send({message:true, data: "server is running"})
})

app.listen(port, ()=>{
  console.log("port number is:",port)
})
module.exports = app;