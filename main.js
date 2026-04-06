const app = document.getElementById("app");

let today = new Date().toDateString();

let state = JSON.parse(localStorage.getItem("carely")) || {
  date: today,
  score: 0,
  streak: 0,
  history: [],
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

// Daily reset
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

function toggleHabit(habit) {
  state.habits[habit] = !state.habits[habit];

  if (state.habits[habit]) state.score += 5;
  else state.score -= 3;

  save();
  render();
}

function getProgress() {
  const done = habitList.filter(h => state.habits[h]).length;
  return Math.round((done / habitList.length) * 100);
}

// Smart macros
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

// UI helpers
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

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  app.innerHTML = `
  <div class="p-4">

    <h1 class="text-2xl font-bold mb-4">Carely</h1>

    <div class="flex justify-between mb-4">
      <div>🔥 ${state.streak}</div>
      <div>🏆 ${state.score}</div>
    </div>

    <!-- Circular Progress -->
    <div class="flex justify-center mb-4">
      <svg width="120" height="120">
        <circle cx="60" cy="60" r="${radius}" stroke="#444" stroke-width="10" fill="none"/>
        <circle cx="60" cy="60" r="${radius}" stroke="#22c55e" stroke-width="10" fill="none"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          stroke-linecap="round"
          transform="rotate(-90 60 60)"/>
      </svg>
      <div class="absolute mt-10 text-lg">${progress}%</div>
    </div>

    <div class="text-center mb-4">${getFeedback()}</div>

    <!-- Habits -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      ${habitList.map(h => `
        <button onclick="toggleHabit('${h}')"
          class="p-3 rounded-xl border ${
            state.habits[h] ? 'bg-green-600' : ''
          }">
          ${h}
        </button>
      `).join("")}
    </div>

    <!-- Food -->
    <div>
      <h2 class="mb-2">🍽️ Food</h2>

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
          <div class="mb-1">
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
    </div>

  </div>
  `;
}

window.toggleHabit = toggleHabit;
window.addFood = addFood;
window.clearFood = clearFood;

render();
