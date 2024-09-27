const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const bloodRequestCollections = client.db('bloodBank').collection('bloodRequests')
    const blogCollections = client.db('bloodBank').collection('blogs')
    const donationCollections = client.db('bloodBank').collection('donations')
    // jwt 

    // app.post('/jwt', async (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    //   res.send({ token });
    // })
  
    // get date by get method 
     

    // post donation in db
     app.post('/donations', async (req, res) => {
      try {
        const result = await donationCollections.insertOne(req.body);
        console.log('Query Result:', result); // Log query result
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    })

    // get the total donation 
     app.get('/donations', async (req, res) => {
      try {
        const result = await donationCollections.find().toArray();
        
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    })


    // stripe payment routes 
    app.post('/create-payment-intent', async function (req, res) {
      console.log(req.body, '35 line');

      const { price } = req.body
      const amount = parseInt(price * 100)
      console.log('amount:', amount)
      // return
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })


    // search route for finding donor by query in users collection
    app.get('/donors', async (req, res) => {
      try {
        let { bloodGroup, district, upazila } = req.query;
        const check = bloodGroup.split('')
        console.log('check:', check)
        if (check[check.length - 1] === ' ') {
          check[check.length - 1] = '+',
            bloodGroup = check.join('')
        }

        // console.log('Query Parameters:', req.query); // Log query parameters
        const result = await usersCollections.find({
          bloodGroup: bloodGroup || { $ne: null },
          district: district || { $ne: null },
          upazila: upazila || { $ne: null }
        }).toArray();
        console.log('Query Result:', result); // Log query result
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });





    //  ------------- admins routes -------------

    // update status in blood collection by admin 
    app.patch('/updateStatus/:id', async (req, res) => {
      try {
        const result = await bloodRequestCollections.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body },
          { upsert: true }
        );
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });

    // --------------get  all blogs--------- 
    app.get('/blogs', async (req, res) => {
      try {
        const result = await blogCollections.find().toArray();

        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });
    // insert a new blog 
    app.post('/blogs', async (req, res) => {
      try {
        const result = await blogCollections.insertOne(req.body);
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });
    //  ------  delete a blog by id -------

    // ------------ publish a blog by updating stats --------------------
    app.patch('/publish-blogs/:id', async (req, res) => {
      try {
        // upsert true

        const result = await blogCollections.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body },
          { upsert: true }
        );
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });
    //  ------  delete a blog by id -------
    app.delete('/delete-blogs/:id', async (req, res) => {
      try {
        const result = await blogCollections.deleteOne(
          { _id: new ObjectId(req.params.id) }
        );
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });
    //  ------ get blogs by id -------
    app.get('/getBlogs/:id', async (req, res) => {
      try {
        console.log(req.params.id, '---------->>>>>> 103');
        const result = await blogCollections.findOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });
    //  ------ get blogs by id -------




    // --------------get  all users--------- 
    // app.get('/allUsers', async (req, res) => {
    //   try {
    //     const result = await usersCollections.find().toArray();
        // console.log(result);
    //     res.send(result);
    //   } catch (error) {
        // console.error("Error fetching user data:", error);
    //     res.status(500).send("Error fetching user data");
    //   }
    // });
  //  test 

    //  ------ 1 -------
    app.get('/allUsers', async (req, res) => {
      try {
        const result = await usersCollections.find().toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });
    //  ------ 2 update a status in userCollection by id -------
    app.patch('/userStatus/:id', async (req, res) => {
      try {
        console.log(req.params.id, '-----> 47');
        const result = await usersCollections.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        res.send(result);

      } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).send("Error updating user data");
      }
    });
    //  ------ 3 update a role in userCollection by id -------
    app.patch('/userRole/:id', async (req, res) => {
      try {
        console.log(req.params.id, '-----> 47');
        // check user role in db
        const user = await usersCollections.findOne({ _id: new ObjectId(req.params.id) });
        console.log(user.role);
        if (user.role !== 'admin') {

          const result = await usersCollections.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
          );
          res.send(result);
        }

      } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).send("Error updating user data");
      }
    });
    //  ------ 4 delete a user by id -------


    // ---------------- delete a bloodRequest by id----------------
    app.delete('/bloodRequestsDelete/:id', async (req, res) => {
      try {
        const result = await bloodRequestCollections.deleteOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
      } catch (error) {
        console.error("Error deleting user data:", error);
        res.status(500).send("Error deleting user data");
      }
    });
    // ---------------- edit request in  bloodCollection by id----------------
    app.put('/bloodRequests-edit/:id', async (req, res) => {
      try {
        const result = await bloodRequestCollections.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).send("Error updating user data");
      }
    });



    // ---------------- get requested donation by id----------------
    app.get('/edit/:id', async (req, res) => {
      try {
        // console.log(req.params.id)
        const result = await bloodRequestCollections.findOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });

    // ---------------- insert requests in bloodCollection ----------------
    app.post('/bloodRequests/:email', async (req, res) => {
      try {

        const result = await bloodRequestCollections.insertOne(req.body);
        res.send(result);
      } catch (error) {
        console.error("Error inserting user data:", error);
        res.status(500).send("Error inserting user data");
      }
    });

    app.get('/bloodRequests', async (req, res) => {
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
        const result = await bloodRequestCollections.find({ requesterEmail: req.params.email }).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });

    // ---------------- get bloodRequestedData by id----------------
    app.get('/usersBloodRequests/:id', async (req, res) => {
      try {
        const result = await bloodRequestCollections.find({ _id: new ObjectId(req.params.id) }).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });

    // patch bloodRequestCollections status by id 
    app.patch('/usersBloodRequests/:id', async (req, res) => {
      try {
        const result = await bloodRequestCollections.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body },
          { upsert: true }
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).send("Error updating user data");
      }
    });


    // ---------------- geo code : 1 get divisions ----------------
    app.get('/divisions', async (req, res) => {
      try {
        const result = await divisionCollections.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching division data:", error);
        res.status(500).send("Error fetching division data");
      }
    });

    // ---------------- geo code : 2 get upozilas ----------------
    app.get('/upozila', async (req, res) => {
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
        console.log(req.params.email, '----> 136');
        const result = await usersCollections.findOne({ email: req.params.email });
        console.log(result, '------> 138');
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
    // ---------------- get role with email in users collection ----------------
    app.get('/role/:email', async (req, res) => {
      try {
        console.log(req.params.email, ' --------> 163 ')
        const result = await usersCollections.findOne({ email: req.params.email });
        console.log(result);
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
      }
    });
    // ---------------- get role with email in blood collection----------------
    app.get('/usersRole/:email', async (req, res) => {
      try {
        console.log(req.params.email, ' -------->')
        const result = await bloodRequestCollections.findOne({ requesterEmail: req.params.email });
        console.log(result);
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Error fetching user data");
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
app.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
});