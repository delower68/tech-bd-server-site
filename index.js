const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000 ;





// middle ware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wdnu49k.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);


const services = require('./data/services.json')

app.get('/', (req ,res)=>{
    res.send('The server is running');
});


// get the all services here 
app.get('/services', (req, res)=>{
    res.send(services);
})





app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`);
});

