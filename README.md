# 🚐 Rent a Camper - Web-Uni-Projekt

Thema ist die Konzeption und Entwicklung eines Portals zum mieten von Wohnmobilen.

Das Projekt ist als **Full-Stack TypeScript Monorepo** aufgebaut.

---

## 🔗 Wichtige Live-Links (Produktivumgebung)

* 🌍 **Frontend Deployment:** [Vercel](https://vercel.com/domes-projects-63a582b3/rentacamperapp)
* ⚙️ **Backend Deployment:** [Heroku](https://dashboard.heroku.com/pipelines/9ef49e89-28af-495d-81bf-5ab6c0457d19)
* 🗄️ **Datenbank Dashboard:** [Supabase](https://supabase.com/dashboard/project/wzghzmsioptlbsnzpnga)

---

## 🛠️ Verwendeter Tech-Stack

* **Frontend:** Vanilla TypeScript, HTML5, CSS (Bootstrap 5) – gebündelt mit *Vite* (als Multi-Page Application).
* **Backend:** Node.js, Express.js (REST-API).
* **Datenbank:** PostgreSQL (gehostet auf Supabase), angebunden via *Prisma ORM*.
* **Deployment:** Vercel (Frontend) und Heroku (Backend).
* **Besonderheit:** Ein gemeinsamer `shared/`-Ordner für TypeScript-Interfaces, um Frontend und Backend typsicher zu synchronisieren.

---

## Geplante Features (ergänzbar)
Suche aller verfügbaren Wohnmobile inkl. Filter & Merkliste (LocalStorage)

Registrieren, Login (inkl. Bot-Schutz via MathML)

Rollen: Mieter, Vermieter, Admin

Wohnmobil anlegen (Vermieter) -> Autom. Bild-Optimierung (Backend) -> Admin-Freigabe

Detail-Sicht / Vermieten-Sicht inkl. Standort-Karte (Google Maps API)

Kalender-Sicht für Wohnmobile (verfügbar/blockiert)

Seiten zum Buchen/Zahlen inkl. digitaler Unterschrift (Canvas-Element)

Bezahlen via Stripe/PayPal inkl. Rechnungs-Generierung (PDF)










