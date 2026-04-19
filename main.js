const app = document.getElementById("app");

const today = new Date().toDateString();

let state = JSON.parse(localStorage.getItem("carely_v3")) || {
  date: today,
  page: "home",
  score: 0,
  streak: 0,
  foods: [],
  habits: {
    workout: false,
    steps: false,
    diet: false,
    grooming: false,
    posture: false
  }
};

function save() {
  localStorage.setItem("carely_v3", JSON.stringify(state));
}

// RESET DAILY
if (state.date !== today) {
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = (done / 5) * 100;

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k => state.habits[k] = false);
  save();
}

// CONFIG
const habits = {
  workout: { label: "Workout", points: 20 },
  steps: { label: "8k Steps", points: 10 },
  diet: { label: "No Junk Food", points: 25 },
  grooming: { label: "Grooming", points: 10 },
  posture: { label: "Posture", points: 10 }
};

// ---------- RENDER ----------
function render() {
  app.innerHTML = `
    <div class="min-h-screen pb-24 text-white"
      style="background: linear-gradient(135deg, #0f172a, #1e293b, #020617);">

      ${renderHeader()}
      ${renderPage()}
      ${renderNav()}

    </div>
  `;
  bindEvents();
}

// HEADER
function renderHeader() {
  return `
    <div class="p-4">
      <div class="rounded-2xl p-4 backdrop-blur bg-white/10 border border-white/10 shadow-lg">
        <div class="flex justify-between text-lg">
          <div>Score</div>
          <div class="text-green-400">${state.score}</div>
        </div>

        <div class="bg-gray-700 h-2 rounded mt-2 overflow-hidden">
          <div class="bg-green-500 h-2" style="width:${state.score}%"></div>
        </div>

        <div class="text-sm mt-2 opacity-70">🔥 ${state.streak} day streak</div>
      </div>
    </div>
  `;
}

// PAGE SWITCH
function renderPage() {
  switch (state.page) {
    case "home": return homePage();
    case "meals": return mealsPage();
    case "fitness": return fitnessPage();
    case "grooming": return groomingPage();
    case "mind": return mindPage();
  }
}

// ---------- PAGES ----------

// HOME
function homePage() {
  return `
    <div class="px-4">

      <div class="text-sm opacity-60 mb-2">Today's Tasks</div>

      ${Object.keys(habits).map(key => `
        <div class="task mb-3 p-4 rounded-2xl backdrop-blur bg-white/10 border border-white/10 shadow"
          data-habit="${key}">

          <div class="flex justify-between">
            <div>${habits[key].label}</div>
            <div class="text-green-400">+${habits[key].points}</div>
          </div>

        </div>
      `).join("")}

      <div class="mt-4 text-sm opacity-60">Insight</div>
      <div class="p-4 rounded-2xl bg-white/10 mt-2">
        Diet + workout = faster jawline improvement
      </div>

    </div>
  `;
}

// MEALS
function mealsPage() {
  return `
    <div class="px-4">

      <div class="p-4 rounded-2xl bg-white/10 mb-3">
        <input id="foodInput" placeholder="Add food..."
          class="w-full p-2 text-black rounded mb-2"/>
        <button data-action="addFood"
          class="bg-green-500 w-full p-2 rounded">Add</button>
      </div>

      ${state.foods.map((f, i) => `
        <div class="p-3 mb-2 rounded-xl bg-white/10 flex justify-between">
          ${f}
          <span data-remove="${i}">❌</span>
        </div>
      `).join("")}

    </div>
  `;
}

// FITNESS
function fitnessPage() {
  return `
    <div class="px-4 space-y-3">

      ${["Push-ups", "Squats", "Plank"].map(ex => `
        <div class="p-4 rounded-2xl bg-white/10">
          ${ex}
          <div class="text-sm opacity-60 mt-1">3 sets</div>
        </div>
      `).join("")}

    </div>
  `;
}

// GROOMING
function groomingPage() {
  return `
    <div class="px-4 space-y-3">

      ${["Face wash", "Beard trim", "Hair set"].map(g => `
        <div class="p-4 rounded-2xl bg-white/10">
          ${g}
        </div>
      `).join("")}

    </div>
  `;
}

// POSTURE + CONFIDENCE
function mindPage() {
  return `
    <div class="px-4 space-y-3">

      ${["Posture check", "Slow speaking", "Eye contact"].map(m => `
        <div class="p-4 rounded-2xl bg-white/10">
          ${m}
        </div>
      `).join("")}

    </div>
  `;
}

// NAVBAR
function renderNav() {
  return `
    <div class="fixed bottom-0 left-0 right-0 flex justify-around p-3 bg-black/70 backdrop-blur border-t">

      <div class="nav" data-page="home">🏠</div>
      <div class="nav" data-page="meals">🍽</div>
      <div class="nav" data-page="fitness">🏋️</div>
      <div class="nav" data-page="grooming">🧴</div>
      <div class="nav" data-page="mind">🧠</div>

    </div>
  `;
}

// ---------- EVENTS ----------
function bindEvents() {
  app.onclick = (e) => {

    if (e.target.dataset.page) {
      state.page = e.target.dataset.page;
      save();
      render();
    }

    if (e.target.dataset.habit) {
      const key = e.target.dataset.habit;
      const h = habits[key];

      state.habits[key] = !state.habits[key];

      state.score += state.habits[key] ? h.points : -h.points;

      save();
      render();
    }

    if (e.target.dataset.action === "addFood") {
      const val = document.getElementById("foodInput").value;
      if (!val) return;

      state.foods.push(val);
      save();
      render();
    }

    if (e.target.dataset.remove) {
      state.foods.splice(e.target.dataset.remove, 1);
      save();
      render();
    }

  };
}

render();
