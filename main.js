const app = document.getElementById("app");

const STORAGE = "carely_notify_v1";
const today = new Date().toISOString().slice(0,10);

// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem(STORAGE)) || {
  date: today,
  page: "home",
  score: 0,
  streak: 0,
  xp: 0,
  habits: {
    workout:false,
    steps:false,
    diet:false,
    grooming:false,
    posture:false
  }
};

function save(){
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

// ---------- NOTIFICATIONS ----------
let permissionGranted = false;

function requestPermission(){
  if("Notification" in window){
    Notification.requestPermission().then(p=>{
      if(p==="granted"){
        permissionGranted = true;
      }
    });
  }
}

function sendNotification(msg){
  if(permissionGranted){
    new Notification("Carely Reminder", {
      body: msg
    });
  }
}

// ---------- SMART REMINDER ----------
function getReminderMessage(){

  if(!state.habits.diet)
    return "Fix your diet today. That’s your biggest lever.";

  if(!state.habits.workout)
    return "Do a quick workout. Even 5 mins counts.";

  if(!state.habits.steps)
    return "Go for a walk. Movement matters.";

  return "You're doing great. Stay consistent.";
}

// ---------- SCHEDULE ----------
function scheduleReminders(){

  // Morning (9 AM)
  setTimeout(()=>{
    sendNotification("Start strong. Follow your plan today.");
  }, getDelay(9));

  // Evening (7 PM)
  setTimeout(()=>{
    sendNotification(getReminderMessage());
  }, getDelay(19));
}

function getDelay(hour){
  const now = new Date();
  const target = new Date();
  target.setHours(hour,0,0,0);

  if(target < now){
    target.setDate(target.getDate()+1);
  }

  return target - now;
}

// ---------- HEADER ----------
function header(){
  return `
  <div style="padding:16px;background:#1e293b">
    <div style="display:flex;justify-content:space-between">
      <div>🔥 ${state.streak} days</div>
      <div>${state.score}</div>
    </div>
  </div>`;
}

// ---------- HOME ----------
function home(){
  return `
  <div style="padding:16px">

    <button id="enableNotif" style="padding:10px;background:#22c55e;border:none;border-radius:10px">
      Enable Notifications
    </button>

    <button id="testNotif" style="margin-top:10px;padding:10px;background:#334155;border:none;border-radius:10px">
      Test Notification
    </button>

    <div style="margin-top:16px">Today's Tasks</div>

    ${task("Workout","workout")}
    ${task("Steps","steps")}
    ${task("Diet","diet")}
    ${task("Grooming","grooming")}
    ${task("Posture","posture")}

  </div>`;
}

// ---------- TASK ----------
function task(label,key){
  return `
  <div data-habit="${key}"
  style="padding:12px;margin-top:8px;border-radius:10px;
  background:${state.habits[key]?'#22c55e':'#1e293b'}">
    ${label}
  </div>`;
}

// ---------- NAV ----------
function nav(){
  return `
  <div style="position:fixed;bottom:0;width:100%;display:flex;justify-content:space-around;background:#020617;padding:12px">
    ${navItem("home","🏠")}
  </div>`;
}

function navItem(p,i){
  return `<div data-page="${p}" style="color:#22c55e">${i}</div>`;
}

// ---------- ROUTER ----------
function screen(){
  return home();
}

// ---------- EVENTS ----------
function bind(){

  app.onclick = e=>{
    const t=e.target.closest("[data-page],[data-habit]");
    if(!t) return;

    if(t.dataset.habit){
      const k=t.dataset.habit;
      state.habits[k]=!state.habits[k];
      state.score += state.habits[k]?10:-10;
      save(); render();
    }
  };

  document.getElementById("enableNotif").onclick = ()=>{
    requestPermission();
    scheduleReminders();
  };

  document.getElementById("testNotif").onclick = ()=>{
    sendNotification("This is your test reminder.");
  };
}

// ---------- INIT ----------
function render(){
  app.innerHTML = `
  <div style="min-height:100vh;background:#020617;color:white">
    ${header()}
    ${screen()}
    ${nav()}
  </div>`;
  bind();
}

render();
