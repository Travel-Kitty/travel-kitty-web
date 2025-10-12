"use client";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { webRTC } from "@libp2p/webrtc";
import { webTransport } from "@libp2p/webtransport";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";

let heliaPromise: Promise<ReturnType<typeof createHelia>> | null = null;

export async function getHelia() {
  if (!heliaPromise) {
    heliaPromise = (async () => {
      const libp2p = await createLibp2p({
        transports: [webSockets(), webTransport(), webRTC()],
        connectionEncryption: [noise()],
        streamMuxers: [mplex()],
      });
      return createHelia({ libp2p });
    })();
  }
  return heliaPromise;
}

export async function putToIpfs(data: Blob | Uint8Array | string) {
  const h = await getHelia();
  const fs = unixfs(h);
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : data instanceof Blob
      ? new Uint8Array(await data.arrayBuffer())
      : data;
  const cid = await fs.addBytes(bytes);
  return cid.toString();
}
