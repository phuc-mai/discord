import { NextRequest, NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: {
          not: profile.id, // Admin can not leave server by himself
        },
        members: {
          some: {
            profileId: profile.id, // User must be a member of the server to leave
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[serverId_leave_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
