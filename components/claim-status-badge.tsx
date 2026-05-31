import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ClaimStatusBadgeProps {
  statusCode: string
  statusDescription: string
}

export function ClaimStatusBadge({ statusCode, statusDescription }: ClaimStatusBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-help">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
            {statusCode}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm max-w-xs">{statusDescription}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
