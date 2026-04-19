const app = document.getElementById("app");

const today = new Date().toDateString();

let state = JSON.parse(localStorage.getItem("carely_v4")) || {
  date: today,
  page: "home",
  score: 0,
  streak: 0,
  foods: [],
  history: [],
  habits: {
    workout: false,
    steps: false,
    diet: false,
    grooming: false,
    posture: false
  }
};

function save() {
  localStorage.setItem("carely_v4", JSON.stringify(state));
}

// RESET DAILY
if (state.date !== today) {
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = Math.round((done / 5) * 100);

  state.history.push({
    date: new Date().toLocaleDateString(),
    score: percent
  });

  if (state.history.length > 60) state.history.shift();

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
    <div class="min-h-screen pb-28 text-white"
      style="background: linear-gradient(135deg, #020617, #0f172a, #1e293b);">

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
      <div class="rounded-2xl p-4 bg-white/10 backdrop-blur border border-white/10">

        <div class="flex justify-between">
          <div class="text-lg">Score</div>
          <div class="text-green-400">${state.score}</div>
        </div>

        <div class="bg-gray-700 h-2 rounded mt-2">
          <div class="bg-green-500 h-2 rounded"
            style="width:${state.score}%"></div>
        </div>

        <div class="text-sm mt-2 opacity-70">
          🔥 ${state.streak} day streak
        </div>

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
    case "calendar": return calendarPage();
  }
}

// ---------- HOME ----------
function homePage() {

  // TOP 3 PRIORITIES
  const priority = ["diet", "workout", "posture"];

  return `
    <div class="px-4">

      <div class="text-sm opacity-60 mb-2">🔥 Top 3 Focus</div>

      ${priority.map(p => `
        <div class="task p-4 mb-2 rounded-2xl bg-green-500/20 border border-green-400"
          data-habit="${p}">
          ${habits[p].label}
        </div>
      `).join("")}

      <div class="text-sm opacity-60 mt-4 mb-2">Today's Tasks</div>

      ${Object.keys(habits).map(key => `
        <div class="task p-3 mb-2 rounded-xl bg-white/10 flex justify-between"
          data-habit="${key}">
          ${habits[key].label}
          <span class="text-green-400">+${habits[key].points}</span>
        </div>
      `).join("")}

      ${renderInsight()}

    </div>
  `;
}

// ---------- INSIGHT ENGINE ----------
function renderInsight() {
  let msg = "Stay consistent.";

  if (!state.habits.diet) msg = "Diet is breaking your progress.";
  else if (!state.habits.workout) msg = "Workout missing today.";
  else if (state.score > 60) msg = "Strong day. Keep pushing.";

  return `
    <div class="mt-4">
      <div class="text-sm opacity-60">Insight</div>
      <div class="p-4 rounded-xl bg-white/10 mt-2">${msg}</div>
    </div>
  `;
}

// ---------- MEALS ----------
function mealsPage() {
  return `
    <div class="px-4">

      <div class="p-4 bg-white/10 rounded-xl mb-3">
        <input id="foodInput"
          class="w-full p-2 text-black rounded mb-2"
          placeholder="Add food"/>
        <button data-action="addFood"
          class="bg-green-500 w-full p-2 rounded">Add</button>
      </div>

      ${state.foods.map((f,i)=>`
        <div class="bg-white/10 p-3 mb-2 rounded flex justify-between">
          ${f}
          <span data-remove="${i}">❌</span>
        </div>
      `).join("")}

    </div>
  `;
}

// ---------- FITNESS ----------
function fitnessPage() {
  return `
    <div class="px-4 space-y-3">
      ${["Push-ups","Squats","Plank"].map(e=>`
        <div class="p-4 bg-white/10 rounded-xl">${e}</div>
      `).join("")}
    </div>
  `;
}

// ---------- GROOMING ----------
function groomingPage() {
  return `
    <div class="px-4 space-y-3">
      ${["Face wash","Beard trim","Hair set"].map(g=>`
        <div class="p-4 bg-white/10 rounded-xl">${g}</div>
      `).join("")}
    </div>
  `;
}

// ---------- MIND ----------
function mindPage() {
  return `
    <div class="px-4 space-y-3">
      ${["Posture","Confidence","Eye contact"].map(m=>`
        <div class="p-4 bg-white/10 rounded-xl">${m}</div>
      `).join("")}
    </div>
  `;
}

// ---------- 📅 CALENDAR ----------
function calendarPage() {

  return `
    <div class="px-4">

      <div class="grid grid-cols-7 gap-2 text-center text-sm">
        ${state.history.slice(-28).map(d=>`
          <div class="p-2 rounded ${
            d.score >= 70 ? 'bg-green-500' : 'bg-gray-700'
          }">
            ${new Date(d.date).getDate()}
          </div>
        `).join("")}
      </div>

    </div>
  `;
}

// NAV
function renderNav() {
  return `
    <div class="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur border-t flex justify-around p-3">

      <div class="nav" data-page="home">🏠</div>
      <div class="nav" data-page="meals">🍽</div>
      <div class="nav" data-page="fitness">🏋️</div>
      <div class="nav" data-page="grooming">🧴</div>
      <div class="nav" data-page="mind">🧠</div>
      <div class="nav" data-page="calendar">📅</div>

    </div>
  `;
}

// EVENTS
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

      // 🎉 REWARD FEEDBACK
      if (state.score >= 70) {
        alert("🔥 Great day! Keep streak going!");
      }

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
