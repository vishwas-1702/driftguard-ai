# SCD Drift Detection Business Rules

## Customer Status

### ACTIVE → BLOCKED

Severity: HIGH

Business meaning:
The customer's account has been blocked.

Recommended actions:
- Review the reason for the status change.
- Verify recent account activity.
- Check for suspicious transactions.
- Escalate to the risk team if suspicious activity is detected.

---

## KYC Status

### VERIFIED → EXPIRED

Severity: HIGH

Business meaning:
The customer's KYC verification is no longer valid.

Recommended actions:
- Request updated KYC documentation.
- Restrict high-risk operations until verification is completed.
- Notify the compliance team.

---

## Credit Limit

### Significant Reduction

Severity: MEDIUM or HIGH depending on context.

Business meaning:
A significant reduction in credit limit may indicate increased customer risk.

Recommended actions:
- Review the customer's risk profile.
- Check recent transactions.
- Verify whether the change was authorized.

---

## Customer City

### City Change

Severity: LOW by itself.

Business meaning:
A customer location change is not necessarily suspicious.

However, if a city change occurs together with:
- BLOCKED status
- EXPIRED KYC
- Significant credit-limit reduction

then the combined event should be treated as a potentially high-risk change.

Recommended actions:
- Verify the customer's address.
- Check whether the change was authorized.
- Consider the change together with other customer drift events.