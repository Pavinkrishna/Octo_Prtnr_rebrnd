import { NextApiRequest, NextApiResponse } from "next";
import { generateRandomAlphanumeric } from "@/lib/util";
import { getCookie } from "cookies-next";
import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { TokenResult } from "@/lib/types";

declare global {
  var livekitSessions: {
    [key: string]: {
      apiKey: string;
      secret: string;
      url: string;
      name: string;
      expiresAt: number;
    };
  };
}

const createToken = (
  apiKey: string,
  apiSecret: string,
  userInfo: AccessTokenOptions,
  grant: VideoGrant,
  agentName?: string
) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: agentName,
          metadata: "{}",
        }),
      ],
    });
  }
  return at.toJwt();
};

export default async function handleToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).end("Method Not Allowed");
      return;
    }

    const sessionToken = getCookie("lk_session", { req, res }) as string;

    if (!sessionToken) {
      res
        .status(401)
        .json({ error: "No valid session. Please enter your API key first." });
      return;
    }

    global.livekitSessions = global.livekitSessions || {};
    const session = global.livekitSessions[sessionToken];

    if (!session || session.expiresAt < Date.now()) {
      delete global.livekitSessions[sessionToken];
      res
        .status(401)
        .json({ error: "Session expired. Please enter your API key again." });
      return;
    }

    const { apiKey, secret: apiSecret } = session;

    if (!apiKey || !apiSecret) {
      res.status(500).json({ error: "Invalid session credentials" });
      return;
    }

    const {
      roomName: roomNameFromBody,
      participantName: participantNameFromBody,
      participantId: participantIdFromBody,
      metadata: metadataFromBody,
      attributes: attributesFromBody,
      agentName: agentNameFromBody,
    } = req.body;

    const roomName =
      (roomNameFromBody as string) ||
      `room-${generateRandomAlphanumeric(4)}-${generateRandomAlphanumeric(4)}`;

    const identity =
      (participantIdFromBody as string) ||
      `identity-${generateRandomAlphanumeric(4)}`;

    const agentName = (agentNameFromBody as string) || undefined;

    const metadata = metadataFromBody as string | undefined;
    const attributesStr = attributesFromBody as string | undefined;
    const attributes = attributesStr || {};

    const participantName = participantNameFromBody || identity;

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    };

    const token = await createToken(
      apiKey,
      apiSecret,
      { identity, metadata, attributes, name: participantName },
      grant,
      agentName
    );

    const result: TokenResult = {
      identity,
      accessToken: token,
    };

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
