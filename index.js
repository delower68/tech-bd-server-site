const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000 ;





// middle ware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nhwinnf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('techBD').collection('services');
        const reviewsCollection = client.db('techBD').collection('reviews');


        // all data loaded from mongodb to local server 
        app.get('/services',async(req, res)=>{
            const query ={};
            const cursor =  serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services);
        } )
        // for home page data 
        app.get('/',async(req, res)=>{
            const query ={};
            const cursor =  serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services);
        } )

        // load a single data from mangodb 
        app.get('/services/:id' , async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service);
        });

        // user review data 
        app.post('/reviews', async(req, res)=>{
            const review = req.body ;
            const result = await reviewsCollection.insertOne(review);
            res.send(result) 
        })

        // reviews api receide here 
        app.get('/reviews', async(req, res)=>{
            let query = {};
            if(req.query.email){
                query={
                    email: req.query.email 
                }
            }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        // review delete server 
        app.delete('/reviews/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewsCollection.deleteOne(query);
            res.send(result)
        })


        // review update review 
        app.get('/reviews/:id', async(req, res)=>{
            const id =req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewsCollection.findOne(query);
            res.send(result)
        });
        
        // app.put('/reviews/:id' , async(req, res)=>{
        //     const id =req.params.id;
        //     const filter = {_id: ObjectId(id)};
        //     const updatedReview = req.body;
        //     console.log(updatedReview);
        //     const options = {upsert: true};
        //     const updatedDoc = {
        //         $set: {
        //             message: updatedReview.message
        //         }
        //     }
        //     const result = await reviewsCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const option = {upsert: true};
            const updatedUser = {
                $set: {
                    message: user.message,
                }
            }
            const result = await reviewsCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })



    }
    finally{

    }
}
run().catch(err => console.error(err))


app.get('/', (req ,res)=>{
    res.send('The server is running');
});



app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`);
});

