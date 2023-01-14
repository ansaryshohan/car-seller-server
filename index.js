const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.evsael1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// middleware 
// JWT verify
function verifyJWT(req, res, next) {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    return res.status(401).send({ message: "Unathorized access" })
  }
  const token = tokenHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbiden access" })
    }
    req.decoded = decoded;
    // console.log(decoded)
    next()
  })
}

// admin verify
function verifyAdmin(req, res, next) {

  const role = req.query.role
  if (role !== req.decoded.role) {
    res.status(403).send('forbidded access')
  }
  next();
}


function run() {
  const userDataBase = client.db('carSellerDB').collection('users')
  const productsDataBase = client.db('carSellerDB').collection('products')
  const bookingDataBase = client.db('carSellerDB').collection('bookings')
  const addedProductDataBase = client.db('carSellerDB').collection('addedProducts')

  try {
    // sending user to check user role for login purpose
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userDataBase.findOne(query)
      res.send({ message: true, data: result })
    })

    // creating user and jwt token 
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: user };

      // creating user when signup
        const result = await userDataBase.updateOne(query, updateDoc, options);
        
        // jwt token generation
        const jwtToken = jwt.sign(user, process.env.JWT_KEY, { expiresIn: "1d" });
        
        res.send({ message: true, data: {result, jwtToken} });
    })

    // getting individual data of cars for products route
    app.get('/products', async (req, res) => {
      const microBusQuery = { category: "Micro Bus" };
      const luxuryCarQuery = { category: "Luxury car" };
      const electricCarQuery = { category: "Electric car" };

      const microBus = await productsDataBase.find(microBusQuery).toArray()
      const luxuryCar = await productsDataBase.find(luxuryCarQuery).toArray()
      const threeCar = await productsDataBase.find(luxuryCarQuery).limit(3).toArray()
      const electricCar = await productsDataBase.find(electricCarQuery).toArray()
      res.send({ message: true, data: { microBus, luxuryCar, electricCar, threeCar } })
    })

    // product booking data by buyer is sending to the database
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingDataBase.insertOne(booking);
      res.send({ message: true, data: result })
    })

    // booking data is sending for buyer dashboard
    app.get('/bookings/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const bookings = await bookingDataBase.find(query).toArray();
      res.send({ message: true, data: bookings })
    })

    // product adding data by seller is sending to the database
    app.post('/addedProduct', async (req, res) => {
      const productData = req.body;
      const result = await addedProductDataBase.insertOne(productData);
      const addingToAllProductDB = await productsDataBase.insertOne(productData);
      res.send({ message: true, data: result })
    })

    // product added data for seller dashboard
    app.get('/addedProduct/:email', async (req, res) => {
      const email = req.params.email;
      const query = { sellerEmail: email };
      const result = await addedProductDataBase.find(query).toArray();
      res.send({ message: true, data: result })
    })

    // allUsers data for admin dashboard
    app.get('/allusers', verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.query.email;
      const role = req.query.role;
      if (req.decoded.email !== email) {
        res.status(403).send('forbidden access')
      }

      const query = {}
      const allUsers = await userDataBase.find(query).toArray()
      res.send({ message: true, data: allUsers })
    })

    // sellers data for admin dashboard
    app.get('/sellers', verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.query.email;
      const role = req.query.role;
      if (req.decoded.email !== email) {
        res.status(403).send('forbidden access')
      }
      // console.log(req.decoded.email,req.decoded.role, role,email)
      const query = { role: "Seller" }
      const sellers = await userDataBase.find(query).toArray()
      res.send({ message: true, data: sellers })
    })

    // buyers data for admin dashboard
    app.get('/buyers', verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.query.email;
      const role = req.query.role;
      if (req.decoded.email !== email) {
        res.status(403).send('forbidden access')
      }

      const query = { role: "Buyer" }
      const buyer = await userDataBase.find(query).toArray()
      res.send({ message: true, data: buyer })
    })

  }
  catch (error) {
    console.log(error)
  }
}
run();

app.get('/', (req, res) => {
  res.send({ message: true, data: "server is running" })
})

app.listen(port, () => {
  console.log("port number is:", port)
})
module.exports = app;