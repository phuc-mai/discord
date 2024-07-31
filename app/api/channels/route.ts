import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { MemberRole } from "@prisma/client";

export const POST = async (req: NextRequest) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, type } = await req.json();

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("Serve ID missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Channel name cannot be 'general'", {
        status: 400,
      });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[channels_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
