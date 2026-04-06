const app = document.getElementById("app");

let today = new Date().toDateString();

let state = JSON.parse(localStorage.getItem("carely")) || {
  date: today,
  score: 0,
  streak: 0,
  history: [],
  page: "home",
  habits: {
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    Protein: false,
    Workout: false,
    Steps: false,
  },
  foods: []
};

function save() {
  localStorage.setItem("carely", JSON.stringify(state));
}

// RESET
if (state.date !== today) {
  const completed = Object.values(state.habits).filter(v => v).length;
  const percent = Math.round((completed / 6) * 100);

  state.history.push({ date: state.date, progress: percent });

  if (state.history.length > 30) state.history.shift();

  state.streak = percent >= 80 ? state.streak + 1 : 0;

  state.date = today;
  Object.keys(state.habits).forEach(k => state.habits[k] = false);
}

const habitList = Object.keys(state.habits);

// NAV
function switchPage(page) {
  state.page = page;
  save();
  render();
}

// HABITS
function toggleHabit(habit) {
  if (!state.habits[habit]) {
    state.habits[habit] = true;
    state.score += 5;
  } else {
    state.habits[habit] = false;
    state.score -= 5;
  }
  save();
  render();
}

function getProgress() {
  const done = habitList.filter(h => state.habits[h]).length;
  return Math.round((done / habitList.length) * 100);
}

// FEEDBACK (RESTORED)
function getFeedback() {
  const progress = getProgress();

  if (progress === 100) return "🔥 Perfect day!";
  if (progress >= 80) return "💪 Strong consistency";
  if (progress >= 50) return "⚠️ Keep pushing";
  return "🚨 Focus — you're slipping";
}

// FOOD
function parseFood(input) {
  const db = {
    paneer: { p: 18, c: 2, f: 20, cal: 260, base: 100 },
    milk: { p: 8, c: 12, f: 8, cal: 150, base: 250 },
    curd: { p: 4, c: 5, f: 4, cal: 60, base: 100 },
    soya: { p: 25, c: 10, f: 1, cal: 170, base: 50 }
  };

  let [food, qty] = input.toLowerCase().split(" ");
  let quantity = parseInt(qty) || 1;

  let data = db[food];
  if (!data) return { name: input, p: 0, c: 0, f: 0, cal: 0 };

  let factor = quantity / data.base;

  return {
    name: input,
    p: Math.round(data.p * factor),
    c: Math.round(data.c * factor),
    f: Math.round(data.f * factor),
    cal: Math.round(data.cal * factor)
  };
}

function addFood(value) {
  if (!value) return;
  state.foods.push(parseFood(value));
  document.getElementById("foodInput").value = "";
  save();
  render();
}

function clearFood() {
  state.foods = [];
  save();
  render();
}

function getTotals() {
  return state.foods.reduce((acc, f) => {
    acc.p += f.p || 0;
    acc.c += f.c || 0;
    acc.f += f.f || 0;
    acc.cal += f.cal || 0;
    return acc;
  }, { p: 0, c: 0, f: 0, cal: 0 });
}

// RENDER
function render() {
  const progress = getProgress();
  const totals = getTotals();

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  let content = "";

  // HOME
  if (state.page === "home") {
    content = `
      <div class="flex justify-center mb-4 relative">
        <svg width="120" height="120">
          <circle cx="60" cy="60" r="${radius}" stroke="#333" stroke-width="10" fill="none"/>
          <circle cx="60" cy="60" r="${radius}" stroke="#f97316" stroke-width="10"
            fill="none"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 60 60)"/>
        </svg>
        <div class="absolute top-10 text-xl font-bold">${progress}%</div>
      </div>

      <!-- FEEDBACK ADDED -->
      <div class="text-center mb-4 text-orange-400 font-medium">
        ${getFeedback()}
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        ${habitList.map(h => `
          <div onclick="toggleHabit('${h}')"
            class="p-4 rounded-2xl text-center ${
              state.habits[h] ? 'bg-green-600' : 'bg-gray-800'
            }">
            ${h}
          </div>
        `).join("")}
      </div>
    `;
  }

  // FOOD
  if (state.page === "food") {
    content = `
      <input id="foodInput" class="text-black p-3 w-full mb-3 rounded" placeholder="paneer 200g"/>

      <button onclick="addFood(document.getElementById('foodInput').value)"
        class="bg-blue-500 w-full p-3 rounded mb-2">Add</button>

      <button onclick="clearFood()"
        class="bg-red-500 w-full p-3 rounded mb-3">Clear</button>

      ${state.foods.map(f => `
        <div class="bg-gray-800 p-3 mb-2 rounded">
          ${f.name}<br/>
          Protein: ${f.p}g | Carbs: ${f.c}g | Fat: ${f.f}g
        </div>
      `).join("")}

      <div class="mt-3 font-bold">
        Protein: ${totals.p}g
      </div>
    `;
  }

  // STATS
  if (state.page === "stats") {
    const last7 = state.history.slice(-7);

    content = `
      <div class="flex items-end gap-2 h-24">
        ${last7.map(d => `
          <div class="flex-1 bg-orange-500"
            style="height:${d.progress}%"></div>
        `).join("")}
      </div>
    `;
  }

  app.innerHTML = `
    <div class="p-4 pb-20 min-h-screen bg-black text-white">

      <h1 class="text-3xl text-center mb-4 text-orange-400">Carely</h1>

      <div class="flex justify-between mb-4">
        <div>🔥 ${state.streak}</div>
        <div>🏆 ${state.score}</div>
      </div>

      ${content}

      <div class="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around p-3">
        <button onclick="switchPage('home')">🏠</button>
        <button onclick="switchPage('food')">🍽️</button>
        <button onclick="switchPage('stats')">📊</button>
      </div>

    </div>
  `;
}

window.toggleHabit = toggleHabit;
window.addFood = addFood;
window.clearFood = clearFood;
window.switchPage = switchPage;

render();
