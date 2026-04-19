const app = document.getElementById("app");

let today = new Date().toDateString();

let state = JSON.parse(localStorage.getItem("carely")) || {
  date: today,
  score: 0,
  streak: 0,
  history: [],
  page: "home",
  foods: [],
  stats: {
    body: 0,
    discipline: 0,
    grooming: 0,
    presence: 0,
    communication: 0
  },
  habits: {
    Workout: false,
    Steps: false,
    NoJunk: false,
    Grooming: false,
    Posture: false,
    Speaking: false
  }
};

function save() {
  localStorage.setItem("carely", JSON.stringify(state));
}

// RESET DAILY
if (state.date !== today) {
  const completed = Object.values(state.habits).filter(v => v).length;
  const percent = Math.round((completed / 6) * 100);

  state.history.push({ date: state.date, progress: percent });

  if (state.history.length > 30) state.history.shift();

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;

  Object.keys(state.habits).forEach(k => state.habits[k] = false);
}

// CONFIG
const habitConfig = {
  Workout: { points: 20, stat: "body" },
  Steps: { points: 10, stat: "body" },
  NoJunk: { points: 25, stat: "discipline" },
  Grooming: { points: 10, stat: "grooming" },
  Posture: { points: 10, stat: "presence" },
  Speaking: { points: 10, stat: "communication" }
};

// FOOD DB
const foodDB = {
  paneer: { p: 18, c: 2, f: 20, type: "protein" },
  tofu: { p: 8, c: 2, f: 4, type: "protein" },
  soya: { p: 25, c: 10, f: 1, type: "protein" },
  roti: { p: 3, c: 15, f: 1, type: "carb" },
  rice: { p: 2.5, c: 28, f: 0.3, type: "carb" },
  dal: { p: 9, c: 20, f: 1, type: "balanced" },
  curd: { p: 3, c: 4, f: 3, type: "balanced" },
  pizza: { p: 11, c: 33, f: 10, type: "junk" },
  burger: { p: 12, c: 30, f: 12, type: "junk" }
};

// RECIPES
const recipes = [
  {
    name: "Paneer Bhurji",
    time: "10 min",
    steps: ["Heat pan", "Add onion", "Add paneer", "Cook 5 mins"],
    video: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];

// EXERCISES
const exercises = [
  {
    name: "Incline Push-up",
    reps: "3 x 12",
    video: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    name: "Squats",
    reps: "3 x 15",
    video: "https://www.w3schools.com/html/movie.mp4"
  }
];

// NAV
function switchPage(page) {
  state.page = page;
  save();
  render();
}

// HABIT TOGGLE
function toggleHabit(habit) {
  const config = habitConfig[habit];

  state.habits[habit] = !state.habits[habit];

  if (state.habits[habit]) {
    state.score += config.points;
    state.stats[config.stat] += 2;
  } else {
    state.score -= config.points;
    state.stats[config.stat] -= 2;
  }

  save();
  render();
}

// FOOD FUNCTIONS
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
  document.getElementById("foodSearch").value = f;
  document.getElementById("suggestions").innerHTML = "";
}

function addFood() {
  const name = document.getElementById("foodSearch")?.value?.toLowerCase();
  const qty = parseInt(document.getElementById("qty")?.value) || 100;

  if (!foodDB[name]) return;

  const d = foodDB[name];
  const factor = qty / 100;

  if (d.type === "junk") {
    state.score -= 10;
  }

  state.foods.push({
    name,
    qty,
    p: Math.round(d.p * factor),
    c: Math.round(d.c * factor),
    f: Math.round(d.f * factor)
  });

  save();
  render();
}

function removeFood(i) {
  state.foods.splice(i, 1);
  save();
  render();
}

function totals() {
  return state.foods.reduce((a, f) => {
    a.p += f.p;
    a.c += f.c;
    a.f += f.f;
    return a;
  }, { p: 0, c: 0, f: 0 });
}

// RENDER
function render() {
  let content = "";

  // HOME
  if (state.page === "home") {
    content = `
      <div class="bg-white/10 p-4 rounded-2xl mb-4 text-center">
        <div class="text-xl text-green-400">${state.score} Score</div>
        <div class="text-sm text-gray-400">🔥 ${state.streak} day streak</div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        ${Object.keys(state.habits).map(h=>`
          <div onclick="toggleHabit('${h}')"
            class="p-4 rounded-2xl text-center ${
              state.habits[h]?'bg-green-500':'bg-white/10'
            }">
            ${h}
          </div>
        `).join("")}
      </div>
    `;
  }

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

        <div class="mt-2 font-bold">
          Protein: ${t.p}g | Carbs: ${t.c}g | Fat: ${t.f}g
        </div>
      </div>
    `;
  }

  // TRAINING
  if (state.page === "training") {
    content = `
      <div class="bg-white/10 p-4 rounded-2xl">
        ${exercises.map(e=>`
          <div class="mb-4">
            <div class="font-bold">${e.name} (${e.reps})</div>
            <video controls class="w-full mt-2 rounded">
              <source src="${e.video}" type="video/mp4">
            </video>
          </div>
        `).join("")}
      </div>
    `;
  }

  // RECIPES
  if (state.page === "recipes") {
    content = `
      <div class="bg-white/10 p-4 rounded-2xl">
        ${recipes.map(r=>`
          <div class="mb-4">
            <div class="font-bold">${r.name}</div>
            <div class="text-sm">${r.time}</div>
            <ul class="text-sm mt-2">
              ${r.steps.map(s=>`<li>- ${s}</li>`).join("")}
            </ul>
            <video controls class="w-full mt-2 rounded">
              <source src="${r.video}" type="video/mp4">
            </video>
          </div>
        `).join("")}
      </div>
    `;
  }

  // CHARACTER
  if (state.page === "character") {
    content = `
      <div class="bg-white/10 p-4 rounded-2xl">
        ${Object.entries(state.stats).map(([k,v])=>`
          <div class="mb-3">
            <div>${k.toUpperCase()}</div>
            <div class="bg-gray-700 h-2 rounded">
              <div class="bg-green-500 h-2 rounded" style="width:${v}%"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // STATS
  if (state.page === "stats") {
    const data = state.history.slice(-7);

    content = `
      <div class="bg-white/10 p-4 rounded-2xl">
        <div class="flex h-32">
          ${Array(7).fill(0).map((_,i)=>{
            const val = data[i]?.progress || 0;
            return `<div class="flex-1 flex items-end justify-center">
              <div style="height:${val||10}%"
                class="${val?'bg-green-500':'bg-gray-700'} w-4 rounded">
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  app.innerHTML = `
    <div class="p-4 pb-28 min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">

      <h1 class="text-center text-2xl text-green-400 mb-4">Carely</h1>

      ${content}

      <div class="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 flex text-center">
        <div onclick="switchPage('home')" class="flex-1">🏠</div>
        <div onclick="switchPage('food')" class="flex-1">🍽</div>
        <div onclick="switchPage('training')" class="flex-1">🏋️</div>
        <div onclick="switchPage('recipes')" class="flex-1">🍳</div>
        <div onclick="switchPage('character')" class="flex-1">🧬</div>
        <div onclick="switchPage('stats')" class="flex-1">📊</div>
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

render();
