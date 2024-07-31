import { NextRequest, NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();
    const { name, imageUrl } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[serverId_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
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

    await db.server.delete({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
    });

    return new NextResponse("Server deleted", { status: 200 });
  } catch (error) {
    console.log("[serverId_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
