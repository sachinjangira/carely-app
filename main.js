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

// -------- DAILY RESET --------
if (state.date !== today) {
  const completed = Object.values(state.habits).filter(v => v).length;
  const percent = Math.round((completed / 6) * 100);

  state.history.push({
    date: state.date,
    progress: percent
  });

  if (state.history.length > 30) state.history.shift();

  if (percent >= 80) state.streak += 1;
  else state.streak = 0;

  state.date = today;
  state.habits = {
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    Protein: false,
    Workout: false,
    Steps: false,
  };
}

const habitList = Object.keys(state.habits);

// -------- NAVIGATION --------
function switchPage(page) {
  state.page = page;
  save();
  render();
}

// -------- HABITS --------
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

// -------- SMART MACROS --------
function parseFood(input) {
  const db = {
    paneer: { p: 18, c: 2, f: 20, cal: 260, base: 100 },
    milk: { p: 8, c: 12, f: 8, cal: 150, base: 250 },
    curd: { p: 4, c: 5, f: 4, cal: 60, base: 100 },
    soya: { p: 25, c: 10, f: 1, cal: 170, base: 50 }
  };

  let parts = input.toLowerCase().split(" ");
  let food = parts[0];
  let quantity = parts[1] ? parseInt(parts[1]) || 1 : 1;

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

  let parsed = parseFood(value);
  state.foods.push(parsed);

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

// -------- STATS --------
function getLast7Days() {
  return state.history.slice(-7);
}

function getStats() {
  const last7 = getLast7Days();
  if (last7.length === 0) return null;

  let avg = Math.round(last7.reduce((a, b) => a + b.progress, 0) / last7.length);
  let best = Math.max(...last7.map(d => d.progress));
  let worst = Math.min(...last7.map(d => d.progress));

  return { avg, best, worst };
}

function getFeedback() {
  const progress = getProgress();

  if (progress === 100) return "🔥 Perfect day!";
  if (progress >= 80) return "💪 Strong consistency";
  if (progress >= 50) return "⚠️ Keep pushing";
  return "🚨 Focus — you're slipping";
}

// -------- RENDER --------
function render() {
  const progress = getProgress();
  const totals = getTotals();
  const last7 = getLast7Days();
  const stats = getStats();

  let content = "";

  // HOME
  if (state.page === "home") {
    content = `
      <div class="text-center mb-4">${getFeedback()}</div>

      <div class="text-center text-4xl font-bold text-green-400 mb-6">
        ${progress}%
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        ${habitList.map(h => `
          <button onclick="toggleHabit('${h}')"
            class="p-4 rounded-2xl border transition ${
              state.habits[h] ? 'bg-green-600 scale-95' : 'bg-gray-800'
            }">
            ${h}
          </button>
        `).join("")}
      </div>
    `;
  }

  // FOOD
  if (state.page === "food") {
    content = `
      <h2 class="mb-2 text-lg">🍽️ Food</h2>

      <input id="foodInput" class="text-black p-2 w-full mb-2 rounded" placeholder="paneer 200g"/>

      <button onclick="addFood(document.getElementById('foodInput').value)"
        class="bg-blue-500 w-full p-2 rounded mb-2">
        Add
      </button>

      <button onclick="clearFood()"
        class="bg-red-500 w-full p-2 rounded mb-3">
        Clear Food
      </button>

      <div class="text-sm">
        ${state.foods.map(f => `
          <div>
            ${f.name} → 
            Protein: ${f.p}g | 
            Carbs: ${f.c}g | 
            Fat: ${f.f}g | 
            Calories: ${f.cal}
          </div>
        `).join("")}
      </div>

      <div class="mt-3 font-semibold">
        Total → 
        Protein: ${totals.p}g | 
        Carbs: ${totals.c}g | 
        Fat: ${totals.f}g | 
        Calories: ${totals.cal}
      </div>
    `;
  }

  // STATS
  if (state.page === "stats") {
    content = `
      <h2 class="mb-3 text-lg">📊 Stats</h2>

      <div class="flex items-end gap-2 h-24 mb-4">
        ${last7.map(d => `
          <div class="flex-1 bg-green-500"
            style="height:${d.progress}%"></div>
        `).join("")}
      </div>

      ${stats ? `
        <div>
          Avg: ${stats.avg}% | Best: ${stats.best}% | Worst: ${stats.worst}%
        </div>
      ` : "No data yet"}
    `;
  }

  app.innerHTML = `
  <div class="p-4 pb-20 min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">

    <h1 class="text-3xl font-bold text-center mb-4 text-green-400">
      Carely
    </h1>

    <div class="flex justify-between mb-4 text-sm">
      <div>🔥 ${state.streak}</div>
      <div>🏆 ${state.score}</div>
    </div>

    ${content}

    <!-- Bottom Nav -->
    <div class="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around p-3 border-t border-gray-700">

      <button onclick="switchPage('home')" class="${state.page==='home'?'text-green-400':''}">
        Home
      </button>

      <button onclick="switchPage('food')" class="${state.page==='food'?'text-green-400':''}">
        Food
      </button>

      <button onclick="switchPage('stats')" class="${state.page==='stats'?'text-green-400':''}">
        Stats
      </button>

    </div>

  </div>
  `;
}

window.toggleHabit = toggleHabit;
window.addFood = addFood;
window.clearFood = clearFood;
window.switchPage = switchPage;

render();
