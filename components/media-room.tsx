"use client";

import { useUser } from "@clerk/nextjs";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user?.firstName || !user?.lastName) return;

    const name = `${user.firstName} ${user.lastName}`;

    (async () => {
      try {
        const res = await fetch(`/api/livekit?room=${chatId}&username=${name}`);
        const data = await res.json();
        setToken(data.token);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId, user?.firstName, user?.lastName]);

  if (token === "")
    return (
      <div className="flex flex-1 flex-col justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );

  return (
    <div>
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect={true}
        video={video}
        audio={audio}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default MediaRoom;
