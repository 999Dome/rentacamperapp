import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link DepositBox}. */
interface DepositBoxProps {
  /** The deposit amount (in EUR) to be paid in cash/card on-site. */
  depositAmount: number;
}

/**
 * Small note in the order-summary card reminding the user about the
 * security deposit that has to be handed over on-site (not paid online).
 *
 * @param props See {@link DepositBoxProps}.
 * @returns The deposit note element.
 */
export function DepositBox({ depositAmount }: DepositBoxProps) {
  return (
    <div className="text-muted p-2 bg-light rounded border border-secondary-subtle fs-13px">
      <div className="d-flex justify-content-between fw-medium">
        <span>Kaution (vor Ort zu hinterlegen):</span>
        <span>{depositAmount ? depositAmount.toFixed(2) : "0.00"} €</span>
      </div>
    </div>
  ) as HTMLElement;
}
