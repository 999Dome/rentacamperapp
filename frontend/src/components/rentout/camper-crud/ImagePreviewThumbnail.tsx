import { createElement } from "../../../utils/createElement.ts";

/** Props for {@link ImagePreviewThumbnail}. */
interface ImagePreviewThumbnailProps {
  /** Object URL used as the `<img>` source for this thumbnail's preview. */
  url: string;
  /** Index of this file within the selected-files list, passed back via `onRemove`. */
  index: number;
  /** Called with this thumbnail's index when the remove ("x") button is clicked. */
  onRemove: (index: number) => void;
}

/**
 * A single 80x80 image thumbnail shown while adding/editing a camper's
 * photos, with a small circular "x" button overlaid in the top-right corner
 * that removes the image again before the form is submitted.
 *
 * @param url Object URL for the preview image.
 * @param index Position of the underlying file in the selected-files array.
 * @param onRemove Callback invoked with `index` when the remove button is clicked.
 * @returns The thumbnail wrapper `<div>` element.
 */
export function ImagePreviewThumbnail({ url, index, onRemove }: ImagePreviewThumbnailProps) {
  return (
    <div className="position-relative image-preview-thumb-wrapper">
      <img src={url} className="w-100 h-100 rounded-3 object-fit-cover shadow-sm border" />
      <button
        type="button"
        className="btn btn-danger btn-sm position-absolute rounded-circle p-0 d-flex align-items-center justify-content-center shadow image-preview-remove-btn"
        onclick={() => onRemove(index)}
      >
        {"×"}
      </button>
    </div>
  ) as HTMLElement;
}
