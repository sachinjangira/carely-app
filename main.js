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

const exercises = [
  { name: "Push-up", video: "https://www.w3schools.com/html/mov_bbb.mp4" }
];

const recipes = [
  { name: "Paneer Bhurji", video: "https://www.w3schools.com/html/mov_bbb.mp4" }
];

// MAIN RENDER
function render() {
  let content = "";

  // HOME
  if (state.page === "home") {
    content = `
      <div class="bg-white/10 p-4 rounded mb-4">
        <div>Score: ${state.score}</div>
        <div>🔥 Streak: ${state.streak}</div>
      </div>

      ${Object.keys(state.habits).map(h=>`
        <div class="habit p-3 mb-2 rounded ${
          state.habits[h] ? 'bg-green-500/30' : 'bg-white/10'
        }" data-habit="${h}">
          ${h} (+${habitConfig[h].points})
        </div>
      `).join("")}
    `;
  }

  // TRAINING
  if (state.page === "training") {
    content = exercises.map(e=>`
      <div class="bg-white/10 p-3 mb-2 rounded">
        ${e.name}
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
        ${r.name}
        <video controls class="w-full mt-2">
          <source src="${r.video}">
        </video>
      </div>
    `).join("");
  }

  // CHARACTER
  if (state.page === "character") {
    content = Object.entries(state.stats).map(([k,v])=>`
      <div class="bg-white/10 p-2 mb-2">
        ${k}: ${v}
      </div>
    `).join("");
  }

  // STATS
  if (state.page === "stats") {
    content = `
      <div class="bg-white/10 p-4">
        History: ${state.history.length} days
      </div>
    `;
  }

  // FOOD
  if (state.page === "food") {
    content = `<div>Food page (keep simple for now)</div>`;
  }

  app.innerHTML = `
    <div class="p-4 pb-20 text-white">

      ${content}

      <div class="fixed bottom-0 left-0 right-0 bg-black flex border-t">

        <div class="nav flex-1 p-2 text-center" data-page="home">🏠</div>
        <div class="nav flex-1 p-2 text-center" data-page="food">🍽</div>
        <div class="nav flex-1 p-2 text-center" data-page="training">🏋️</div>
        <div class="nav flex-1 p-2 text-center" data-page="recipes">🍳</div>
        <div class="nav flex-1 p-2 text-center" data-page="character">🧬</div>
        <div class="nav flex-1 p-2 text-center" data-page="stats">📊</div>

      </div>
    </div>
  `;

  bindEvents();
}

// 🔥 EVENT BINDING (THIS FIXES YOUR ISSUE)
function bindEvents() {
  document.querySelectorAll(".nav").forEach(el => {
    el.onclick = () => {
      state.page = el.dataset.page;
      save();
      render();
    };
  });

  document.querySelectorAll(".habit").forEach(el => {
    el.onclick = () => {
      const h = el.dataset.habit;
      const config = habitConfig[h];

      state.habits[h] = !state.habits[h];

      if (state.habits[h]) {
        state.score += config.points;
      } else {
        state.score -= config.points;
      }

      save();
      render();
    };
  });
}

render();
