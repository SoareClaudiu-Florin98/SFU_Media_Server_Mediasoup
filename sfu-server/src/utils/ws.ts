import WebSocket from "ws";
import { Router, Producer, Consumer, Transport, RtpCapabilities } from 'mediasoup/node/lib/types'
import { createWebRtcTransport } from "./createWebRtcTransport";
import {createWorker} from './worker';
//import { getMediasoupWorker } from './worker';

// let roomList: any = new Map()

// let worker: Worker;
let producer: Producer;
let consumer: Consumer;
let producerTransport: Transport;
let consumerTransport: Transport;
let mediasoupRouter: Router;

const webSocketConnection = async (websocket: WebSocket.Server) => {
  try {
    mediasoupRouter = await createWorker();
    } catch (err) {
     console.log(err);
     throw err;
    }
    websocket.on('connection', (ws: WebSocket) => {
      if (producer) {
        send(ws, "hasPublisher", "has pub");
      }
        ws.on('message', (message: string) => {
            const jsonValidation = IsJsonString(message);
            if (!jsonValidation) {
                console.log("json error")
                return
            }
            const event = JSON.parse(message);
           // const room_id = event.rid
            switch (event.type) {
                case "getRouterRtpCapabilities":
                  onRouterRtpCapabilities(event, ws);
                    break;
                case "createProducerTransport":
                  onCreateProducerTransport(event, ws);
                    break;
                case "createConsumerTransport":
                  onCreateConsumerTransport(event, ws);
                    break;
                case "connectProducerTransport":
                  onConnectProducerTransport(event, ws);
                    break;
                case "connectConsumerTransport":
                  onConnectConsumerTransport(event, ws);
                    break;
                case "produce":
                  onProduce(event, ws, websocket);
                    break;
                case "consume":
                  onConsume(event, ws);
                    break;
                case "resume":
                  onResume(event, ws);
                    break;
                default:
                    break;
            }
        });
        ws.on("close", () => {
            console.log("closed")
        });
    });
};

const onRouterRtpCapabilities = (event: string, ws: WebSocket) => {
  send(ws, "routerCap", mediasoupRouter.rtpCapabilities)
}

const onCreateProducerTransport = async (event: string, ws: WebSocket) => {
  try {
    const { transport, params } = await createWebRtcTransport(mediasoupRouter);
    producerTransport = transport;
    send(ws, "pubTransportCreated", params);
    console.log("pubTransportCreated: ", params)
  } catch (error) {
    console.log("on create producer: ", error);
    send(ws, "error", error);
  }
}

const onCreateConsumerTransport = async (event: string, ws: WebSocket) => {
  console.log(event);
  try {
    const { transport, params } = await createWebRtcTransport(mediasoupRouter);
    consumerTransport = transport;
    send(ws, "subTransportCreated", params);

  } catch (error) {
    send(ws, "error", error);
  }
}

const onConnectProducerTransport = async (event: any, ws: WebSocket) => {
  console.log(event);
  await producerTransport.connect({ dtlsParameters: event.dtlsParameters });
  send(ws, "pubConnected", "producer conneted")
}

const onConnectConsumerTransport = async (event: any, ws: WebSocket) => {
  console.log(event);
  await consumerTransport.connect({ dtlsParameters: event.dtlsParameters });
  send(ws, "subConnected", "consumer transport conneted")
}

const onProduce = async (event: any, ws: WebSocket, websocket: WebSocket.Server) => {
  const { kind, rtpParameters } = event;
  producer = await producerTransport.produce({ kind, rtpParameters });
  const res = {
    id: producer.id
  }
  send(ws, "published", res);
  broadcast(websocket, "hasPublisher", "new user");
  console.log("sending published.... ", res);
}

const onConsume = async (event: any, ws: WebSocket) => {
  const res = await createConsumer(producer, event.rtpCapabilities);
  send(ws, "subscribed", res);
}

const onResume = async (event: any, ws: WebSocket) => {
  console.log(event);
  await consumer.resume();
  send(ws, "resumed", "resumed");
}

const send = (ws: WebSocket, type: string, msg: any) => {
  const message = {
    type,
    data: msg
  }
  console.log("sending... ", message);
  const res = JSON.stringify(message);
  ws.send(res)
}

const broadcast = (ws: WebSocket.Server, type: string, msg: any) => {
  const message = {
    type,
    data: msg
  }
  console.log("sending broadcast... ", message);
  const res = JSON.stringify(message);
  ws.clients.forEach((client) => {
    client.send(res);
  });
}


const IsJsonString = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const createConsumer = async (producer: Producer, rtpCapabilities: RtpCapabilities) => {
  if (!mediasoupRouter.canConsume(
    {
      producerId: producer.id,
      rtpCapabilities,
    })
  ) {
    console.error('can not consume');
    return;
  }
  try {
    consumer = await consumerTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: producer.kind === 'video',
    });
  } catch (error) {
    console.error('consume failed', error);
    return;
  }

  if (consumer.type === 'simulcast') {
    await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
  }

  return {
    producerId: producer.id,
    id: consumer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused
  };
}

export {webSocketConnection};