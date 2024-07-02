"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import ActionTooltip from "@/components/action-tooltip";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

const NavigationItem = ({ id, name, imageUrl }: NavigationItemProps) => {
  const param = useParams();
  const router = useRouter();

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={() => router.push(`/servers/${id}`)} className="group relative items- justify-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            param?.serverId !== id && "group-hover:h-[20px]",
            param?.serverId === id ? "h-[36px]" : "h-[8px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] trasition-all overflow-hidden",
            param?.serverId === id &&
              "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <Image fill src={imageUrl} alt="Channel" />
        </div>
      </button>
    </ActionTooltip>
  );
};

export default NavigationItem;
