import { createElement, createSVGElement } from '../../utils/createElement.ts';

const highlightData = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=600&q=80',
    title: 'VW Bulli T6',
    desc: 'Der Klassiker für Paare. Wendig, sparsam und mit allem Nötigen an Bord.',
    price: '89€',
    badges: [
      { text: '2 Schlafplätze', color: 'light-blue' },
      { text: 'Kompakt', color: 'light-blue' },
    ],
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1513311068348-19c8fbdc0bb6?auto=format&fit=crop&w=600&q=80',
    title: 'Family Cruiser Alkoven',
    desc: 'Viel Platz für die ganze Familie. Inklusive großer Küche und Bad.',
    price: '125€',
    badges: [
      { text: '5 Schlafplätze', color: 'red' },
      { text: 'Dusche/WC', color: 'light-blue' },
    ],
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1552084086-fa638c4c3757?auto=format&fit=crop&w=600&q=80',
    title: 'Adventure Sprinter 4x4',
    desc: 'Für Orte, an die andere nicht kommen. Solarpanel und Allradantrieb.',
    price: '145€',
    badges: [
      { text: 'Allrad 4x4', color: 'yellow' },
      { text: 'Autark', color: 'light-blue' },
    ],
  },
];

function createHeartIcon() {
  return createSVGElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      fill: 'currentColor',
      className: 'bi bi-heart text-white',
      viewBox: '0 0 16 16',
    },
    createSVGElement('path', {
      d: 'm8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15',
    })
  );
}

export function Highlights() {
  return (
    <section className="container my-4">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold custom-font text-white mb-3">Unsere Highlights</h2>
        <p className="lead text-white-50">
          Finde den perfekten Begleiter für deinen nächsten Roadtrip.
        </p>
      </div>
      <div className="row g-4">
        {highlightData.map((camper) => (
          <div className="col-12 col-md-4">
            <div
              className="card h-100 border-0 shadow-lg position-relative"
              style={{
                backgroundColor: '#243946',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.2s;',
              }}
            >
              <button
                className="wishlist-btn btn btn-sm btn-dark position-absolute top-0 end-0 m-3 rounded-circle border-0 shadow"
                data-camper-id={camper.id.toString()}
                style={{
                  width: '40px',
                  height: '40px',
                  zIndex: 10,
                }}
              >
                {createHeartIcon()}
              </button>
              <img
                src={camper.img}
                className="card-img-top"
                alt={camper.title}
                style="height: 220px; object-fit: cover"
              />
              <div className="card-body d-flex flex-column p-4">
                <div className="d-flex gap-2 mb-3">
                  {camper.badges.map((b) => (
                    <span
                      className={`badge bg-dark border border-custom-${b.color} text-custom-${b.color}`}
                    >
                      {b.text}
                    </span>
                  ))}
                </div>
                <h5 className="card-title custom-font text-white fs-3 mb-1">{camper.title}</h5>
                <p className="text-white-50 small mb-4">{camper.desc}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="text-custom-yellow fs-4 fw-bold">
                    ab {camper.price} <span className="fs-6 text-white-50 fw-normal">/ Nacht</span>
                  </span>
                  <a href={`/rent/?id=${camper.id}`} className="btn btn-outline-custom-yellow px-4">
                    Ansehen
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
