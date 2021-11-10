const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const cors = require('cors');
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());



//mongodb database connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j6jgj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//mongodb database connect


async function run() {
    try {
        await client.connect();
        //database name
        console.log("hitting db")
        const database = client.db('travel-guroo')
        //database collection
        const serviceCollection = database.collection('services');
        const orderCollection = database.collection('orders');

        //POST API
        app.post('/services', async (req, res) => {
            const services = req.body;
            console.log('hit the databae', services);
            const result = await serviceCollection.insertOne(services);
            // console.log(result);
            res.json(result);
        });

        //GET API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        //GET Signle Data
        app.get('/register/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        })
        //register order service
        app.post('/register', async (req, res) => {
            const service = req.body;
            const result = await orderCollection.insertOne(service);
            res.json(result);
        })
        //get my order from my orderscollection
        app.get('/orders/:email', async (req, res) => {
            orderCollection.find({ email: req.params.email }).toArray((err, results) => {
                res.json(results)
            })
        });
        //Get all orders
        app.get('/allOrders', async (req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.json(result)
        });

        //Delete orders
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        //Get order for Update orders
        app.get('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.json(result);
        });

        //update status
        app.put('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Approved'
                },
            };
            const result = await orderCollection.updateOne(query, updateDoc, options);
            res.json(result);
        })



    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running the server')
});

app.listen(port, () => {
    console.log('Running server', port);
})
