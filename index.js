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
    const bloodRequestCollections =client.db('bloodBank').collection('bloodRequests')

      // ---------------- insert requests in bloodCollection ----------------
       app.post('/bloodRequests', async (req, res) => {
        try {
          const result = await bloodRequestCollections.insertOne(req.body);
          res.send(result);
        } catch (error) {
          console.error("Error inserting user data:", error);
          res.status(500).send("Error inserting user data");
        }
      });

      app.get('/bloodRequests', async (req, res)=>{
        try {
          const result = await bloodRequestCollections.find().toArray();
          res.send(result);
        } catch (error) {
          console.error("Error fetching user data:", error);
          res.status(500).send("Error fetching user data");
        }
      })

    // ---------------- get bloodRequestedData by email----------------
      app.get('/myBloodRequests/:email', async (req, res) => {
        try {
          const result = await bloodRequestCollections.find({requesterEmail: req.params.email}).toArray();
          res.send(result);
        } catch (error) {
          console.error("Error fetching user data:", error);
          res.status(500).send("Error fetching user data");
        }
      });
   

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
  
    // ---------------- get users data by email ----------------
    app.get('/profile/:email', async (req, res) => {
        try {
          const result = await usersCollections.findOne({ email: req.params.email });
          res.send(result);
        } catch (error) {
          console.error("Error fetching user data:", error);
          res.status(500).send("Error fetching user data");
        }
      });
    // ---------------- update user with email ----------------
      app.patch('/profile-update/:email', async (req, res) => {
        try {
          const options = { upsert: true }
          const result = await usersCollections.updateOne(
            { email: req.params.email },
            { $set: req.body },
            { upsert: true }
          );
          res.send(result);
        } catch (error) {
          console.error("Error updating user data:", error);
          res.status(500).send("Error updating user data");
        }
      });
    // ---------------- delete user with email ----------------


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