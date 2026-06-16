const camperForm = document.getElementById("camperForm");
const submissionsList = document.getElementById("submissionsList");
const imageUrlInput = document.getElementById("imageUrl");
const imageFileInput = document.getElementById("imageFile");
const imagePreview = document.getElementById("imagePreview");
const rentedUntilInput = document.getElementById("rentedUntil");

const STORAGE_KEY = "rentoutCampers";
let campers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let editingId = null;
const submitButton = camperForm.querySelector('button[type="submit"]');

function createCamperCard(camper) {
  const card = document.createElement("article");
  card.className = "submission-card";

  const image = document.createElement("div");
  image.className = "submission-image";
  image.innerHTML = `
    <img src="${camper.image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop"}" alt="${camper.name}" />
    <span class="submission-badge ${camper.status === "rented" ? "rented" : "available"}">
      ${camper.status === "rented" ? "Bereits vermietet" : "Verfügbar"}
    </span>
  `;

  const content = document.createElement("div");
  content.className = "submission-content";
  content.innerHTML = `
    <div class="submission-header">
      <h3>${camper.name}</h3>
      <p class="submission-owner">Angeboten von ${camper.owner}</p>
    </div>
    <p class="submission-description">${camper.description || "Keine Beschreibung angegeben."}</p>
    <div class="submission-meta">
      <p><strong>Preis:</strong> ${camper.price}</p>
      <p><strong>Kontakt:</strong> ${camper.contact}</p>
      ${camper.status === "rented" ? `<p><strong>Vermietet bis:</strong> ${camper.rentedUntil || "Nicht angegeben"}</p>` : ""}
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "submission-actions";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "btn btn-secondary";
  toggleButton.textContent =
    camper.status === "rented"
      ? "Als verfügbar markieren"
      : "Als vermietet markieren";
  toggleButton.addEventListener("click", () => toggleCamperStatus(camper.id));
  actions.appendChild(toggleButton);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "btn btn-secondary";
  editButton.textContent = "Bearbeiten";
  editButton.addEventListener("click", () => startEdit(camper.id));
  actions.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-danger";
  deleteButton.textContent = "Löschen";
  deleteButton.addEventListener("click", () => deleteCamper(camper.id));
  actions.appendChild(deleteButton);

  content.appendChild(actions);
  card.append(image, content);
  return card;
}

function renderSubmissions() {
  submissionsList.innerHTML = "";
  if (!campers.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Sie haben noch keinen Camper eingetragen.";
    submissionsList.appendChild(empty);
    return;
  }

  campers.forEach((camper) => {
    submissionsList.appendChild(createCamperCard(camper));
  });
}

function setPreview(src) {
  if (!src) {
    imagePreview.src = "";
    imagePreview.style.display = "none";
    return;
  }
  imagePreview.src = src;
  imagePreview.style.display = "block";
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

imageUrlInput.addEventListener("input", () => {
  if (imageUrlInput.value.trim()) {
    setPreview(imageUrlInput.value.trim());
  } else if (!imageFileInput.files.length) {
    setPreview("");
  }
});

imageFileInput.addEventListener("change", async () => {
  if (imageFileInput.files.length) {
    const file = imageFileInput.files[0];
    const dataUrl = await readFileAsDataURL(file);
    setPreview(dataUrl);
  }
});

camperForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("camperName").value.trim();
  const owner = document.getElementById("ownerName").value.trim();
  const price = document.getElementById("pricePerDay").value.trim();
  const status = document.getElementById("status").value;
  const rentedUntil = rentedUntilInput.value;
  const contact = document.getElementById("contactInfo").value.trim();
  const description = document.getElementById("camperDescription").value.trim();
  const imageUrl = imageUrlInput.value.trim();

  let image = imageUrl;

  if (imageFileInput.files.length) {
    image = await readFileAsDataURL(imageFileInput.files[0]);
  }

  if (!name || !owner || !price || !contact) {
    alert("Bitte füllen Sie die Pflichtfelder aus.");
    return;
  }

  const camper = {
    id: Date.now(),
    name,
    owner,
    price,
    status,
    rentedUntil,
    contact,
    description,
    image,
  };

  if (editingId) {
    campers = campers.map((c) => {
      if (c.id === editingId) {
        return {
          ...c,
          name,
          owner,
          price,
          status,
          rentedUntil,
          contact,
          description,
          image,
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campers));
    editingId = null;
    submitButton.textContent = "Camper hinzufügen";
    renderSubmissions();
    camperForm.reset();
    setPreview("");
    return;
  }

  campers.unshift(camper);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campers));
  renderSubmissions();
  camperForm.reset();
  setPreview("");
});

function toggleCamperStatus(id) {
  campers = campers.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status: item.status === "rented" ? "available" : "rented",
        rentedUntil: item.status === "rented" ? "" : item.rentedUntil,
      };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campers));
  renderSubmissions();
}

function deleteCamper(id) {
  campers = campers.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campers));
  renderSubmissions();
}

function startEdit(id) {
  const camper = campers.find((c) => c.id === id);
  if (!camper) return;
  editingId = id;
  document.getElementById("camperName").value = camper.name || "";
  document.getElementById("ownerName").value = camper.owner || "";
  document.getElementById("pricePerDay").value = camper.price || "";
  document.getElementById("status").value = camper.status || "available";
  document.getElementById("rentedUntil").value = camper.rentedUntil || "";
  document.getElementById("imageUrl").value =
    camper.image && camper.image.startsWith("data:") ? "" : camper.image || "";
  imageFileInput.value = null;
  document.getElementById("contactInfo").value = camper.contact || "";
  document.getElementById("camperDescription").value = camper.description || "";
  setPreview(camper.image || "");
  submitButton.textContent = "Änderungen speichern";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

renderSubmissions();
