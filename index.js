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

// middleware 
function verifyJWT(req,res,next){
  const tokenHeader= req.headers.authorization;
  if(!tokenHeader){
    return res.status(401).send({message:"Unathorized access"})
  }
  const token= tokenHeader.split(" ")[1];
  
  jwt.verify(token,process.env.JWT_KEY, function(err,decoded){
    if (err){
      return res.status(403).send({message:"Forbiden access"})
    }
    req.decoded=decododed;
    // console.log(decoded)
    next()
  })
}


function run(){
  const userDataBase= client.db('carSellerDB').collection('users')
  const productsDataBase= client.db('carSellerDB').collection('products')
  const bookingDataBase= client.db('carSellerDB').collection('bookings')
  const addedProductDataBase= client.db('carSellerDB').collection('addedProducts')

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

app.get('/bookings/:email', async(req,res)=>{
  const  email = req.params.email;
  const query= {email:email};
  const bookings= await bookingDataBase.find(query).toArray();
  res.send({message:true, data:bookings})
})

app.post('/addedProduct',async(req,res)=>{
  const productData= req.body;
  const result= await addedProductDataBase.insertOne(productData);
  res.send({message:true, data:result})
})
app.get('/addedProduct/:email',async(req,res)=>{
  const email= req.params.email;
  const query={sellerEmail: email}
  console.log(email,query)
  const result= await addedProductDataBase.find(query).toArray();
  res.send({message:true, data:result})
})

app.get('/sellers',verifyJWT,async(req,res)=>{
  const query={role :"Seller"}
  const sellers= await userDataBase.find(query).toArray()
  res.send({message:true, data:sellers})
})

app.get('/buyers',verifyJWT,async(req,res)=>{
  const query={role :"Buyer"}
  const buyer= await userDataBase.find(query).toArray()
  res.send({message:true, data:buyer})
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