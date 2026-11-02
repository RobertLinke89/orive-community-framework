"use client";
import { Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function VerifiedBadge({ size = "sm", showLabel = true }: VerifiedBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5 cursor-default">
          <div className={`flex items-center justify-center rounded-full bg-[#00CDAC]/10 ${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`}>
            <Shield className={`text-[#00CDAC] ${size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"}`} fill="currentColor" />
          </div>
          {showLabel && (
            <span className={`font-bold uppercase tracking-[0.12em] text-[#00CDAC] ${size === "sm" ? "text-[9px]" : "text-[10px]"}`}>
              Verified
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-xs">
        <p className="font-semibold mb-1">ORIVE Verified Expert</p>
        <ul className="space-y-0.5 text-muted-foreground">
          <li>✓ Background Check</li>
          <li>✓ Credential Verification</li>
          <li>✓ Demo Session Review</li>
          <li>✓ Client References</li>
          <li>✓ Ongoing Quality Reviews</li>
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
