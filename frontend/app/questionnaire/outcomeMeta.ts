import type { PermitOutcome } from "@permit-scope/backend/logic"

type OutcomeMeta = {
  label: string
  shortLabel: string
  borderStyle: string
}

export const OUTCOME_META: Record<PermitOutcome, OutcomeMeta> = {
  in_house_review: {
    label: "In-House Review Process",
    shortLabel: "In-House Review",
    borderStyle: "border-warning/50"
  },
  otc_review: {
    label: "Over-the-Counter Submission Process",
    shortLabel: "Over-the-Counter",
    borderStyle: "border-info/50"
  },
  no_permit: {
    label: "No Permit",
    shortLabel: "No Permit Required",
    borderStyle: "border-success/50"
  }
}
