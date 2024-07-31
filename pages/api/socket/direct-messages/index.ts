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
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "Server ID or Channel ID missing" });
    }

    if (!content && !fileUrl) {
      return res.status(400).json({ error: "Content or File URL missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(401).json({ error: "Member not found" });
    }

    const message = await db.directMessage.create({
      data: {
        content,
        fileId: fileUrl,
        conversationId: conversationId as string,
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

    const channelKey = `chat:${conversationId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.error("direct-messages_POST", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
