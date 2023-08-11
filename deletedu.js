const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function deleteDuplicateKakaData() {
  try {
    await client.connect();
    const collection = client.db("test1").collection("user0");
    
    const duplicateKakaData = await collection.findOne({ name: "Kaka" });
    if (duplicateKakaData) {
      await collection.deleteOne({ _id: duplicateKakaData._id });
      console.log("Duplicate Kaka data deleted.");
    } else {
      console.log("No duplicate Kaka data found.");
    }
  } catch (error) {
    console.error("Error deleting duplicate Kaka data:", error);
  } finally {
    client.close();
  }
}

deleteDuplicateKakaData();
