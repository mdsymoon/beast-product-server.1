const express = require("express");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const app = express();
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 5000;

// middleWare

app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o8cqw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productCollection = client.db("beastProduct").collection("product");
  const ordersCollection = client.db("beastProduct").collection("orders");
  const cartItemCollection = client.db("beastProduct").collection("cartItem");

  app.post("/addProduct", (req, res) => {
    const { title, price, status } = req.body;
    const file = req.files.file;

    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const img = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    productCollection
      .insertOne({ title, price, status, img })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/allProduct", (req, res) => {
    productCollection.find().toArray((err, result) => {
      res.send(result);
    });
  });

  app.put("/updateProductStatus", (req, res) => {
    const status = req.body.status;

    productCollection
      .updateOne({ _id: ObjectId(req.body._id) }, { $set: { status } })
      .then((result) => {
        res.send(true);
      });
  });

  app.post("/orderData", (req, res) => {
    const orderData = req.body;
    ordersCollection.insertOne(orderData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/allOrders", (req, res) => {
    ordersCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/orderList", (req, res) => {
    const email = req.body.email;
    ordersCollection.find({ email }).toArray((err, result) => {
      res.send(result);
    });
  });

  app.delete("/deleteOrder", (req, res) => {
    ordersCollection
      .deleteOne({ _id: ObjectId(req.body._id) })
      .then((result) => {
        res.send(true);
      });
  });

  app.put("/updateStatus", (req, res) => {
    const orderStatus = req.body.orderStatus;

    ordersCollection
      .updateOne({ _id: ObjectId(req.body._id) }, { $set: { orderStatus } })
      .then((result) => {
        res.send(true);
      });
  });

  app.post("/addToCart", (req, res) => {
    const { title, price ,email, img } = req.body;
    cartItemCollection.insertOne({ title, price, email, img }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/cartProduct", (req, res) => {
    const email = req.body.email;
    cartItemCollection.find({ email }).toArray((err, result) => {
      res.send(result);
    });
  });

  app.delete("/deleteCart", (req, res) => {
    cartItemCollection.deleteOne({_id: ObjectId(req.body._id) })
      .then((result) => {
        res.send(true);
      });
  });
});

app.get("/", (req, res) => {
  res.send("Hello my World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
