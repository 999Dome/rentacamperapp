import { createElement } from '../../utils/createElement';
import { sendContactEmail } from '../../api/supportAPI';

export function ContactForm() {
  const container = (
    <div className="container my-5" style={{ minHeight: '60vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h2 className="card-title fw-bold custom-font mb-4 text-center">Schreibe uns</h2>
              <p className="text-muted text-center mb-5">
                Hast du Fragen, Wünsche oder Anregungen? Fülle einfach das Formular aus und wir melden uns schnellstmöglich bei dir.
              </p>
              
              <div id="alert-container"></div>

              <form id="contact-form">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">E-Mail</label>
                    <input type="email" className="form-control" id="email" required />
                  </div>
                  <div className="col-12">
                    <label htmlFor="subject" className="form-label">Betreff</label>
                    <select className="form-select" id="subject" required>
                      <option value="" disabled selected>Bitte wählen...</option>
                      <option value="Buchungsanfrage">Buchungsanfrage</option>
                      <option value="Technischer Fehler">Technischer Fehler</option>
                      <option value="Sonstiges">Sonstiges</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="message" className="form-label">Nachricht</label>
                    <textarea className="form-control" id="message" rows={5} required></textarea>
                  </div>
                  <div className="col-12 text-center mt-4">
                    <button type="submit" className="btn btn-custom-red px-5 py-2 fs-5 rounded-3 w-100">
                      Nachricht senden
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) as HTMLElement;

  const form = container.querySelector('#contact-form') as HTMLFormElement;
  const alertContainer = container.querySelector('#alert-container') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
    
    alertContainer.innerHTML = '';

    const name = (form.querySelector('#name') as HTMLInputElement).value;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const subject = (form.querySelector('#subject') as HTMLSelectElement).value;
    const message = (form.querySelector('#message') as HTMLTextAreaElement).value;

    try {
      await sendContactEmail({ name, email, subject, message });
      
      alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          Deine Nachricht wurde erfolgreich gesendet! Wir werden uns in Kürze bei dir melden.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
      form.reset();
    } catch {
      alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Nachricht senden';
    }
  });

  return container;
}
