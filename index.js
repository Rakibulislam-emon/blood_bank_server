const express = require('express');
const cors = require('cors');
 require ('dotenv').config();
 const port = process.env.PORT || 5000;
 const app = express();
 app.use(cors());
 app.use(express.json());
// mongodb starts from here

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zuuvjs1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // ----------------DB COLLECTION ----------------

    const divisionCollections = client.db('bloodBank').collection('division')
    const upozilaCollections = client.db('bloodBank').collection('upozila')
    const usersCollections = client.db('bloodBank').collection('users')





    // ---------------- geo code : 1 get divisions ----------------
    app.get('/divisions',async (req, res) => {
         try {
           const result = await divisionCollections.find().toArray();
           res.send(result);
         } catch (error) {
           console.error("Error fetching division data:", error);
           res.status(500).send("Error fetching division data");
         }
       });
    
       // ---------------- geo code : 2 get upozilas ----------------
       app.get('/upozila',async (req, res) => {
        try {
          const result = await upozilaCollections.find().toArray();
          res.send(result);
        } catch (error) {
          console.error("Error fetching division data:", error);
          res.status(500).send("Error fetching division data");
        }
      });
        
       // ---------------- add users while registration ----------------
        app.post('/users', async (req, res) => {
          try {
            console.log('line 59------->',req.body);
            const result = await usersCollections.insertOne(req.body);
            res.send(result);
          } catch (error) {
            console.error("Error inserting user data:", error);
            res.status(500).send("Error inserting user data");
          }
        });
  


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

 app.get('/', async (req, res) => {
     res.send(`Server is running at http://localhost:${port}`);
 })
 app.listen(port,  (req, res) => {
     console.log(`Server is running on port ${port}`);
 });