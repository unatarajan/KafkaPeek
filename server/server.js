const express = require('express');
const app = express();
const path = require('path');
const PORT = 4000;
//--------creating socket.IO connection--------
const { createServer } = require('http')
const { Server } = require('socket.io');
const { response } = require('express');
const cors = require('cors')
const ioConfig = {
  cors: {
    origin: ['http://localhost:8080'],
  },
}

const httpServer = createServer(app)
const io = new Server(httpServer, ioConfig)

const { fetchQuery } = require('./queries')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/assets')));

// serving html to localhost:3000
app.get('/', (req,res,next)=>{
    res.status(200).sendFile(path.join(__dirname, '/../client/index.html'));
  });
  
app.get('/dist/bundle.js', (req,res,next)=>{
    res.status(200).sendFile(path.join(__dirname, '../dist/bundle.js'));
});

//--------define parameters to query on websocket---------

const params = {
  bytesInPerSec: ['kafka_server_broker_topic_metrics_bytesinpersec_rate',''],
  bytesOutPerSec: ['kafka_server_broker_topic_metrics_bytesoutpersec_rate',''],
  messagesInPerSec: ['kafka_server_broker_topic_metrics_messagesinpersec_rate',''],
  jvmHeapUsage: ['kafka_jvm_heap_usage{env="cluster-demo", type="used"}',''],
  activeControllerCount: ["sum(kafka_controller_activecontrollercount)",""],
  underRepPartitions: ['kafka_server_replica_manager_underreplicatedpartitions',''],
  offlineParitions: ['kafka_controller_offlinepartitionscount','']
}

//--------initialize socket.io connection to front end-------

// {
//   "bytesInPerSec": ["kafka_server_broker_topic_metrics_bytesinpersec_rate",""],
//   "bytesOutPerSec": ["kafka_server_broker_topic_metrics_bytesoutpersec_rate",""],
//   "messagesInPerSec": ["kafka_server_broker_topic_metrics_messagesinpersec_rate",""],
//   "activeControllerCount": ["sum(kafka_controller_activecontrollercount)",""]
//   }

io.on('connection', (socket) => {
  console.log('a new user connected');
  //emit fetch request every 5 seconds
  socket.on('rate', (args) => {


    setInterval(async () => {
      const fetchObj = {};
      for(const [k , v] of Object.entries(args)) {
        fetchObj[k] = await fetchQuery(v[0],v[1]);
      }
      
      socket.emit('rate',fetchObj)
    }, 1000);
    // const { bytesInPerSec, bytesOutPerSec, messagesInPerSec, activeControllerCount } = args;
    // // console.log(bytesInPerSec, bytesOutPerSec)
    // setInterval(async () => {
    //   const fetchBytesIn = await fetchQuery(bytesInPerSec[0], bytesInPerSec[1]);
    //   const fetchBytesOut = await fetchQuery(bytesOutPerSec[0],bytesOutPerSec[1]);
    //   const fetchMessagesIn = await fetchQuery(messagesInPerSec[0], messagesInPerSec[1]);
    //   const fetchactiveControllerCount = await fetchQuery(activeControllerCount[0],activeControllerCount[1]);
    //   socket.emit('rate',{
    //     bytesInPerSec: fetchBytesIn,
    //     bytesOutPerSec: fetchBytesOut,
    //     messagesInPerSec: fetchMessagesIn,
    //     activeControllerCount: fetchactiveControllerCount
    //   })
    // }, 1000);
  })
  
  //log message on disconnect
  socket.on('disconnect', () => {
    console.log('websocket to client was disconnected!')
  })
});

// catch all handler for all unknown routes
app.use((req, res) => {
    res.status(404).send('404');
  });
  
// global error handler catches all errors
app.use((err, req, res, next) => {
    const defaultErr = {
      log: 'Express error handler caught unknown middleware error',
      status: 400,
      message: { err: 'An error occurred' },
    };
    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
  });
  
  httpServer.listen(PORT, () => console.log(`Server listening on port: ${PORT}...`));
  
  module.exports = app;
  