// Euer Bootstrap und Theme
import '../../scss/theme.scss';
import 'bootstrap';

// 1. Die HTML-Datei als simplen Text-String importieren (Vite-Feature!)
import headerHTML from './mainheader.html?raw';

// 2. Den Platzhalter im DOM suchen
const headerContainer = document.getElementById('main-header');

// 3. Das HTML in den Platzhalter einfügen
if (headerContainer) {
  headerContainer.innerHTML = headerHTML;
}