import type { ClaimInquiryGraphQLResponse, ClaimInquiryResponse } from '@/types/optum.types'
import { getOptumBearerToken } from '@/lib/optum-auth'

const CLAIM_INQUIRY_QUERY = `
query ClaimInquiry($claimControlNumber: String!, $tradingPartnerServiceId: String!) {
  claimInquiry(
    claimControlNumber: $claimControlNumber
    tradingPartnerServiceId: $tradingPartnerServiceId
  ) {
    controlNumber
    tradingPartnerServiceId
    claimStatus {
      statusCode
      statusCodeDescription
      statusCategoryCode
      statusCategoryDescription
      effectiveDate
      checkDate
      checkNumber
    }
    claimServiceLine {
      lineNumber
      procedureCode
      billedAmount
      allowedAmount
      paidAmount
      adjustmentReasonCode
      adjustmentReasonDescription
      remarkCode
      remarkDescription
    }
    payerControlNumber
    claimReceivedDate
    patientAccountNumber
    totalBilledAmount
    totalAllowedAmount
    totalPaidAmount
    patientResponsibilityAmount
    renderingProvider { npi firstName lastName organizationName }
    submittedProvider { npi organizationName }
    subscriber { memberId firstName lastName dateOfBirth }
    payer { name payerId }
    adjudicationInfo {
      isAdjudicated adjudicationDate eraAvailable
      denialReason denialCode appealDeadline
    }
    additionalInformationRequested {
      isRequested requestType requestDescription responseDueDate
    }
  }
}
`

export async function queryClaimInquiry(
  claimControlNumber: string,
  tradingPartnerServiceId: string
): Promise<ClaimInquiryResponse> {
  const token = await getOptumBearerToken()
  const graphqlUrl = process.env.OPTUM_GRAPHQL_URL

  if (!graphqlUrl) {
    throw new Error('Missing OPTUM_GRAPHQL_URL environment variable')
  }

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CLAIM_INQUIRY_QUERY,
      variables: { claimControlNumber, tradingPartnerServiceId },
    }),
  })

  if (!response.ok) {
    throw new Error(`Optum API HTTP error: ${response.status} ${response.statusText}`)
  }

  const json: ClaimInquiryGraphQLResponse = await response.json()

  // CRITICAL: GraphQL returns HTTP 200 even for errors
  if (json.errors && json.errors.length > 0) {
    const errorCode = json.errors[0].extensions?.code ?? 'UNKNOWN'
    throw new Error(`Optum GraphQL error [${errorCode}]: ${json.errors[0].message}`)
  }

  if (!json.data?.claimInquiry) {
    throw new Error('Optum API returned null claimInquiry data')
  }

  return json.data.claimInquiry
}
