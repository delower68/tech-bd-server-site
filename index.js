const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();


const port = process.env.PORT || 5000 ;





// middle ware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nhwinnf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: "Unauthorized access"})
    }
    const token = authHeader.split(' ')[1];
    // console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRECT , function(err, decoded){
        if(err){
            res.status(403).send({message: "Forbidden access" })
        }
        req.decoded= decoded ;
        next();
    })

}

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
            const cursor =  serviceCollection.find(query).limit(3)
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
        app.get('/reviews/:id' , async(req, res)=>{
            let query = {};
            if(req.query.
                service){
                query= req.query.service;
            }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // user review data 
        app.post('/reviews', async(req, res)=>{
            const review = req.body ;
            const result = await reviewsCollection.insertOne(review);
            res.send(result) 
        })

        // reviews api receide here 
        app.get('/reviews',verifyJWT, async(req, res)=>{

            const decoded = req.decoded;
            // console.log(decoded);
            if(decoded.email !== req.query.email ){
                res.status(403).send({message: "Forbidden access"})
            }

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




        // add a service here 
        app.post('/addService', async(req, res)=>{
            const addService = req.body ;
            console.log(addService);
            const result = await serviceCollection.insertOne(addService);
            res.send(result);
        })

        // for jwt 
        app.post('/jwt', async(req, res)=>{
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRECT, {expiresIn: '2h'})
            res.send({token});
            // console.log(token);
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

