import { Router } from "mediasoup/node/lib/types";
import { config } from "../config";

const createWebRtcTransport = async (mediasoupRouter: Router) => {
  const { maxIncomingBitrate, initialAvailableOutgoingBitrate } =
    config.mediasoup.webRtcTransportOptions;

  const transport = await mediasoupRouter.createWebRtcTransport({
    listenIps: config.mediasoup.webRtcTransportOptions.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate,
  });
  if (maxIncomingBitrate) {
    try {
      await transport.setMaxIncomingBitrate(maxIncomingBitrate);
    } catch (error) {}
  }
  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    },
  };
};

export { createWebRtcTransport };
