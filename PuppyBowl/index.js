const BASE = "https://fsa-puppy-bowl.herokuapp.com/api/";
const COHORT = "2506-FTB-CT-WEB-PT-DORIAN";
const API = BASE + COHORT;

const state = {
  players: [],
  selected: null,
};

const $playersList = document.querySelector("#playersList");
const $detailsRoot = document.querySelector("#detailsRoot");
const $addForm = document.querySelector("#addForm");

async function fetchAllPlayers() {
  const res = await fetch(`${API}/players`);
  if (!res.ok) throw new Error("Failed to fetch players");
  const data = await res.json();
  state.players = data.data.players ?? [];
}

async function fetchPlayerById(id) {
  const res = await fetch(`${API}/players/${id}`);
  if (!res.ok) throw new Error("Failed to fetch player");
  const data = await res.json();
  state.selected = data.data.player ?? null;
}

async function createPlayer({ name, breed }) {
  const res = await fetch(`${API}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, breed }),
  });
  if (!res.ok) throw new Error("Failed to create player");
}

async function removePlayer(id) {
  const res = await fetch(`${API}/players/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove player");
}

function renderRoster() {
  if (!state.players.length) {
    $playersList.innerHTML = `<li class="muted">No puppies yet.</li>`;
    return;
  }
  $playersList.innerHTML = state.players
    .map(
      (p) => `
    <li class="player" data-id="${p.id}" tabindex="0" aria-label="View ${
        p.name
      }">
      <img src="${p.imageUrl || "https://place-puppy.com/80x80"}" alt="${
        p.name
      }" />
      <div>
        <div><strong>${p.name}</strong></div>
        <div class="muted" style="font-size:.9rem">${p.breed ?? ""}</div>
      </div>
    </li>
  `
    )
    .join("");
}

function renderDetails() {
  if (!state.selected) {
    $detailsRoot.className = "card muted";
    $detailsRoot.textContent = "Select a puppy to see details.";
    return;
  }
  const p = state.selected;
  $detailsRoot.className = "card";
  $detailsRoot.innerHTML = `
    <div style="display:flex; gap:1rem; align-items:flex-start;">
      <img src="${p.imageUrl || "https://place-puppy.com/200x200"}" alt="${
    p.name
  }" />
      <div>
        <div><strong>Name</strong> ${p.name}</div>
        <div><strong>ID</strong> ${p.id}</div>
        <div><strong>Breed</strong> ${p.breed ?? "—"}</div>
        <div><strong>Status</strong> ${p.status ?? "—"}</div>
        <div><strong>Team</strong> ${p.team?.name ?? "Unassigned"}</div>
        <div style="margin-top:.75rem;">
          <button class="danger" id="removeBtn">Remove from roster</button>
        </div>
      </div>
    </div>
  `;
}

function render() {
  renderRoster();
  renderDetails();
}

$playersList.addEventListener("click", async (e) => {
  const li = e.target.closest(".player");
  if (!li) return;
  try {
    await fetchPlayerById(li.dataset.id);
    render();
  } catch (err) {
    console.error(err);
    alert("Could not load player details.");
  }
});

$playersList.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  const li = e.target.closest(".player");
  if (!li) return;
  try {
    await fetchPlayerById(li.dataset.id);
    render();
  } catch (err) {
    console.error(err);
    alert("Could not load player details.");
  }
});

$detailsRoot.addEventListener("click", async (e) => {
  if (e.target.id !== "removeBtn") return;
  const id = state.selected?.id;
  if (!id) return;
  try {
    await removePlayer(id);
    state.selected = null;
    await fetchAllPlayers();
    render();
  } catch (err) {
    console.error(err);
    alert("Could not remove player.");
  }
});

$addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const name = form.elements.name.value.trim();
  const breed = form.elements.breed.value.trim();
  if (!name || !breed) return;
  try {
    await createPlayer({ name, breed });
    form.reset();
    await fetchAllPlayers();
    render();
  } catch (err) {
    console.error(err);
    alert("Could not add player.");
  }
});

(async function init() {
  try {
    await fetchAllPlayers();
  } catch (err) {
    console.error(err);
    $playersList.innerHTML = `<li class="muted">Failed to load players.</li>`;
  } finally {
    render();
  }
})();
