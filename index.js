const express = require('express')

const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const uri = "mongodb+srv://ababilit:bYpBAUmDZ4sGf8Y@cluster0.dmtd1.mongodb.net/ababilIt?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express()

app.use(bodyParser.json());
app.use(cors());



client.connect(err => {
  const citizenCollection = client.db("unionparishad").collection("citizen");
  const adminCollection = client.db("unionparishad").collection("logindata");
  const taxCollection = client.db("unionparishad").collection("tax");
  const tradeLicenseCollection = client.db("unionparishad").collection("tradeLicense");
  const tradeLicensNo = client.db("unionparishad").collection("tlncount");



  app.get('/', (req, res) => {
    res.send('Database Conncected')
  });


  app.get('/user', (req, res) => {
    res.send('its Ok')
  });

  app.post('/addCitizen', (req, res) => {
    const citizen = req.body;
    const name = citizen.name;
    const holdingNo = citizen.holdingNo;
    const nid = citizen.nid;
    let insert = 0;

    citizenCollection.find({ $or: [{ nid: nid }, { holdingNo: holdingNo }] }).toArray()
      .then(result => {
        if (result.length !== 0) {
          res.send({ insert });
        } else {
          insert = 1;
          citizenCollection.insertOne(citizen)
            .then(result => {
              res.send({ insert })
            })
        }
      })

  })

  app.post('/addTradeLicense', (req, res) => {
    const tradeLicense = req.body;
    tradeLicenseCollection.insertOne(tradeLicense)
      .then(result => {
        res.send(result)
      })
  })


  app.get('/tradeLicense', (req, res) => {
    tradeLicenseCollection.find({}).toArray()
      .then(result => {
        res.send(result)
      })
  })


  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    const name = admin.name;
    const father = admin.father;
    const nid = admin.nid;
    let insert = 0;

    adminCollection.find({ $and: [{ name: name }, { nid: nid }, { father: father }] }).toArray()
      .then(result => {
        if (result.length !== 0) {
          res.send({ insert });
        } else {
          insert = 1;
          adminCollection.insertOne(admin)
            .then(result => {
              res.send({ insert })
            })
        }
      })

  })


  app.get('/adminList', (req, res) => {
    adminCollection.find({}).toArray()
      .then(result => {
        res.send(result)
      })
  })



  app.get('/citizen', async (req, res) => {
    let cursor = citizenCollection.find({});

    const nameornid = req.query.nameornid;
    if (nameornid) {
      cursor = citizenCollection.find({ $or: [{ nameBn: { $regex: nameornid } }, { nid: { $regex: nameornid } }, { phone: { $regex: nameornid } }] });

    }

    const page = req.query.page;
    const size = parseInt(req.query.size);
    const count = await cursor.count();
    let citizens;

    if (page) {
      citizens = await cursor.skip(page * size).limit(size).sort({ $natural: -1 }).toArray();


    } else {
      citizens = await cursor.toArray();
    }
    res.send({
      count,
      citizens
    })

  });



  app.get('/citizen/:id', (req, res) => {
    const nid = req.params.id;
    const data = req.body;
    citizenCollection.find({ nid: nid })
      .toArray((err, document) => {
        res.send(document)
      })
  })


  app.patch('/paidTax/:nid', (req, res) => {
    const nid = req.params.nid;
    const { due, totalTax } = req.body;
    console.log(req.body)
    citizenCollection.updateOne({ nid: nid },
      { $set: { current: due, paidTax: totalTax } }
    )
      .then(result => {
        res.send(result)
      })
  })







});

console.log('connected')

// client.close();




app.listen(process.env.PORT || 5000)