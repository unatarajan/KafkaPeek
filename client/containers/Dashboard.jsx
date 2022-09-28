import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
// import LineChart from '../components/LineChart';
// import TimeSeriesChart from '../components/TimeSeriesChart';
import RealTimeChart from '../components/RealTimeChart';
import RealTimeChart2 from '../components/RealTimeChart2';
import RealTimeChart3 from '../components/RealTimeChart3';

import { io } from "socket.io-client";

const socket = io('http://localhost:4000');
socket.emit('rate', {
  'bytesInPerSec': ['kafka_server_broker_topic_metrics_bytesinpersec_rate',''],
  'bytesOutPerSec': ['kafka_server_broker_topic_metrics_bytesoutpersec_rate',''],
  'messagesInPerSec': ['kafka_server_broker_topic_metrics_messagesinpersec_rate',''],
  'activeControllerCount': ["sum(kafka_controller_activecontrollercount)",""],
  'jvmHeapUsage': ['kafka_jvm_heap_usage{env="cluster-demo", type="used"}',''],
  'underRepPartitions': ['kafka_server_replica_manager_underreplicatedpartitions',''],
  'offlineParitions': ['kafka_controller_offlinepartitionscount','']
})

const Dashboard = ({ active, setActive }) => {
  // const [categories, setCategories] = useState(''); //title 
  const [series, setSeries] = useState([]);
  const [series2, setSeries2] = useState([]);


  useEffect(() => {
    console.log('inside useEffect')
    socket.on('rate', (data) => {
      
      // console.log('logged into the useEffect: socket on')
      // console.log('guess what?', data.bytesInPerSec.value)
      const transformedSeries = [];
      let time = data.bytesInPerSec.value[0] * 1000
      let bytes = parseInt(data.bytesInPerSec.value[1])
      transformedSeries.push(time,bytes)
      setSeries(currentData => [...currentData, transformedSeries])

      const transformedSeries2 = [];
      let time2 = data.bytesOutPerSec.value[0] * 1000
      let bytes2 = parseInt(data.bytesOutPerSec.value[1])
      transformedSeries2.push(time2,bytes2)
      setSeries2(currentData => [...currentData, transformedSeries2])
      console.log(data.messagesInPerSec.value,'<-- messages')
      console.log(data.jvmHeapUsage.value,'<-- JVMHEAP')
      console.log(data.underRepPartitions.value, '<-- underRepPartitions')
      console.log(data.offlineParitions.value, '<-- offlinepartitions')
     })
  }, []);

  
  

 

  //socket logic
  
  // const socket = io('http://localhost:4000');
  // socket.on('connect', () => {
  //   console.log('socket is connected')
  // })
  // socket.emit('rate', {
  //   "bytesInPerSec": ["kafka_server_broker_topic_metrics_bytesinpersec_rate","[15s]"],
  //   "bytesOutPerSec": ["kafka_server_broker_topic_metrics_bytesoutpersec_rate","[15s]"],
  //   "messagesInPerSec": ["kafka_server_broker_topic_metrics_messagesinpersec_rate","[15s]"],
  //   "activeControllerCount": ["sum(kafka_controller_activecontrollercount)",""]
  //   })
    
    // let transformedSeries = [];
    
    // socket.on("rate", (data) => { })
    //transform that data
    //setCategories + setSeries
    
    // let values = data.bytesInPerSec.values;
    // values.forEach((values) => {
    //   let result = [];
    //   let time = values[0];
    //   let bytes;
  
    //   time = (values[0] * 1000);
    //   bytes = parseInt(values[1]);
  
    //   result.push(time);
    //   result.push(bytes);
   
    //   transformedSeries.push(result);
      
    // });
    // console.log('transformed series', transformedSeries)
    
    
    // console.log("Bytes IN", data.bytesInPerSec.values)
    // console.log("Bytes OUT", data.bytesOutPerSec.values)
  // })
  // console.log('transformed series ourside: ', transformedSeries)
  // const transformedSeries = [];
  // values = data["bytesInPerSec"]["values"];
  // series.forEach((values) => {
  //   let result = [];
  //   let time = values[0];
  //   let bytes;

  //   time = new Date(values[0] * 1000);
  //   bytes = parseInt(values[1]);

  //   result.push(time);
  //   result.push(bytes);

  //   transformedSeries.push(result);
  // });

  return (
    <div id='dashboard-container'>
      <Sidebar active={active} setActive={setActive} />
      <div id='dashboard-charts'>
        <RealTimeChart series={[{data: series}]}  />
        <RealTimeChart2 series2={[{data: series2}]}/>
        <RealTimeChart3 />
      </div>
      {/* Create a main component that renders charts or settings, etc. */}
    </div>
  );
};

export default Dashboard;
