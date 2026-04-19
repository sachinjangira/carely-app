const app = document.getElementById("app");

let today = new Date().toDateString();

let defaultState = {
  date: today,
  score: 0,
  streak: 0,
  history: [],
  page: "home",
  foods: [],
  stats: {
    body: 10,
    discipline: 10,
    grooming: 10,
    presence: 10,
    communication: 10
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

let state = JSON.parse(localStorage.getItem("carely")) || defaultState;

function save() {
  localStorage.setItem("carely", JSON.stringify(state));
}

// RESET
if (state.date !== today) {
  const completed = Object.values(state.habits).filter(v => v).length;
  const percent = Math.round((completed / 6) * 100);

  state.history.push({ date: state.date, progress: percent });
  if (state.history.length > 30) state.history.shift();

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;

  Object.keys(state.habits).forEach(k => state.habits[k] = false);
  save();
}

const habitConfig = {
  Workout: { points: 20, stat: "body" },
  Steps: { points: 10, stat: "body" },
  NoJunk: { points: 25, stat: "discipline" },
  Grooming: { points: 10, stat: "grooming" },
  Posture: { points: 10, stat: "presence" },
  Speaking: { points: 10, stat: "communication" }
};

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

const exercises = [
  { name: "Incline Push-up", reps: "3 x 12", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { name: "Squats", reps: "3 x 15", video: "https://www.w3schools.com/html/movie.mp4" }
];

const recipes = [
  {
    name: "Paneer Bhurji",
    time: "10 min",
    steps: ["Heat pan", "Add onion", "Add paneer", "Cook 5 mins"],
    video: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];

// SAFE NAV
function switchPage(page) {
  state.page = page;
  save();
  render();
}

// TOGGLE
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

// FOOD
function showSuggestions(value) {
  const el = document.getElementById("suggestions");
  if (!el) return;

  const list = Object.keys(foodDB)
    .filter(f => f.includes(value.toLowerCase()))
    .slice(0, 5);

  el.innerHTML = list.map(f =>
    `<div onclick="selectFood('${f}')" class="p-2 bg-gray-800 rounded mb-1">${f}</div>`
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

  if (foodDB[name].type === "junk") {
    state.score -= 10;
  }

  const d = foodDB[name];
  const factor = qty / 100;

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
    const progress = Math.min(state.score, 100);

    content = `
      <div class="bg-white/10 p-4 rounded-2xl mb-4">
        <div class="flex justify-between">
          <div>Score</div>
          <div class="text-green-400">${state.score}</div>
        </div>

        <div class="w-full bg-gray-700 h-2 rounded mt-2">
          <div class="bg-green-500 h-2 rounded" style="width:${progress}%"></div>
        </div>

        <div class="text-sm mt-2">🔥 ${state.streak} day streak</div>
      </div>

      ${Object.keys(state.habits).map(h=>`
        <div onclick="toggleHabit('${h}')"
          class="p-3 mb-2 rounded-xl ${
            state.habits[h] ? 'bg-green-500/30' : 'bg-white/10'
          } flex justify-between">
          ${h}
          <span>+${habitConfig[h].points}</span>
        </div>
      `).join("")}
    `;
  }

  // CHARACTER
  if (state.page === "character") {
    content = Object.entries(state.stats).map(([k,v])=>`
      <div class="bg-white/10 p-3 mb-2 rounded">
        <div>${k}</div>
        <div class="bg-gray-700 h-2 mt-1">
          <div class="bg-green-500 h-2" style="width:${v}%"></div>
        </div>
      </div>
    `).join("");
  }

  // STATS
  if (state.page === "stats") {
    const data = state.history.slice(-7);

    content = `
      <div class="bg-white/10 p-4 rounded">
        <div class="flex h-32">
          ${Array(7).fill(0).map((_,i)=>{
            const val = data[i]?.progress || 0;
            return `<div class="flex-1 flex items-end justify-center">
              <div style="height:${val}%"
                class="bg-green-500 w-4">
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  // TRAINING
  if (state.page === "training") {
    content = exercises.map(e=>`
      <div class="bg-white/10 p-3 mb-2 rounded">
        <div>${e.name}</div>
        <video controls class="w-full mt-2">
          <source src="${e.video}">
        </video>
      </div>
    `).join("");
  }

  // RECIPES
  if (state.page === "recipes") {
    content = recipes.map(r=>`
      <div class="bg-white/10 p-3 mb-2 rounded">
        <div>${r.name}</div>
        <video controls class="w-full mt-2">
          <source src="${r.video}">
        </video>
      </div>
    `).join("");
  }

  // FOOD
  if (state.page === "food") {
    const t = totals();

    content = `
      <input id="foodSearch" oninput="showSuggestions(this.value)" placeholder="Search"
        class="text-black p-2 w-full mb-2"/>

      <div id="suggestions"></div>

      <input id="qty" placeholder="grams"
        class="text-black p-2 w-full mb-2"/>

      <button onclick="addFood()" class="bg-green-500 w-full p-2 mb-2">Add</button>

      ${state.foods.map((f,i)=>`
        <div class="flex justify-between bg-white/10 p-2 mb-1">
          ${f.name}
          <span onclick="removeFood(${i})">❌</span>
        </div>
      `).join("")}

      <div>Protein: ${t.p}</div>
    `;
  }

  app.innerHTML = `
    <div class="p-4 pb-24 bg-black text-white min-h-screen">

      ${content}

      <div class="fixed bottom-0 left-0 right-0 bg-black flex text-center border-t">
        <div onclick="switchPage('home')" class="flex-1 p-2">🏠</div>
        <div onclick="switchPage('food')" class="flex-1 p-2">🍽</div>
        <div onclick="switchPage('training')" class="flex-1 p-2">🏋️</div>
        <div onclick="switchPage('recipes')" class="flex-1 p-2">🍳</div>
        <div onclick="switchPage('character')" class="flex-1 p-2">🧬</div>
        <div onclick="switchPage('stats')" class="flex-1 p-2">📊</div>
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
