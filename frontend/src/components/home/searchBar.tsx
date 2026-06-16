import { createElement } from '../../utils/createElement.ts';

export function SearchBar() {
  return (
    <div className="container">
      <div
        className="card shadow-lg border-0 p-4"
        style={{
          backgroundColor: '#243046',
          borderRadius: '12px',
          marginTop: '-55px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <form id="quick-search-form" className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label
              htmlFor="search-location"
              className="form-label text-white-50 small text-uppercase fw-bold"
            >
              📍 Wo solls hingehen?
            </label>
            <input
              type="text"
              id="search-location"
              className="form-control bg-dark border-secondary text-white py-2"
              placeholder="Stadt, Region oder Abholort..."
              required
            />
          </div>
          <div className="col-6 col-md-3">
            <label
              htmlFor="search-start-date"
              className="form-label text-white-50 small text-uppercase fw-bold"
            >
              📅 Abholung
            </label>
            <input
              type="date"
              id="search-start-date"
              className="form-control bg-dark border-secondary text-white py-2"
              required
            />
          </div>
          <div className="col-6 col-md-3">
            <label
              htmlFor="search-end-date"
              className="form-label text-white-50 small text-uppercase fw-bold"
            >
              🏁 Rückgabe
            </label>
            <input
              type="date"
              id="search-end-date"
              className="form-control bg-dark border-secondary text-white py-2"
              required
            />
          </div>
          <div className="col-12 col-md-2">
            <button
              type="submit"
              className="btn btn-custom-yellow w-100 py-2 text-uppercase fw-bold shadow-sm"
            >
              Suchen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
