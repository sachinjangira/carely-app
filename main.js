const app = document.getElementById("app");

let today = new Date().toDateString();

let state = JSON.parse(localStorage.getItem("carely")) || {
  date: today,
  score: 0,
  streak: 0,
  history: [],
  page: "home",
  weight: [],
  foods: [],
  meals: [],
  currentMeal: [],
  habits: {
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    Protein: false,
    Workout: false,
    Steps: false,
  }
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
  state.currentMeal = [];
}

// FOOD DB
const foodDB = {
  paneer: { p: 18, c: 2, f: 20, cal: 260 },
  milk: { p: 3.5, c: 5, f: 3.5, cal: 60 },
  curd: { p: 3, c: 4, f: 3, cal: 50 },
  roti: { p: 3, c: 15, f: 1, cal: 80 },
  rice: { p: 2.5, c: 28, f: 0.3, cal: 130 },
  dal: { p: 9, c: 20, f: 1, cal: 120 },
  soya: { p: 25, c: 10, f: 1, cal: 170 },
  tofu: { p: 8, c: 2, f: 4, cal: 80 },
  pizza: { p: 11, c: 33, f: 10, cal: 285 },
  burger: { p: 12, c: 30, f: 12, cal: 295 }
};

// NAV
function switchPage(page) {
  state.page = page;
  save();
  render();
}

// HABITS
function toggleHabit(habit) {
  state.habits[habit] = !state.habits[habit];
  state.score += state.habits[habit] ? 5 : -5;
  save();
  render();
}

// FOOD FUNCTIONS (SAFE)
function showSuggestions(value) {
  const el = document.getElementById("suggestions");
  if (!el) return;

  const list = Object.keys(foodDB)
    .filter(f => f.includes(value.toLowerCase()))
    .slice(0, 5);

  el.innerHTML = list.map(f =>
    `<div onclick="selectFood('${f}')" class="bg-gray-800 p-2 mb-1 rounded">${f}</div>`
  ).join("");
}

function selectFood(f) {
  const input = document.getElementById("foodSearch");
  const sug = document.getElementById("suggestions");

  if (input) input.value = f;
  if (sug) sug.innerHTML = "";
}

function addFood() {
  const name = document.getElementById("foodSearch")?.value?.toLowerCase();
  const qty = parseInt(document.getElementById("qty")?.value) || 100;

  if (!foodDB[name]) return;

  const d = foodDB[name];
  const factor = qty / 100;

  state.foods.push({
    name,
    qty,
    p: Math.round(d.p * factor),
    c: Math.round(d.c * factor),
    f: Math.round(d.f * factor),
    cal: Math.round(d.cal * factor)
  });

  save();
  render();
}

function removeFood(i) {
  state.foods.splice(i, 1);
  save();
  render();
}

// TOTALS
function totals() {
  return state.foods.reduce((a, f) => {
    a.p += f.p;
    a.c += f.c;
    a.f += f.f;
    return a;
  }, { p: 0, c: 0, f: 0 });
}

// WEIGHT
function addWeight() {
  const w = parseFloat(document.getElementById("weight")?.value);
  if (!w) return;
  state.weight.push(w);
  save();
  render();
}

// RENDER
function render() {
  let content = "";

  // FOOD
  if (state.page === "food") {
    const t = totals();

    content = `
      <div class="bg-white/10 p-4 rounded-2xl">

        <input id="foodSearch" oninput="showSuggestions(this.value)"
          placeholder="Search food"
          class="text-black p-2 w-full mb-2 rounded"/>

        <div id="suggestions"></div>

        <input id="qty" placeholder="grams"
          class="text-black p-2 w-full mb-2 rounded"/>

        <button onclick="addFood()" class="bg-blue-500 w-full p-2 rounded mb-3">Add</button>

        ${state.foods.map((f,i)=>`
          <div class="bg-black/30 p-2 mb-2 rounded flex justify-between">
            ${f.name} ${f.qty}g
            <span onclick="removeFood(${i})">❌</span>
          </div>
        `).join("")}

        <div>Protein: ${t.p}g | Carbs: ${t.c}g | Fat: ${t.f}g</div>
      </div>
    `;
  }

  // STATS
  if (state.page === "stats") {
    const data = state.history.slice(-7);

    content = `
      <div class="bg-white/10 p-4 rounded-2xl mb-4">
        <div class="flex h-32">
          ${Array(7).fill(0).map((_,i)=>{
            const val = data[i]?.progress || 0;
            return `<div class="flex-1">
              <div style="height:${val||10}%" class="${val?'bg-green-500':'bg-gray-700'} w-4"></div>
            </div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  // HOME
  if (state.page === "home") {
    content = `
      <div class="grid grid-cols-2 gap-2">
        ${Object.keys(state.habits).map(h=>`
          <div onclick="toggleHabit('${h}')"
            class="p-3 rounded ${state.habits[h]?'bg-green-500':'bg-gray-700'} text-center">
            ${h}
          </div>
        `).join("")}
      </div>
    `;
  }

  app.innerHTML = `
    <div class="p-4 pb-28 min-h-screen bg-black text-white">

      <h1 class="text-center text-2xl text-green-400 mb-4">Carely</h1>

      ${content}

      <div class="fixed bottom-0 left-0 right-0 bg-black flex">
        <div onclick="switchPage('home')" style="flex:1;text-align:center">🏠</div>
        <div onclick="switchPage('food')" style="flex:1;text-align:center">🍽</div>
        <div onclick="switchPage('stats')" style="flex:1;text-align:center">📊</div>
      </div>

    </div>
  `;
}

window.switchPage = switchPage;
window.toggleHabit = toggleHabit;
window.showSuggestions = showSuggestions;
window.selectFood = selectFood;
window.addFood = addFood;
window.removeFood = removeFood;
window.addWeight = addWeight;

render();
