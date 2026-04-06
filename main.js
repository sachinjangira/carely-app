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
  weight: [],
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
    progress: percent,
    score: state.score
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

function getLast7Days() {
  return state.history.slice(-7);
}

// Weekly stats
function getStats() {
  const last7 = getLast7Days();
  if (last7.length === 0) return null;

  let avg = Math.round(last7.reduce((a, b) => a + b.progress, 0) / last7.length);
  let best = Math.max(...last7.map(d => d.progress));
  let worst = Math.min(...last7.map(d => d.progress));

  return { avg, best, worst };
}

// Smart feedback
function getFeedback() {
  const progress = getProgress();

  if (progress === 100) return "🔥 Perfect day!";
  if (progress >= 80) return "💪 Strong consistency";
  if (progress >= 50) return "⚠️ Can improve discipline";
  return "🚨 Focus — you're slipping";
}

// Food
function addFood(value) {
  if (!value) return;

  const db = {
    paneer: { p: 18, c: 2, f: 20, cal: 260 },
    milk: { p: 8, c: 12, f: 8, cal: 150 },
    curd: { p: 4, c: 5, f: 4, cal: 60 },
    soya: { p: 25, c: 10, f: 1, cal: 170 }
  };

  let key = value.toLowerCase().split(" ")[0];
  let data = db[key] || { p: 0, c: 0, f: 0, cal: 0 };

  state.foods.push({ name: value, ...data });

  save();
  render();
}

function getTotals() {
  return state.foods.reduce((acc, f) => {
    acc.p += f.p;
    acc.c += f.c;
    acc.f += f.f;
    acc.cal += f.cal;
    return acc;
  }, { p: 0, c: 0, f: 0, cal: 0 });
}

function render() {
  const progress = getProgress();
  const last7 = getLast7Days();
  const stats = getStats();
  const totals = getTotals();

  app.innerHTML = `
  <div class="p-4">

    <h1 class="text-2xl font-bold mb-2">Carely</h1>

    <div class="flex justify-between mb-4">
      <div>🔥 Streak: ${state.streak}</div>
      <div>🏆 Score: ${state.score}</div>
    </div>

    <div class="mb-2 text-lg">${getFeedback()}</div>

    <div class="mb-2">Today: ${progress}%</div>

    <div class="w-full bg-gray-700 h-3 rounded mb-4">
      <div class="bg-green-400 h-3 rounded transition-all"
        style="width:${progress}%"></div>
    </div>

    <!-- Graph -->
    <div class="flex items-end gap-2 h-24 mb-6">
      ${last7.map(d => `
        <div class="flex-1 bg-green-500"
          style="height:${d.progress}%"></div>
      `).join("")}
    </div>

    <!-- Weekly Stats -->
    ${stats ? `
      <div class="mb-4 text-sm">
        Avg: ${stats.avg}% | Best: ${stats.best}% | Worst: ${stats.worst}%
      </div>
    ` : ""}

    <!-- Habits -->
    <div class="grid grid-cols-2 gap-2 mb-6">
      ${habitList.map(h => `
        <button onclick="toggleHabit('${h}')"
          class="p-3 rounded border ${
            state.habits[h] ? 'bg-green-600' : ''
          }">
          ${h}
        </button>
      `).join("")}
    </div>

    <!-- Food -->
    <div class="mb-6">
      <h2>🍽️ Food</h2>
      <input id="foodInput" class="text-black p-2 w-full mb-2" placeholder="paneer 100g"/>
      <button onclick="addFood(document.getElementById('foodInput').value)"
        class="bg-blue-500 w-full
