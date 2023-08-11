// 1. 使用 `req.body`：
//   是的，为了使用 `req.body` 来获取 POST 请求的请求体数据，你需要先引入 `body-parser` 
//模块并将其作为中间件使用。`app.use(bodyParser.json())` 表示将 JSON 格式的请求体数据解析并填充到 `req.body`
// 中，以供后续处理使用。
// 2. **`async` 和 `await` 的作用**：
//    - 在代码中，`async` 和 `await` 配合使用，用于处理异步操作。JavaScript 是单线程的，
//但某些操作（如数据库查询、文件读写等）可能需要花费很长时间。使用 `async` 声明的函数允许在函数内部使用 `await` 
//关键字，将耗时的操作转换为异步操作，使代码在执行这些操作时不会阻塞主线程，从而保持程序的响应性。
//    - 在你的示例代码中，`async` 函数是用来处理数据库连接和操作的，如 `await client.connect()` 
//和 `await collection.insertOne(newUser)`。通过使用 `await`，你可以等待异步操作完成，并在操作完成后继续执行
//下面的代码。
// 所以，在你的代码中，`app.use(bodyParser.json())` 的作用是解析请求体，将数据填充到 `req.body` 
//中供后续代码使用。而 `async` 和 `await` 则用于处理异步操作，确保在处理数据库连接和操作时不会阻塞应用程序的执行。
// 引入所需的模块
const express = require('express');
const bodyParser = require('body-parser'); // 引入 body-parser 模块
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb'); // 导入 ObjectId

// 创建 Express 应用
const app = express();
const port = 3888;
app.use(express.static(__dirname));
// 连接 MongoDB 数据库
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// 使用 body-parser 中间件解析请求体
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// 查询所有文档
app.get('/users', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("test1").collection("user0");
    const users = await collection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching users");
  } finally {
    client.close();
  }
});

// 添加新文档
app.post('/newuser', async (req, res) => {
  const newUser = req.body; // 获取请求体数据
  const name=newUser.name;
  let age=newUser.age;
   // 将age转换为数字
  age=parseFloat(age);
  //name是否空
  if(!name){
    res.status(400).json({message:"Name must not be empty"});
    return;
  }
  //验证age是否为数字且不为空
  if(typeof age!=='number'||isNaN(age)){
    res.status(400).json({ message: 'Age must be a non-empty number.' });
    return;
  }
  try {
    await client.connect();
    const collection = client.db("test1").collection("user0");
     // 检查是否已存在相同的 name
     const existingUser = await collection.findOne({ name: newUser.name });
     if(existingUser){
      res.status(400).json({message:"User already exists."});
     }else{
    const result = await collection.insertOne(newUser);
    res.json(result);
     }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user");
  } finally {
    client.close();
  }
});
// 更新用户信息
app.put('/updateuser/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, age } = req.body;
  
  try {
    await client.connect();
    const collection = client.db("test1").collection("user0");
    const result = await collection.updateOne({ _id:new ObjectId(userId) }, { $set: { name, age } });
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "更新成功" });
    } else {
      res.status(400).json({ message: "更新失败" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating user");
  } finally {
    client.close();
  }
});

// 删除用户信息
app.delete('/deleteuser/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await client.connect();
    const collection = client.db("test1").collection("user0");
    const result = await collection.deleteOne({ _id:new ObjectId(userId) });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "删除成功" });
    } else {
      res.status(400).json({ message: "删除失败" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting user");
  } finally {
    client.close();
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
