import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ClaimInquiryResponse } from "@/types/optum.types"
import type { SyntheticClaim } from "@/types/claim.types"

interface ClaimDetailTabProps {
  claim: SyntheticClaim
  response: ClaimInquiryResponse
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-sans">{label}</span>
      <span className="text-sm font-mono">{value ?? "—"}</span>
    </div>
  )
}

export function ClaimDetailTab({ claim, response }: ClaimDetailTabProps) {
  return (
    <Card className="border-l-4 border-l-primary/40 border-t-0 border-r border-b">
      <CardContent className="p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Claim Info</h4>
            <DetailRow label="Control Number" value={response.controlNumber} />
            <DetailRow label="Payer Control #" value={response.payerControlNumber} />
            <DetailRow label="Received Date" value={response.claimReceivedDate} />
            <DetailRow label="Status" value={`${response.claimStatus.statusCode} — ${response.claimStatus.statusCodeDescription}`} />
            <DetailRow label="Effective Date" value={response.claimStatus.effectiveDate} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Amounts</h4>
            <DetailRow label="Total Billed" value={response.totalBilledAmount} />
            <DetailRow label="Total Allowed" value={response.totalAllowedAmount} />
            <DetailRow label="Total Paid" value={response.totalPaidAmount} />
            <DetailRow label="Patient Responsibility" value={response.patientResponsibilityAmount} />
            <DetailRow label="Check Date" value={response.claimStatus.checkDate} />
            <DetailRow label="Check Number" value={response.claimStatus.checkNumber} />
          </div>
        </div>

        {/* Subscriber */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Subscriber</h4>
          <DetailRow label="Member ID" value={response.subscriber.memberId} />
          <DetailRow label="Name" value={[response.subscriber.firstName, response.subscriber.lastName].filter(Boolean).join(" ") || null} />
          <DetailRow label="DOB" value={response.subscriber.dateOfBirth} />
        </div>

        {/* Service Lines */}
        {response.claimServiceLine.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Service Lines</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">Line</TableHead>
                  <TableHead className="font-mono text-xs">Procedure</TableHead>
                  <TableHead className="font-mono text-xs text-right">Billed</TableHead>
                  <TableHead className="font-mono text-xs text-right">Allowed</TableHead>
                  <TableHead className="font-mono text-xs text-right">Paid</TableHead>
                  <TableHead className="font-mono text-xs">Adj. Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {response.claimServiceLine.map((line) => (
                  <TableRow key={line.lineNumber}>
                    <TableCell className="font-mono text-xs">{line.lineNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{line.procedureCode}</TableCell>
                    <TableCell className="font-mono text-xs text-right">{line.billedAmount}</TableCell>
                    <TableCell className="font-mono text-xs text-right">{line.allowedAmount ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-right">{line.paidAmount ?? "—"}</TableCell>
                    <TableCell className="text-xs">{line.adjustmentReasonDescription ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Adjudication */}
        {response.adjudicationInfo.isAdjudicated && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Adjudication</h4>
            <DetailRow label="Adjudicated" value={response.adjudicationInfo.isAdjudicated ? "Yes" : "No"} />
            <DetailRow label="Date" value={response.adjudicationInfo.adjudicationDate} />
            <DetailRow label="ERA Available" value={response.adjudicationInfo.eraAvailable ? "Yes" : "No"} />
            {response.adjudicationInfo.denialReason && <DetailRow label="Denial Reason" value={response.adjudicationInfo.denialReason} />}
            {response.adjudicationInfo.denialCode && <DetailRow label="Denial Code" value={response.adjudicationInfo.denialCode} />}
            {response.adjudicationInfo.appealDeadline && <DetailRow label="Appeal Deadline" value={response.adjudicationInfo.appealDeadline} />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
