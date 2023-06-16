const express=require('express');
const app=express();
const jwt = require('jsonwebtoken');
const cors=require('cors');
require('dotenv').config()

const port=process.env.PORT ||5000;

// middle ware
app.use(cors());
app.use(express.json());

// jwt verify

const verifyjwt=(req,res,next)=>{
 const authorization=req.headers.authorization;
 if(!authorization){
  return res.status(401).send({Error:true, message:'unathorize'})
 }
 const token=authorization.split(' ')[1];
 jwt.verify(token.process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
  if(err){
    return res.status(401).send({Error:true, message:'unathorize'})
  }
  req.decoded=decoded;
  next();
 })
}



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zunrmyl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();

    const userCollection=client.db('ultrasport').collection('users');
    const classesCollection=client.db('ultrasport').collection('classes')

    // JWT TOKEN
    app.post('/jwt',(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{ expiresIn:'1h'})
      res.send({token})
    })

    // user api
    app.post('/users',async(req,res)=>{
        const user=req.body;
        const query={email:user.email}
        const insertUser=await userCollection.findOne(query);
        if(insertUser){
            return res.send({massege:'already inserted'})
        }
        const result=await userCollection.insertOne(user);
        res.send(result)
    })

    // class post api

         app.post('/classes',async(req,res)=>{
          const classes=req.body;
          const result= await classesCollection.insertOne(classes);
          res.send(result)
         })

        //  class get post

        app.get('/classes',async(req,res)=>{
          const result=await classesCollection.find().toArray();
          res.send(result)
        })

        

        // class status api
        app.patch('/classes/approve/:id',async (req,res)=>{
          const id=req.params.id;
          const filter={_id: new ObjectId(id)};
          const upDatedoc={
            $set:{status:'approved'}
          }
          const result=await classesCollection.updateOne(filter,upDatedoc)
          res.send(result)
        })

        // class deney
        app.patch('/classes/denied/:id',async (req,res)=>{
          const id=req.params.id;
          const filter={_id: new ObjectId(id)};
          const upDatedoc={
            $set:{status:'denied'}
          }
          const result=await classesCollection.updateOne(filter,upDatedoc)
          res.send(result)
        })

    // admin chek
    app.get('/users/admin/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email}
      const user=await userCollection.findOne(query);
      const result={admin:user?.role==='admin'}
      res.send(result)
    })

    // instructor chek
    app.get('/users/instructor/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email}
      const user=await userCollection.findOne(query);
      const result={instructor:user?.role==='instructor'}
      res.send(result)
    })

// user get

   app.get('/users',async(req,res)=>{
      const result=await userCollection.find().toArray();
      res.send(result);
   })

   // user role create

   app.patch('/users/admin/:id',async(req,res)=>{
    const id=req.params.id;
    const filter={_id: new ObjectId(id)};
    const upDatedoc={
      $set:{role: 'admin'},
    }
    const result= await userCollection.updateOne(filter,upDatedoc);
    res.send(result)
  })

   app.patch('/users/instructor/:id',async(req,res)=>{
    const id=req.params.id;
    const filter={_id: new ObjectId(id)};
    const upDatedoc={
      $set:{role: 'instructor'},
    }
    const result= await userCollection.updateOne(filter,upDatedoc);
    res.send(result)
  })

  // instractor find

  app.get('/users/instructor', async(req,res)=>{
    const user= await userCollection.find({ role: 'instructor' }).toArray();
     res.send(user)
    //  console.log(result)
  })

  // approved classes find
  app.get('/classes/approved', async(req,res)=>{
    const approvedCalss= await classesCollection.find({ status: 'approved' }).toArray();
     res.send(approvedCalss)
    //  console.log()
  })


  // my class get==================

  app.get('/users/posted', async (req, res) => {
    try {
      const { email } = req.query;
      const posted = await classesCollection.find({ "Inemail": email }).toArray();
      res.send(posted);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('sport on going')
})

app.listen(port,()=>{
    console.log(`sport accademy is runing${port}`)
})