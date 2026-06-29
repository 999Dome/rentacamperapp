import { createElement } from '../../utils/createElement.ts';

export function Hero() {
  return (
    <div
      className="text-center bg-image"
      style={{
        backgroundImage: 'url("/cover.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        height: '75vh',
        width: '100%',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        className="mask"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          height: '100%',
          width: '100%',
        }}
      >
        <div className="d-flex justify-content-center h-100 align-items-center h-100">
          <div className="text-white text-center">
            <img
              src="/icon.svg"
              className="mb-4"
              alt="Logo"
              style={{ width: '100px', height: 'auto' }}
            />

            <p className="display-2 mb-4 text-stroke-grey custom-font-burbank" style={{ letterSpacing: '2px' }}>
              <span className="text-custom-light-blue">Dein Weg</span>
              <span className="text-custom-red">. </span>
              <span className="text-custom-yellow">Dein Tempo</span>
              <span className="text-custom-light-blue">. </span>
              <span className="text-custom-red">Dein Ziel</span>
              <span className="text-custom-yellow">. </span>
            </p>

            <a className="btn btn-outline-light btn-lg" href="#!" role="button">
              Jetzt ein Wohnmobil mieten
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
