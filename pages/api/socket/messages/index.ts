import { NextApiRequest } from "next";

import { currentProfilePages } from "@/lib/current-profile-pages";
import { NextApiResponseServerIO } from "@/types";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const profile = await currentProfilePages(req);

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!serverId || !channelId) {
      return res.status(400).json({ error: "Server ID or Channel ID missing" });
    }

    if (!content && !fileUrl) {
      return res.status(400).json({ error: "Content or File URL missing" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return res.status(401).json({ error: "Member not found" });
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channel.id,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`
    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.error("messages_POST", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
