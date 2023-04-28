import {
  RtpCodecCapability,
  TransportListenIp,
  WorkerLogTag,
} from "mediasoup/node/lib/types";
import os from "os";
export const config = {
  listenIp: "0.0.0.0",
  listenPort: 3026,
  sslCrt: "../ssl/cert.pem",
  sslKey: "../ssl/key.pem",

  mediasoup: {
    // Worker settings
    numWorkers: Object.keys(os.cpus()).length,
    workerSettings: {
      logLevel: "warn",
      logTags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp",
        "rtx",
        "bwe",
        "score",
        "simulcast",
        "svc",
        "sctp",
      ] as WorkerLogTag[],
      rtcMinPort: 40000, 
      rtcMaxPort: 49999,
    },
    // Router settings
    routerOptions: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {
            "profile-id": 2,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "4d0032",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
      ] as RtpCodecCapability[],
    },
    webRtcServerOptions: {
      listenInfos: [
        {
          protocol: "udp",
          ip: "0.0.0.0",
          announcedIp: "127.0.0.1",
          port: 44455,
        },
        {
          protocol: "tcp",
          ip: "0.0.0.0",
          announcedIp: "127.0.0.1",
          port: 44444,
        },
      ],
    },
    // WebRtcTransport settings
    webRtcTransportOptions: {
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: "127.0.0.1", // replace by public IP address
        },
      ] as TransportListenIp[],
      initialAvailableOutgoingBitrate: 2000000,
      minimumAvailableOutgoingBitrate: 600000,
      maxSctpMessageSize: 262144,
      // Additional options that are not part of WebRtcTransportOptions.
      maxIncomingBitrate: 1500000,
    },
    plainTransportOptions: {
      listenIp: {
        ip: "0.0.0.0",
        announcedIp: "127.0.0.1"
      },
      maxSctpMessageSize: 3530913849,
    },
  },
} as const;
