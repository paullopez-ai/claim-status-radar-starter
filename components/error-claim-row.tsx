import { TableRow, TableCell } from "@/components/ui/table"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ClaimInquiryResult } from "@/types/optum.types"

export function ErrorClaimRow({ result }: { result: ClaimInquiryResult }) {
  return (
    <TableRow className="bg-brand/5">
      <TableCell>
        <span className="text-sm font-sans">{result.claim.patientFirstName} {result.claim.patientLastName}</span>
      </TableCell>
      <TableCell colSpan={7}>
        <div className="flex items-center gap-2 text-brand">
          <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
          <span className="text-sm">{result.error}</span>
        </div>
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  )
}
