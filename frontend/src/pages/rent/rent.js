const STORAGE_KEY = "rentoutCampers";
const BOOKINGS_KEY = "rentBookings";

function parseStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (e) {
    return [];
  }
}

function createCard(camper) {
  const card = document.createElement("div");
  card.className = "camper-card";

  const imgWrap = document.createElement("div");
  imgWrap.className = "camper-image";
  const img = document.createElement("img");
  img.src = camper.image || "/public/components/mainheader/banner.jpg";
  img.alt = camper.name || "Camper";
  imgWrap.appendChild(img);

  const content = document.createElement("div");
  content.className = "camper-content";

  const h3 = document.createElement("h3");
  h3.textContent = camper.name || "Unbenannter Camper";

  const desc = document.createElement("p");
  desc.className = "camper-desc";
  desc.textContent = camper.description || "";

  const price = document.createElement("p");
  price.className = "camper-price";
  price.textContent = camper.price ? `${camper.price} € / Tag` : "";

  content.appendChild(h3);
  content.appendChild(desc);
  content.appendChild(price);

  if (camper.owner) {
    const owner = document.createElement("p");
    owner.className = "camper-owner";
    owner.textContent = `Anbieter: ${camper.owner}`;
    content.appendChild(owner);
  }

  card.appendChild(imgWrap);
  card.appendChild(content);

  return card;
}

function renderList(containerId, items, emptyId) {
  const container = document.getElementById(containerId);
  const empty = document.getElementById(emptyId);
  if (!container) return;
  container.innerHTML = "";
  if (!items || items.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";
  items.forEach((it) => container.appendChild(createCard(it)));
}

function refreshAll() {
  const companyCampers = [];

  
  const community = parseStorage(STORAGE_KEY).map((c) => ({
    ...c,
    source: "community",
  }));
  const bookings = parseStorage(BOOKINGS_KEY);

  renderList("companyCamperList", companyCampers, "companyEmpty");
  renderList("communityCamperList", community, "communityEmpty");
  renderList("bookingsList", bookings, "bookingsEmpty");
}

window.addEventListener("DOMContentLoaded", () => {
  refreshAll();

  
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === BOOKINGS_KEY) refreshAll();
  });
});
