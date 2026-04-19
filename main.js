const app = document.getElementById("app");
const today = new Date().toISOString().slice(0,10);

// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem("carely_full")) || {
  date: today,
  page: "home",
  score: 0,
  streak: 0,
  habits: {
    workout:false,
    steps:false,
    diet:false,
    grooming:false,
    posture:false
  },
  meals: {
    Breakfast:"",
    Lunch:"",
    Dinner:"",
    Snacks:""
  },
  history: [],
  photos: []
};

function save(){
  localStorage.setItem("carely_full", JSON.stringify(state));
}

// ---------- RESET ----------
if(state.date !== today){
  const done = Object.values(state.habits).filter(Boolean).length;
  const percent = Math.round((done/5)*100);

  state.history.push({date:state.date,score:percent});
  if(state.history.length>60) state.history.shift();

  state.streak = percent >= 70 ? state.streak + 1 : 0;

  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);
  save();
}

// ---------- CONFIG ----------
const habits = {
  workout:{label:"Workout",points:20},
  steps:{label:"Steps",points:10},
  diet:{label:"Diet",points:25},
  grooming:{label:"Grooming",points:10},
  posture:{label:"Posture",points:10}
};

// ---------- ICONS ----------
const icons = {
  home:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10L12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>`,
  meal:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v4H3zM6 7v14M18 7v14"/></svg>`,
  gym:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h4v12H6zM14 6h4v12h-4z"/></svg>`,
  grooming:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`,
  mind:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/></svg>`
};

// ---------- RENDER ----------
function render(){
  app.innerHTML = `
  <div style="min-height:100vh;padding-bottom:100px;
  background:radial-gradient(circle at top,#1e293b,#020617);
  color:white;font-family:system-ui">

    ${header()}
    ${page()}
    ${nav()}

  </div>`;
  bindEvents();
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px">
    <div style="padding:16px;border-radius:20px;
    background:rgba(255,255,255,0.08)">

      <div style="display:flex;justify-content:space-between">
        <div>Score</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>

      <div style="height:6px;background:#334155;border-radius:6px;margin-top:8px">
        <div style="height:6px;background:#22c55e;width:${state.score}%"></div>
      </div>

      <div style="font-size:12px;margin-top:8px">
        🔥 ${state.streak} day streak
      </div>

    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    ${graph()}

    <div style="margin-top:12px">Today's Tasks</div>

    ${Object.keys(habits).map(k=>`
      <div class="habit" data-habit="${k}"
      style="padding:14px;margin-top:8px;border-radius:12px;
      background:${state.habits[k]?'#22c55e':'rgba(255,255,255,0.08)'}">
      ${habits[k].label} (+${habits[k].points})
      </div>
    `).join("")}

    ${photos()}

  </div>`;
}

// ---------- GRAPH ----------
function graph(){
  const data = state.history.slice(-7);
  if(data.length===0) return "";

  return `
  <div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.08)">
    <div style="display:flex;height:100px;gap:5px">
      ${data.map(d=>`
        <div style="flex:1;background:#22c55e;height:${d.score}%"></div>
      `).join("")}
    </div>
  </div>`;
}

// ---------- PHOTOS ----------
function photos(){
  return `
  <div style="margin-top:12px">
    <input type="file" id="photoInput"/>
    <div style="display:flex;gap:6px;margin-top:6px">
      ${state.photos.map(p=>`<img src="${p}" style="height:60px"/>`).join("")}
    </div>
  </div>`;
}

// ---------- PAGES ----------
function page(){
  switch(state.page){
    case "home": return home();
    case "meals": return meals();
    case "fitness": return fitness();
    case "grooming": return grooming();
    case "mind": return mind();
  }
}

// ---------- MEALS ----------
function meals(){
  return `
  <div style="padding:16px">
    ${["Breakfast","Lunch","Dinner","Snacks"].map(m=>`
      <input data-meal="${m}" value="${state.meals[m]}"
      placeholder="${m}"
      style="width:100%;margin-bottom:10px;padding:10px;border-radius:10px"/>
    `).join("")}
  </div>`;
}

// ---------- FITNESS ----------
function fitness(){
  return `
  <div style="padding:16px">
    ${exercise("Push-ups","workout")}
    ${exercise("Squats","steps")}
    ${exercise("Plank","posture")}
  </div>`;
}

function exercise(name,key){
  return `
  <div class="habit" data-habit="${key}"
  style="padding:12px;margin-bottom:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'rgba(255,255,255,0.08)'}">
    ${name}
  </div>`;
}

// ---------- GROOMING ----------
function grooming(){
  return `
  <div style="padding:16px">
    ${check("Face Wash","grooming")}
    ${check("Beard Trim","grooming")}
  </div>`;
}

// ---------- MIND ----------
function mind(){
  return `
  <div style="padding:16px">
    ${check("Posture","posture")}
    ${check("Confidence Practice","diet")}
  </div>`;
}

function check(label,key){
  return `
  <div class="habit" data-habit="${key}"
  style="padding:12px;margin-bottom:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'rgba(255,255,255,0.08)'}">
    ${label}
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;
  display:flex;justify-content:space-around;
  background:rgba(0,0,0,0.8);padding:10px">

    ${navItem("home",icons.home)}
    ${navItem("meals",icons.meal)}
    ${navItem("fitness",icons.gym)}
    ${navItem("grooming",icons.grooming)}
    ${navItem("mind",icons.mind)}

  </div>`;
}

function navItem(p,icon){
  return `
  <div class="nav" data-page="${p}"
  style="color:${state.page===p?'#22c55e':'#aaa'}">
  ${icon}
  </div>`;
}

// ---------- EVENTS ----------
function bindEvents(){

  app.onclick = e=>{
    const target = e.target.closest("[data-page],[data-habit]");
    if(!target) return;

    if(target.dataset.page){
      state.page = target.dataset.page;
      save(); render();
    }

    if(target.dataset.habit){
      const k = target.dataset.habit;
      const h = habits[k];

      state.habits[k] = !state.habits[k];
      state.score += state.habits[k]?h.points:-h.points;
      state.score = Math.max(0,Math.min(100,state.score));

      save(); render();
    }
  };

  document.querySelectorAll("[data-meal]").forEach(input=>{
    input.oninput = e=>{
      state.meals[e.target.dataset.meal] = e.target.value;
      save();
    };
  });

  const photo = document.getElementById("photoInput");
  if(photo){
    photo.onchange = ()=>{
      const file = photo.files[0];
      const reader = new FileReader();
      reader.onload = e=>{
        state.photos.push(e.target.result);
        save(); render();
      };
      reader.readAsDataURL(file);
    };
  }
}

render();
