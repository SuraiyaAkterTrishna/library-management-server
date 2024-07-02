const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wrf5say.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db('bookDB').collection('books');
        const category = client.db('bookDB').collection('category');

        // READ all documents
        app.get('/books', async (req, res) => {
            const cursor = bookCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/category', async (req, res) => {
            const cursor = category.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // READ a document 
        app.get('/books/:id', async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookCollection.findOne(query);
            res.send(result);
        })
        // send one product to database 
        app.post('/books', async (req, res) => {
            const newBook = req.body;
            const result = await bookCollection.insertOne(newBook);
            res.json(result);
        })
        // update 
        app.put('/books/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedBook = req.body;
            const newBook = {
                $set: {
                    title: updatedBook.title,
                    quantity: updatedBook.quantity,
                    author: updatedBook.author,
                    category: updatedBook.category,
                    detail: updatedBook.detail,
                    rating: updatedBook.rating,
                    img: updatedBook.img,
                    detail_img: updatedBook.detail_img,
                }
            }
            const result = await bookCollection.updateOne(filter, newBook, options);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Books server is running');
})

app.listen(port, () => {
    console.log(`Books server is running on port: ${port}`);
})


