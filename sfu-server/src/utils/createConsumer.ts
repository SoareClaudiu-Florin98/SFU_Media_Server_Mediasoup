import {
  Producer,
  RtpCapabilities,
  Router,
  Transport,
  Consumer,
} from "mediasoup/node/lib/types";

const createConsumer = async (
  producer: Producer,
  rtpCapabilities: RtpCapabilities,
  mediasoupRouter: Router,
  consumerTransport: Transport,
  consumer: Consumer
) => {
  if (
    !mediasoupRouter.canConsume({
      producerId: producer.id,
      rtpCapabilities,
    })
  ) {
    console.error("can not consume");
    return;
  }
  try {
    consumer = await consumerTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: producer.kind === "video",
    });
  } catch (error) {
    console.error("consume failed", error);
    return;
  }

  if (consumer.type === "simulcast") {
    await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
  }

  return {
    producerId: producer.id,
    id: consumer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused,
  };
};

export { createConsumer };
