const app = document.getElementById("app");

let state = {
  score: 0,
  habits: {
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    Protein: false,
    Workout: false,
    Steps: false,
  },
  weight: [],
  foods: []
};

const habitList = Object.keys(state.habits);

// Toggle habit
function toggleHabit(habit) {
  state.habits[habit] = !state.habits[habit];

  if (state.habits[habit]) {
    state.score += 5;
  } else {
    state.score -= 3;
  }

  render();
}

// Progress %
function getProgress() {
  const done = habitList.filter(h => state.habits[h]).length;
  return Math.round((done / habitList.length) * 100);
}

// Add weight
function addWeight(value) {
  if (!value) return;
  state.weight.push(value);
  render();
}

// Add food (simple macros)
function addFood(value) {
  if (!value) return;

  const db = {
    "paneer": { p: 18, c: 2, f: 20, cal: 260 },
    "milk": { p: 8, c: 12, f: 8, cal: 150 },
    "curd": { p: 4, c: 5, f: 4, cal: 60 },
    "soya": { p: 25, c: 10, f: 1, cal: 170 }
  };

  let key = value.toLowerCase().split(" ")[0];
  let data = db[key] || { p: 0, c: 0, f: 0, cal: 0 };

  state.foods.push({ name: value, ...data });

  render();
}

// Total macros
function getTotals() {
  return state.foods.reduce((acc, f) => {
    acc.p += f.p;
    acc.c += f.c;
    acc.f += f.f;
    acc.cal += f.cal;
    return acc;
  }, { p: 0, c: 0, f: 0, cal: 0 });
}

// Render UI
function render() {
  const progress = getProgress();
  const totals = getTotals();

  app.innerHTML = `
  <div class="p-4">

    <h1 class="text-2xl font-bold mb-2">Carely</h1>

    <div class="flex justify-between mb-4">
      <div>🔥 Progress: ${progress}%</div>
      <div>🏆 Score: ${state.score}</div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-gray-700 h-3 rounded mb-4">
      <div class="bg-green-400 h-3 rounded" style="width:${progress}%"></div>
    </div>

    <!-- Habits -->
    <div class="grid grid-cols-2 gap-2 mb-6">
      ${habitList.map(h => `
        <button onclick="toggleHabit('${h}')"
          class="p-3 rounded border ${state.habits[h] ? 'bg-green-600' : ''}">
          ${h}
        </button>
      `).join("")}
    </div>

    <!-- Food Section -->
    <div class="mb-6">
      <h2 class="text-lg mb-2">🍽️ Food</h2>
      <input id="foodInput" placeholder="e.g paneer 100g"
        class="text-black p-2 w-full rounded mb-2"/>

      <button onclick="addFood(document.getElementById('foodInput').value)"
        class="w-full bg-blue-500 p-2 rounded">
        Add Food
      </button>

      <div class="text-sm mt-2">
        ${state.foods.map(f => `
          <div>${f.name} → P:${f.p} C:${f.c} F:${f.f}</div>
        `).join("")}
      </div>

      <div class="mt-2 font-semibold">
        Total → P:${totals.p} C:${totals.c} F:${totals.f} Cal:${totals.cal}
      </div>
    </div>

    <!-- Weight Tracker -->
    <div>
      <h2 class="text-lg mb-2">⚖️ Weight</h2>
      <input id="weightInput" placeholder="Enter weight"
        class="text-black p-2 w-full rounded mb-2"/>

      <button onclick="addWeight(document.getElementById('weightInput').value)"
        class="w-full bg-purple-500 p-2 rounded">
        Add Weight
      </button>

      <div class="text-sm mt-2">
        ${state.weight.join(" → ")}
      </div>
    </div>

  </div>
  `;
}

// expose functions
window.toggleHabit = toggleHabit;
window.addFood = addFood;
window.addWeight = addWeight;

render();
