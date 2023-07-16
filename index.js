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

      if (AllCellData.length) {
        // name checked
        const NameMatched = AllCellData.find(item => item.name === name);

        if (NameMatched === undefined) {
          const dataToInsert = { name: name, info: [{ day, cellData }] };
          const AddResult = await AllCellDataCollections.insertOne(dataToInsert);
          return res.send({ AddResult });
        } else {
          // data and day checked
          const filter = { name, "info.day": day };
          const update = { $set: { "info.$.cellData": cellData } };

          const result = await AllCellDataCollections.updateOne(filter, update);

          if (result.matchedCount > 0) {
            console.log('Document updated');
            return res.send({ result });
          } else {
            // If no matching document with the same day is found, add a new entry
            const addResult = await AllCellDataCollections.updateOne(
              { name },
              { $addToSet: { info: { day, cellData } } }
            );
            console.log('Document inserted');
            console.log(addResult);
            return res.send({ addResult });
          }
        }
      } else {
        // If DataBase is empty at the first time
        const dataToInsert = { name: name, info: [{ day, cellData }] };
        const AddResult = await AllCellDataCollections.insertOne(dataToInsert);
        return res.send({ AddResult });
      }
    });
    app.get("/getData", async (req, res) => {
      const result = await AllCellDataCollections.find().toArray();
      res.send(result);
    })
    app.get("/", (res, req) => {
      res.send({ data: "Meal Server is Running" });
    })

  } finally {
  }

}
run().catch(console.dir);


