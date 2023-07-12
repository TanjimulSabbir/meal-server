const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Meal Counter App is Running")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wpchpxk.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function run() {
    try {
        await client.connect();
        const AllCellDataCollections = client.db("Meal-Counter").collection("AllCellData")

        app.get("/", (res, req) => {
            console.log("Server is Running")
        })

        app.post("/addData", async (req, res) => {
            const AllCellData = await AllCellDataCollections.find().toArray();
            const BodyData = req.body;
            if (AllCellData.length) {
                const { name, day, cellData } = BodyData;
                const UserInfo = [name, day, cellData]
                const Found = AllCellData.find(data => UserInfo.includes(data.name) && UserInfo.includes(data.day) && UserInfo.includes(data.cellData));

                if (Found) {
                    const update = { $set: { name, day, cellData } };
                    const options = { upsert: true };
                    const result = await collection.updateOne(filter, update, options);

                    if (result.upsertedCount > 0) {
                        console.log(result);
                    } else {
                        console.log(result);
                    }
                }
                else {

                }
            } else {
                const AddResult = await AllCellDataCollections.insertOne(BodyData)
                return;
            }
        })

    } finally {
    }
}
run().catch(console.dir);


