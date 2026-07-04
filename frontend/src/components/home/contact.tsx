import { createElement, createSVGElement } from '../../utils/createElement.ts';

export function Contact() {
  const phoneIcon = createSVGElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
      fill: 'currentColor',
      className: 'bi bi-telephone-fill text-custom-light-blue',
      viewBox: '0 0 16 16',
    },
    createSVGElement('path', {
      d: 'M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z',
    })
  );

  const mailIcon = createSVGElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
      fill: 'currentColor',
      className: 'bi bi-envelope-fill text-custom-red',
      viewBox: '0 0 16 16',
    },
    createSVGElement('path', {
      d: 'M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.232L16 11.801V4.697z',
    })
  );

  return (
    <section className="container mb-5 pb-5">
      <div
        className="p-5 text-center rounded-4 shadow-lg position-relative overflow-hidden bg-beige"
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-beige"
          style="background: radial-gradient(circle at top right, rgba(78, 187, 234, 0.1), transparent 50%); z-index: 0;"
        ></div>
        <div className="position-relative" style="z-index: 1">
          <h2 className="display-6 fw-bold custom-font text-black mb-3">Noch Fragen?</h2>
          <p className="lead text-black-50 mb-4 mx-auto" style="max-width: 600px">
            Egal ob zur Buchung, zu den Fahrzeugen oder zu deiner perfekten Route – unser Team hilft
            dir gerne persönlich weiter.
          </p>
          <div className="d-flex justify-content-center gap-4 flex-wrap mb-4 fs-5">
            <div className="d-flex align-items-center gap-2 text-black">
              {phoneIcon}
              <span>+49 (0) 123 456 789</span>
            </div>
            <div className="d-flex align-items-center gap-2 text-black">
              {mailIcon}
              <span>service@rent-a-camper.me</span>
            </div>
          </div>
          <a
            href="/pages/contact/"
            className="btn btn-custom-light-blue px-5 py-3 custom-font fs-4 shadow-sm text-dark"
          >
            Schreib uns eine Nachricht
          </a>
        </div>
      </div>
    </section>
  );
}
