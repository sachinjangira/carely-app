const app = document.getElementById("app");

const today = new Date().toDateString();

const defaultState = {
  date: today,
  page: "home",
  score: 0,
  streak: 0,
  foods: [],
  history: [],
  stats: {
    body: 20,
    discipline: 20,
    grooming: 20,
    presence: 20
  },
  habits: {
    workout: false,
    steps: false,
    diet: false,
    grooming: false,
    posture: false
  }
};

let state = JSON.parse(localStorage.getItem("carely_v2")) || defaultState;

function save() {
  localStorage.setItem("carely_v2", JSON.stringify(state));
}

// RESET DAILY
if (state.date !== today) {
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = Math.round((done / 5) * 100);

  state.history.push({ date: state.date, progress: percent });
  if (state.history.length > 30) state.history.shift();

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;
  state.habits = {
    workout: false,
    steps: false,
    diet: false,
    grooming: false,
    posture: false
  };

  save();
}

// CONFIG
const habitConfig = {
  workout: { label: "Workout", points: 20, stat: "body" },
  steps: { label: "8k Steps", points: 10, stat: "body" },
  diet: { label: "No Junk Food", points: 25, stat: "discipline" },
  grooming: { label: "Grooming", points: 10, stat: "grooming" },
  posture: { label: "Posture", points: 10, stat: "presence" }
};

// FOOD DB
const foodDB = {
  paneer: { p: 18, type: "protein" },
  tofu: { p: 8, type: "protein" },
  roti: { p: 3, type: "carb" },
  rice: { p: 2.5, type: "carb" },
  dal: { p: 9, type: "balanced" },
  curd: { p: 3, type: "balanced" },
  pizza: { p: 11, type: "junk" }
};

// EXERCISES
const exercises = [
  { name: "Push-up", reps: "3 x 12", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { name: "Squats", reps: "3 x 15", video: "https://www.w3schools.com/html/movie.mp4" }
];

// ---------- RENDER ----------
function render() {
  app.innerHTML = `
    <div class="p-4 pb-24 min-h-screen bg-black text-white">

      ${renderHeader()}
      ${renderPage()}
      ${renderNav()}

    </div>
  `;

  bindEvents();
}

// HEADER (GLOBAL)
function renderHeader() {
  const progress = Math.min(state.score, 100);

  return `
    <div class="bg-white/10 p-4 rounded-xl mb-4">
      <div class="flex justify-between">
        <div class="text-lg">Score</div>
        <div class="text-green-400">${state.score}</div>
      </div>

      <div class="bg-gray-700 h-2 rounded mt-2">
        <div class="bg-green-500 h-2 rounded" style="width:${progress}%"></div>
      </div>

      <div class="text-sm mt-2">🔥 ${state.streak} day streak</div>
    </div>
  `;
}

// MAIN PAGE SWITCH
function renderPage() {
  switch (state.page) {
    case "home":
      return renderHome();
    case "meals":
      return renderMeals();
    case "fitness":
      return renderFitness();
    case "progress":
      return renderProgress();
    default:
      return "";
  }
}

// HOME (CORE DASHBOARD)
function renderHome() {
  return `
    <div>
      <div class="text-sm text-gray-400 mb-2">Today's Tasks</div>

      ${Object.keys(state.habits).map(key => {
        const h = habitConfig[key];
        return `
          <div class="habit p-3 mb-2 rounded-xl flex justify-between ${
            state.habits[key] ? "bg-green-500/20" : "bg-white/10"
          }" data-habit="${key}">
            ${h.label}
            <span class="text-green-400">+${h.points}</span>
          </div>
        `;
      }).join("")}

      <div class="mt-4 text-sm text-gray-400">Quick Insight</div>
      <div class="bg-white/10 p-3 rounded">
        Focus on diet + workout for faster face change
      </div>
    </div>
  `;
}

// MEALS
function renderMeals() {
  const protein = state.foods.reduce((a, f) => a + f.p, 0);

  return `
    <input id="foodInput" placeholder="Search food"
      class="text-black w-full p-2 mb-2 rounded"/>

    <button data-action="addFood"
      class="bg-green-500 w-full p-2 mb-3 rounded">Add</button>

    ${state.foods.map((f, i) => `
      <div class="flex justify-between bg-white/10 p-2 mb-1">
        ${f.name}
        <span data-remove="${i}">❌</span>
      </div>
    `).join("")}

    <div class="mt-3">Protein: ${protein}g</div>
  `;
}

// FITNESS
function renderFitness() {
  return exercises.map(e => `
    <div class="bg-white/10 p-3 mb-2 rounded">
      <div>${e.name}</div>
      <div class="text-sm text-gray-400">${e.reps}</div>
      <video controls class="w-full mt-2">
        <source src="${e.video}">
      </video>
    </div>
  `).join("");
}

// PROGRESS
function renderProgress() {
  const data = state.history.slice(-7);

  return `
    <div class="bg-white/10 p-4 rounded">
      <div class="flex h-32">
        ${Array(7).fill(0).map((_,i)=>{
          const val = data[i]?.progress || 0;
          return `
            <div class="flex-1 flex items-end justify-center">
              <div style="height:${val}%"
                class="bg-green-500 w-3 rounded"></div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

// NAVBAR
function renderNav() {
  return `
    <div class="fixed bottom-0 left-0 right-0 bg-black border-t flex text-center">
      <div class="nav flex-1 p-2" data-page="home">🏠</div>
      <div class="nav flex-1 p-2" data-page="meals">🍽</div>
      <div class="nav flex-1 p-2" data-page="fitness">🏋️</div>
      <div class="nav flex-1 p-2" data-page="progress">📊</div>
    </div>
  `;
}

// ---------- EVENTS (STABLE) ----------
function bindEvents() {
  app.onclick = (e) => {

    // NAV
    if (e.target.dataset.page) {
      state.page = e.target.dataset.page;
      save();
      render();
    }

    // HABIT
    if (e.target.dataset.habit) {
      const key = e.target.dataset.habit;
      const config = habitConfig[key];

      state.habits[key] = !state.habits[key];

      if (state.habits[key]) {
        state.score += config.points;
        state.stats[config.stat] += 2;
      } else {
        state.score -= config.points;
        state.stats[config.stat] -= 2;
      }

      save();
      render();
    }

    // ADD FOOD
    if (e.target.dataset.action === "addFood") {
      const input = document.getElementById("foodInput").value.toLowerCase();
      if (!foodDB[input]) return;

      const f = foodDB[input];

      if (f.type === "junk") state.score -= 10;

      state.foods.push({ name: input, p: f.p });
      save();
      render();
    }

    // REMOVE FOOD
    if (e.target.dataset.remove) {
      state.foods.splice(e.target.dataset.remove, 1);
      save();
      render();
    }
  };
}

render();
