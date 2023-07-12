const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Meal Counter App is Running", port)
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wpchpxk.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function run() {
   
    try {
        await client.connect();
        const AllCellDataCollections = client.db("Meal-Counter").collection("AllCellData");

        app.post("/addData", async (req, res) => {
            const AllCellData = await AllCellDataCollections.find().toArray();
            const BodyData = req.body;

            const { name, day, cellData } = BodyData;
            console.log(BodyData.data,"NameMatched")

            if (AllCellData.length) {
                // name checked
                const NameMatched = AllCellData.find(item => item.name === name);
               
                if (NameMatched === undefined) {
                    const dataToInsert = { name:name, info:[{ day, cellData }] };
                    const AddResult = await AllCellDataCollections.insertOne(dataToInsert)
                    return console.log(AddResult);
                } else {
                    // data and day checked
                    const UserInfo = [name, day, cellData];
                    const DayDataMatched = NameMatched.info.find(data => UserInfo.includes(data.day) && UserInfo.includes(data.cellData));
                    
                    if (DayDataMatched) {
                        const result= await AllCellDataCollections.info.updateOne({...DayDataMatched,cellData})
                        return console.log(result);
                    }
                    // day/cellData dosen't exist 
                    const update = { $set: { day, cellData } };
                    const options = { upsert: true };
                    const result = await AllCellDataCollections.info.insertOne({ day, cellData }, update, options);
                    console.log(result)
                }
            } else {
                // If DataBase full empty at the first time 
                const dataToInsert = { name:name, info:[{ day, cellData }] };
                const AddResult = await AllCellDataCollections.insertOne(dataToInsert)
                return console.log(AddResult);
            }
        })

    } finally {
    }
    app.get("/", (res, req) => {
        console.log("Running")
      res.send("Server is running");
    })
}
run().catch(console.dir);


