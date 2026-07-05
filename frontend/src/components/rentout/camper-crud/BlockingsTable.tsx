import { createElement } from "../../../utils/createElement.ts";
import type { BlockingResponse } from "../../../infrastructure/api/camper-blockings-api-client.ts";

/** Props for {@link BlockingsTable}. */
interface BlockingsTableProps {
  /** The blockings to render, one row per entry. */
  blockings: BlockingResponse[];
  /** Called with a blocking's id when that row's delete button is clicked. */
  onDelete: (blockingId: string) => void;
}

/**
 * Table of a camper's active blocked periods, shown inside the blocking
 * modal. Each row lists the start date, end date, and optional reason of
 * one blocking, plus a button to delete it.
 *
 * @param blockings Blockings to display, one per row.
 * @param onDelete Called with the blocking's id when its delete button is clicked.
 * @returns The `<table>` element.
 */
export function BlockingsTable({ blockings, onDelete }: BlockingsTableProps) {
  return (
    <table className="table table-sm table-hover mt-3">
      <thead>
        <tr>
          <th>Von</th>
          <th>Bis</th>
          <th>Grund</th>
          <th className="text-end"></th>
        </tr>
      </thead>
      <tbody>
        {blockings.map((b) => (
          <tr>
            <td>{b.start_date}</td>
            <td>{b.end_date}</td>
            <td>{b.reason || "-"}</td>
            <td className="text-end">
              <button className="btn btn-sm btn-outline-danger border-0" onclick={() => onDelete(b.id)}>
                <i className="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) as HTMLElement;
}
