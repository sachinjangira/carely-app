const app = document.getElementById("app");

const todayKey = new Date().toISOString().slice(0,10); // YYYY-MM-DD

// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem("carely_v5")) || {
  date: todayKey,
  page: "home",
  score: 0,          // 0–100 daily XP
  streak: 0,
  shield: 1,         // streak protection (1 per day)
  foods: [],
  history: [],       // [{date:'YYYY-MM-DD', score: 0–100}]
  habits: {
    workout: false,
    steps: false,
    diet: false,
    grooming: false,
    posture: false
  }
};

function save(){ localStorage.setItem("carely_v5", JSON.stringify(state)); }

// ---------- DAILY RESET ----------
function finalizeYesterday(){
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = Math.round((done/5)*100);

  // push yesterday record
  state.history.push({ date: state.date, score: percent });
  if (state.history.length > 90) state.history.shift();

  // streak logic with shield
  if (percent >= 70) {
    state.streak += 1;
  } else if (state.shield > 0) {
    state.shield -= 1; // consume shield instead of breaking streak
    toast("🛡️ Streak saved with shield");
  } else {
    state.streak = 0;
  }
}

if (state.date !== todayKey){
  finalizeYesterday();
  state.date = todayKey;
  state.score = 0;
  state.foods = [];
  state.shield = 1; // reset daily shield
  Object.keys(state.habits).forEach(k => state.habits[k] = false);
  save();
}

// ---------- CONFIG ----------
const habits = {
  workout:  { label: "Workout",        points: 20 },
  steps:    { label: "8k Steps",       points: 10 },
  diet:     { label: "No Junk Food",   points: 25 },
  grooming: { label: "Grooming",       points: 10 },
  posture:  { label: "Posture",        points: 10 }
};

const focus = ["diet","workout","posture"];

// ---------- HELPERS ----------
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function todayScore(){ return clamp(state.score, 0, 100); }

function getLastNDays(n){
  const out = [];
  for (let i = n-1; i >= 0; i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const rec = state.history.find(x => x.date === key);
    out.push({ date: key, score: rec ? rec.score : 0 });
  }
  return out;
}

function dayLabel(key){
  const d = new Date(key);
  return d.getDate();
}

// ---------- TOAST ----------
function toast(msg){
  const el = document.createElement("div");
  el.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/90 text-black px-4 py-2 rounded-xl shadow-lg";
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 1400);
}

// ---------- RENDER ----------
function render(){
  app.innerHTML = `
    <div class="min-h-screen pb-28 text-white"
      style="background: linear-gradient(135deg,#020617,#0f172a,#1e293b);">

      ${header()}
      ${page()}
      ${nav()}

    </div>
  `;
  bindEvents();
}

// ---------- HEADER ----------
function header(){
  const p = todayScore();
  return `
    <div class="p-4">
      <div class="rounded-2xl p-4 bg-white/10 backdrop-blur border border-white/10 shadow">

        <div class="flex justify-between items-center">
          <div class="text-lg">Level</div>
          <div class="text-green-400 font-semibold">${p}/100</div>
        </div>

        <div class="bg-gray-700 h-2 rounded mt-2 overflow-hidden">
          <div class="bg-green-500 h-2" style="width:${p}%"></div>
        </div>

        <div class="mt-2 text-sm opacity-80 flex justify-between">
          <div>🔥 ${state.streak} day streak</div>
          <div>🛡️ ${state.shield}</div>
        </div>

      </div>
    </div>
  `;
}

// ---------- HOME ----------
function home(){
  const week = getLastNDays(7);
  const grid = getLastNDays(28);

  return `
    <div class="px-4">

      <!-- 7-day strip -->
      <div class="mb-3">
        <div class="text-xs opacity-60 mb-1">This Week</div>
        <div class="flex gap-2">
          ${week.map(d=>`
            <div class="flex-1 text-center p-2 rounded-xl ${
              d.score>=70 ? "bg-green-500/60" : d.score>0 ? "bg-yellow-500/50" : "bg-white/10"
            }">
              ${dayLabel(d.date)}
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Top 3 -->
      <div class="text-sm opacity-60 mb-2">🔥 Top 3 Focus</div>
      ${focus.map(k=>`
        <div class="task p-4 mb-2 rounded-2xl bg-green-500/20 border border-green-400 flex justify-between"
             data-habit="${k}">
          <div>${habits[k].label}</div>
          <div class="text-green-400">+${habits[k].points}</div>
        </div>
      `).join("")}

      <!-- All tasks -->
      <div class="text-sm opacity-60 mt-4 mb-2">Today's Tasks</div>
      ${Object.keys(habits).map(k=>`
        <div class="task p-3 mb-2 rounded-xl flex justify-between ${
          state.habits[k] ? "bg-green-500/20 border border-green-400" : "bg-white/10"
        }" data-habit="${k}">
          <div>${habits[k].label}</div>
          <div class="text-green-400">+${habits[k].points}</div>
        </div>
      `).join("")}

      <!-- Insight -->
      ${insight()}

      <!-- 28-day heatmap -->
      <div class="mt-5">
        <div class="text-sm opacity-60 mb-2">Consistency (28 days)</div>
        <div class="grid grid-cols-7 gap-2">
          ${grid.map(d=>`
            <div class="h-10 rounded-xl flex items-center justify-center text-xs ${
              d.score>=70 ? "bg-green-500" :
              d.score>0   ? "bg-yellow-500" :
                            "bg-white/10"
            }">
              ${dayLabel(d.date)}
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  `;
}

// ---------- INSIGHT ----------
function insight(){
  let msg = "Stay consistent.";
  if (!state.habits.diet) msg = "Diet is the biggest lever today.";
  else if (!state.habits.workout) msg = "Get the workout done.";
  else if (todayScore() >= 60) msg = "Strong day. Finish clean.";
  return `
    <div class="mt-4">
      <div class="text-sm opacity-60">Insight</div>
      <div class="p-4 rounded-xl bg-white/10 mt-2">${msg}</div>
    </div>
  `;
}

// ---------- MEALS ----------
function meals(){
  return `
    <div class="px-4">
      <div class="p-4 bg-white/10 rounded-xl mb-3">
        <input id="foodInput" class="w-full p-2 text-black rounded mb-2" placeholder="Add food"/>
        <button data-action="addFood" class="bg-green-500 w-full p-2 rounded">Add</button>
      </div>

      ${state.foods.map((f,i)=>`
        <div class="bg-white/10 p-3 mb-2 rounded flex justify-between">
          ${f}
          <span data-remove="${i}">❌</span>
        </div>
      `).join("")}
    </div>
  `;
}

// ---------- FITNESS ----------
function fitness(){
  const list = ["Push-ups","Squats","Plank"];
  return `
    <div class="px-4 space-y-3">
      ${list.map(x=>`
        <div class="p-4 bg-white/10 rounded-xl">
          ${x}
          <div class="text-sm opacity-60 mt-1">3 sets</div>
        </div>
      `).join("")}
    </div>
  `;
}

// ---------- GROOMING ----------
function grooming(){
  const list = ["Face wash","Beard trim","Hair set"];
  return `
    <div class="px-4 space-y-3">
      ${list.map(x=>`
        <div class="p-4 bg-white/10 rounded-xl">${x}</div>
      `).join("")}
    </div>
  `;
}

// ---------- MIND ----------
function mind(){
  const list = ["Posture check","Slow speaking","Eye contact"];
  return `
    <div class="px-4 space-y-3">
      ${list.map(x=>`
        <div class="p-4 bg-white/10 rounded-xl">${x}</div>
      `).join("")}
    </div>
  `;
}

// ---------- PAGE ----------
function page(){
  switch(state.page){
    case "home": return home();
    case "meals": return meals();
    case "fitness": return fitness();
    case "grooming": return grooming();
    case "mind": return mind();
    default: return "";
  }
}

// ---------- NAV ----------
function nav(){
  return `
    <div class="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur border-t flex justify-around p-3">
      <div class="nav" data-page="home">🏠</div>
      <div class="nav" data-page="meals">🍽</div>
      <div class="nav" data-page="fitness">🏋️</div>
      <div class="nav" data-page="grooming">🧴</div>
      <div class="nav" data-page="mind">🧠</div>
    </div>
  `;
}

// ---------- EVENTS (DELEGATION) ----------
function bindEvents(){
  app.onclick = (e) => {
    // NAV
    if (e.target.dataset.page){
      state.page = e.target.dataset.page;
      save(); render();
    }

    // HABIT
    if (e.target.dataset.habit){
      const k = e.target.dataset.habit;
      const h = habits[k];

      state.habits[k] = !state.habits[k];
      state.score = clamp(state.score + (state.habits[k] ? h.points : -h.points), 0, 100);

      if (state.habits[k]) toast(`+${h.points} ${h.label}`);

      // micro-reward when crossing thresholds
      if (state.score === 50) toast("⚡ Halfway there");
      if (state.score === 70) toast("🔥 Streak secured for today");
      if (state.score === 100) toast("🏆 Perfect day");

      save(); render();
    }

    // ADD FOOD
    if (e.target.dataset.action === "addFood"){
      const val = (document.getElementById("foodInput").value || "").trim();
      if (!val) return;
      state.foods.push(val);
      save(); render();
    }

    // REMOVE FOOD
    if (e.target.dataset.remove){
      state.foods.splice(e.target.dataset.remove,1);
      save(); render();
    }
  };
}

render();
