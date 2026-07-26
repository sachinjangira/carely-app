const app = document.getElementById("app");

const STORAGE = "carely_v2";
const today = new Date().toISOString().slice(0,10);
try{ localStorage.removeItem("carely_final_v1"); }catch(e){}

// =====================================================
// DEFAULT STATE  — Day 1 = 27 July 2026 (fixed)
// =====================================================
const DEFAULT_STATE = {
  date: today,
  page: "dashboard",
  score: 0,
  streak: 0,
  xp: 0,
  level: 1,
  startDate: "2026-07-27",
  habits: { workout:false, steps:false, diet:false, grooming:false, mind:false, posture:false },
  history: [],
  photos: [],
  dailyLogs: {},
  weeklyLogs: {},
  weightLogs: [],
  vitalsLogs: [],
  milestonesChecked: {},
  groomingCycles: {
    haircut: { last: "2026-07-27", interval: 15 },
    beard:   { last: "2026-07-27", interval: 7 }
  },
  knowledgeGoals: []
};

let saved = null;
try{ saved = JSON.parse(localStorage.getItem(STORAGE)); }catch(e){ saved = null; }

let state = Object.assign({}, DEFAULT_STATE, saved || {});
state.habits = Object.assign({}, DEFAULT_STATE.habits, (saved && saved.habits) || {});
state.dailyLogs = (saved && saved.dailyLogs) || {};
state.weeklyLogs = (saved && saved.weeklyLogs) || {};
state.weightLogs = (saved && saved.weightLogs) || [];
state.vitalsLogs = (saved && saved.vitalsLogs) || [];
state.milestonesChecked = (saved && saved.milestonesChecked) || {};
state.photos = (saved && saved.photos) || [];
state.history = (saved && saved.history) || [];
state.startDate = (saved && saved.startDate) || DEFAULT_STATE.startDate;
state.groomingCycles = Object.assign({}, DEFAULT_STATE.groomingCycles, (saved && saved.groomingCycles) || {});
state.knowledgeGoals = (saved && saved.knowledgeGoals) || [];

function save(){ localStorage.setItem(STORAGE, JSON.stringify(state)); }

if(state.date !== today){
  state.history.push({date:state.date, score:state.score});
  if(state.history.length>90) state.history.shift();
  if(state.score >= 60) state.streak++; else state.streak = 0;
  state.date = today;
  state.score = 0;
  Object.keys(state.habits).forEach(k=>state.habits[k]=false);
  save();
}

// transient UI-only state (not persisted)
let viewState = {
  period: { dashboard:'daily', fitness:'daily', meals:'daily', grooming:'daily', mind:'daily' },
  date:   { dashboard: today, fitness: today, meals: today, grooming: today, mind: today }
};
let calcState = { query:'', grams:100, result:null, error:null };

// =====================================================
// NOTIFICATIONS
// =====================================================
let notifAllowed = false;
function requestNotification(){
  if("Notification" in window){
    Notification.requestPermission().then(p=>{ if(p==="granted"){ notifAllowed=true; scheduleReminders(); } });
  }
}
function notify(msg){ if(notifAllowed){ new Notification("Carely", { body: msg }); } }
function getSmartReminder(){
  if(!state.habits.diet) return "Fix diet. Biggest impact.";
  if(!state.habits.workout) return "Do quick workout.";
  if(!state.habits.steps) return "Walk more today.";
  if(!state.habits.grooming) return "Grooming — 5 min, don't skip.";
  if(!state.habits.mind) return "10 min for your mind today.";
  return "Good job. Stay consistent.";
}
function scheduleReminders(){
  setTimeout(()=> notify("Start your day strong 💪"), getDelay(9));
  setTimeout(()=> notify(getSmartReminder()), getDelay(19));
}
function getDelay(hour){
  const now = new Date(); const t = new Date();
  t.setHours(hour,0,0,0);
  if(t < now) t.setDate(t.getDate()+1);
  return t - now;
}
function updateLevel(){ state.level = Math.floor(state.xp/100)+1; return state.xp % 100; }
function getPlan(){
  let difficulty = "normal";
  if(state.streak === 0) difficulty = "easy";
  if(state.streak >= 3) difficulty = "hard";
  let workout = difficulty==="easy" ? ["Pushups x5","Squats x10"]
    : difficulty==="hard" ? ["Pushups x15","Squats x25","Plank 45s"]
    : ["Pushups x10","Squats x15"];
  let meal = state.habits.diet ? "Maintain clean diet" : "Avoid junk + reduce snacks";
  return { workout, meal, focus: getSmartReminder(), difficulty };
}

// =====================================================
// DATE HELPERS
// =====================================================
function toDateStr(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function addDays(dateStr, n){ const d = new Date(dateStr+'T00:00:00'); d.setDate(d.getDate()+n); return d; }
function fmtDate(d){ return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
const previewMax = toDateStr(addDays(today, 60));
function clampDate(d){ if(d<state.startDate) return state.startDate; if(d>previewMax) return previewMax; return d; }
function dayNumberForDate(dateStr){
  const start = new Date(state.startDate+'T00:00:00');
  const d = new Date(dateStr+'T00:00:00');
  return Math.floor((d-start)/86400000)+1;
}
function dayNumber(){ return dayNumberForDate(today); }
function dowIndexForDate(dateStr){ return new Date(dateStr+'T00:00:00').getDay()%5; }
function dowIndex(){ return dowIndexForDate(today); }
function isoWeekKeyForDate(dateStr){
  const d = new Date(dateStr+'T00:00:00');
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay()+6)%7;
  target.setDate(target.getDate()-dayNr+3);
  const firstThursday = new Date(target.getFullYear(),0,4);
  const week = 1 + Math.round(((target-firstThursday)/86400000 - 3 + ((firstThursday.getDay()+6)%7))/7);
  return target.getFullYear()+"-W"+week;
}
function isoWeekKey(){ return isoWeekKeyForDate(today); }
function mondayOf(dateStr){
  const d = new Date(dateStr+'T00:00:00');
  const dow = (d.getDay()+6)%7;
  return toDateStr(addDays(dateStr,-dow));
}
function weekDatesFor(dateStr){
  const mon = mondayOf(dateStr);
  return Array.from({length:7},(_,i)=> toDateStr(addDays(mon,i)));
}
function last28DatesFor(dateStr){
  return Array.from({length:28},(_,i)=> toDateStr(addDays(dateStr, i-27)));
}
function getDayLog(dateStr){ if(!state.dailyLogs[dateStr]) state.dailyLogs[dateStr] = { tasks:{} }; return state.dailyLogs[dateStr]; }
function getWeekLog(weekKey){ if(!state.weeklyLogs[weekKey]) state.weeklyLogs[weekKey] = { tasks:{} }; return state.weeklyLogs[weekKey]; }
function countDoneAt(dateStr, prefix, total){
  const log = state.dailyLogs[dateStr];
  if(!log) return 0;
  let done=0; for(let i=0;i<total;i++) if(log.tasks[prefix+'-'+i]) done++;
  return done;
}
function scoreForDate(d){
  if(d===today) return state.score;
  const h = state.history.find(x=>x.date===d);
  return h ? h.score : null;
}

// =====================================================
// CONTENT — FITNESS PHASES
// =====================================================
const PHASES = [
  { id:1, from:0, to:13, name:'Phase 1 · Foundation',
    yoga:[
      {t:'Anulom Vilom (alternate nostril breathing)', s:'2 min, right after waking'},
      {t:'Vajrasana', s:'2–3 min, sit on heels right after any one meal'}
    ],
    movement:[
      {t:'3 squats', s:'2-min version — after brushing teeth'},
      {t:'Walk to the door and back', s:'2-min version — after first tea/coffee'},
      {t:'1 push-up', s:'2-min version — before opening laptop'},
      {t:'Plank, 10 sec', s:'2-min version — after reaching home'}
    ]
  },
  { id:2, from:14, to:27, name:'Phase 2 · Building',
    yoga:[
      {t:'Anulom Vilom', s:'2 min'},
      {t:'Vajrasana', s:'2–3 min after a meal'},
      {t:'Surya Namaskar', s:'2–3 slow rounds, knees down if needed'},
      {t:'Kapalbhati', s:'1 min, short sharp exhales'}
    ],
    movement:[
      {t:'Squats', s:'building toward 3 sets of 10'},
      {t:'Walk', s:'building toward 10–15 min'},
      {t:'Push-ups', s:'building toward 3 sets of 8–10'},
      {t:'Plank', s:'building toward 3 rounds of 30 sec'}
    ]
  },
  { id:3, from:28, to:59, name:'Phase 3 · Momentum',
    yoga:[
      {t:'Surya Namaskar', s:'5–6 rounds'},
      {t:'Ardha Matsyendrasana (spinal twist)', s:'20–30 sec each side — pancreas & liver'},
      {t:'Bhujangasana (cobra)', s:'15–20 sec, 3 rounds'}
    ],
    movement:[
      {t:'Squats — 3×10', s:'full version'},
      {t:'Push-ups — 3×8–10', s:'full version'},
      {t:'Plank — 3×30 sec', s:'full version'},
      {t:'Walk — 15–25 min', s:'add sunlight walk on weekends'}
    ]
  },
  { id:4, from:60, to:99999, name:'Phase 4 · Full Practice',
    yoga:[
      {t:'Surya Namaskar', s:'6–8 rounds'},
      {t:'Mandukasana (frog pose)', s:'20–30 sec — direct pancreas stimulation'},
      {t:'Paschimottanasana (forward bend)', s:'30 sec'},
      {t:'Bhastrika pranayama', s:'1–2 min'},
      {t:'Silent breathing / meditation', s:'5 min'}
    ],
    movement:[
      {t:'Squats — 3×10+', s:'add reps or pulses'},
      {t:'Push-ups — 3×10+', s:'add reps'},
      {t:'Plank — 3×45–60 sec', s:'progress hold time'},
      {t:'Walk — 20–30 min', s:'daily'}
    ]
  }
];
function phaseForDay(n){ return PHASES.find(p => n-1>=p.from && n-1<=p.to) || PHASES[PHASES.length-1]; }

// =====================================================
// CONTENT — MEALS
// =====================================================
const MEAL_ROTATION = [
  { breakfast:'Moong dal chilla', mid:'Soaked soy chunks', lunchDal:'Rajma', lunchSabzi:'Bhindi', evening:'Fruit chaat', dinner:'Paneer sauté' },
  { breakfast:'Vegetable poha', mid:'Roasted chana', lunchDal:'Chole', lunchSabzi:'Lauki', evening:'Sprouts bhel', dinner:'Tofu stir-fry' },
  { breakfast:'Besan/oats chilla', mid:'Peanut chaat', lunchDal:'Moong dal tadka', lunchSabzi:'Mixed veg', evening:'Roasted makhana', dinner:'Soy chunks curry' },
  { breakfast:'Idli + sambar', mid:'Sprouts salad', lunchDal:'Sambar', lunchSabzi:'Baingan bharta', evening:'Vegetable soup', dinner:'Rajma (light)' },
  { breakfast:'Paneer bhurji + roti', mid:'Mixed nuts', lunchDal:'Kadhi', lunchSabzi:'Palak paneer', evening:'Buttermilk + chana', dinner:'Paneer tikka (grilled)' }
];

// nutrition DB — per 100g, approximate reference values
const FOOD_DB = [
  {name:'Bhindi (Okra)', cal:33, protein:1.9, carbs:7.5, fat:0.2, fiber:3.2, calcium:81, iron:0.8},
  {name:'Lauki (Bottle gourd)', cal:14, protein:0.6, carbs:3.4, fat:0.1, fiber:0.5, calcium:26, iron:0.2},
  {name:'Baingan (Brinjal)', cal:25, protein:1, carbs:6, fat:0.2, fiber:3, calcium:9, iron:0.2},
  {name:'Palak (Spinach)', cal:23, protein:2.9, carbs:3.6, fat:0.4, fiber:2.2, calcium:99, iron:2.7},
  {name:'Methi leaves (Fenugreek)', cal:35, protein:4.4, carbs:6, fat:0.6, fiber:1.1, calcium:176, iron:1.9},
  {name:'Cauliflower', cal:25, protein:1.9, carbs:5, fat:0.3, fiber:2, calcium:22, iron:0.4},
  {name:'Cabbage', cal:25, protein:1.3, carbs:5.8, fat:0.1, fiber:2.5, calcium:40, iron:0.5},
  {name:'Carrot', cal:41, protein:0.9, carbs:10, fat:0.2, fiber:2.8, calcium:33, iron:0.3},
  {name:'Tomato', cal:18, protein:0.9, carbs:3.9, fat:0.2, fiber:1.2, calcium:10, iron:0.3},
  {name:'Onion', cal:40, protein:1.1, carbs:9.3, fat:0.1, fiber:1.7, calcium:23, iron:0.2},
  {name:'Potato (boiled)', cal:87, protein:1.9, carbs:20, fat:0.1, fiber:2.2, calcium:12, iron:0.8},
  {name:'Green peas', cal:81, protein:5.4, carbs:14, fat:0.4, fiber:5.7, calcium:25, iron:1.5},
  {name:'Capsicum', cal:20, protein:0.9, carbs:4.6, fat:0.2, fiber:1.7, calcium:10, iron:0.4},
  {name:'Cucumber', cal:15, protein:0.7, carbs:3.6, fat:0.1, fiber:0.5, calcium:16, iron:0.3},
  {name:'Beetroot', cal:43, protein:1.6, carbs:10, fat:0.2, fiber:2.8, calcium:16, iron:0.8},
  {name:'Radish', cal:16, protein:0.7, carbs:3.4, fat:0.1, fiber:1.6, calcium:25, iron:0.3},
  {name:'Pumpkin', cal:26, protein:1, carbs:6.5, fat:0.1, fiber:0.5, calcium:21, iron:0.8},
  {name:'Ridge gourd (Turai)', cal:20, protein:1.2, carbs:4.3, fat:0.2, fiber:1.1, calcium:20, iron:0.5},
  {name:'Bitter gourd (Karela)', cal:17, protein:1, carbs:3.7, fat:0.2, fiber:2.8, calcium:19, iron:0.4},
  {name:'French beans', cal:31, protein:1.8, carbs:7, fat:0.2, fiber:3.4, calcium:37, iron:1},
  {name:'Mushroom', cal:22, protein:3.1, carbs:3.3, fat:0.3, fiber:1, calcium:3, iron:0.5},
  {name:'Sweet potato (boiled)', cal:86, protein:1.6, carbs:20, fat:0.1, fiber:3, calcium:30, iron:0.6},
  {name:'Broccoli', cal:34, protein:2.8, carbs:7, fat:0.4, fiber:2.6, calcium:47, iron:0.7},
  {name:'Zucchini', cal:17, protein:1.2, carbs:3.1, fat:0.3, fiber:1, calcium:16, iron:0.4},
  {name:'Banana', cal:89, protein:1.1, carbs:23, fat:0.3, fiber:2.6, calcium:5, iron:0.3},
  {name:'Apple', cal:52, protein:0.3, carbs:14, fat:0.2, fiber:2.4, calcium:6, iron:0.1},
  {name:'Mango', cal:60, protein:0.8, carbs:15, fat:0.4, fiber:1.6, calcium:11, iron:0.2},
  {name:'Papaya', cal:43, protein:0.5, carbs:11, fat:0.3, fiber:1.7, calcium:20, iron:0.3},
  {name:'Orange', cal:47, protein:0.9, carbs:12, fat:0.1, fiber:2.4, calcium:40, iron:0.1},
  {name:'Guava', cal:68, protein:2.6, carbs:14, fat:1, fiber:5.4, calcium:18, iron:0.3},
  {name:'Pomegranate', cal:83, protein:1.7, carbs:19, fat:1.2, fiber:4, calcium:10, iron:0.3},
  {name:'Grapes', cal:69, protein:0.7, carbs:18, fat:0.2, fiber:0.9, calcium:10, iron:0.4},
  {name:'Watermelon', cal:30, protein:0.6, carbs:8, fat:0.2, fiber:0.4, calcium:7, iron:0.2},
  {name:'Pineapple', cal:50, protein:0.5, carbs:13, fat:0.1, fiber:1.4, calcium:13, iron:0.3},
  {name:'Pear', cal:57, protein:0.4, carbs:15, fat:0.1, fiber:3.1, calcium:9, iron:0.2},
  {name:'Kiwi', cal:61, protein:1.1, carbs:15, fat:0.5, fiber:3, calcium:34, iron:0.3},
  {name:'Chikoo (Sapota)', cal:83, protein:0.4, carbs:20, fat:1.1, fiber:5.3, calcium:21, iron:0.8},
  {name:'Rice (cooked)', cal:130, protein:2.7, carbs:28, fat:0.3, fiber:0.4, calcium:10, iron:0.2},
  {name:'Wheat flour (atta)', cal:340, protein:12, carbs:72, fat:2, fiber:11, calcium:30, iron:4},
  {name:'Oats (dry)', cal:389, protein:17, carbs:66, fat:7, fiber:10, calcium:54, iron:4.7},
  {name:'Poha (dry)', cal:353, protein:6.6, carbs:77, fat:1, fiber:1.4, calcium:10, iron:3},
  {name:'Dalia (broken wheat, dry)', cal:342, protein:12, carbs:72, fat:2, fiber:12, calcium:30, iron:4},
  {name:'Ragi flour', cal:328, protein:7.3, carbs:72, fat:1.3, fiber:3.6, calcium:344, iron:3.9},
  {name:'Jowar flour', cal:349, protein:10, carbs:73, fat:3.3, fiber:10, calcium:25, iron:4.1},
  {name:'Bajra flour', cal:361, protein:11, carbs:67, fat:5, fiber:12, calcium:42, iron:8},
  {name:'Moong dal (cooked)', cal:105, protein:7, carbs:19, fat:0.4, fiber:7.5, calcium:27, iron:1.4},
  {name:'Chana dal / Chickpeas (cooked)', cal:164, protein:8.9, carbs:27, fat:2.6, fiber:7.6, calcium:49, iron:2.9},
  {name:'Toor dal (cooked)', cal:121, protein:6.8, carbs:20, fat:1, fiber:5, calcium:26, iron:1.9},
  {name:'Masoor dal (cooked)', cal:116, protein:9, carbs:20, fat:0.4, fiber:7.9, calcium:19, iron:3.3},
  {name:'Rajma (cooked)', cal:127, protein:8.7, carbs:22.8, fat:0.5, fiber:6.4, calcium:35, iron:2.2},
  {name:'Soybean (cooked)', cal:173, protein:16.6, carbs:9.9, fat:9, fiber:6, calcium:102, iron:5.1},
  {name:'Soy chunks (dry)', cal:345, protein:52, carbs:33, fat:0.5, fiber:13, calcium:350, iron:20},
  {name:'Sprouts (moong, raw)', cal:30, protein:3, carbs:6, fat:0.2, fiber:1.8, calcium:13, iron:1.1},
  {name:'Peanuts', cal:567, protein:25.8, carbs:16, fat:49, fiber:8.5, calcium:92, iron:4.6},
  {name:'Milk (whole)', cal:61, protein:3.2, carbs:4.8, fat:3.3, fiber:0, calcium:113, iron:0.03},
  {name:'Curd', cal:61, protein:3.5, carbs:4.7, fat:3.3, fiber:0, calcium:121, iron:0.1},
  {name:'Paneer', cal:265, protein:18.3, carbs:1.2, fat:20.8, fiber:0, calcium:208, iron:0.2},
  {name:'Buttermilk (chaas)', cal:40, protein:3, carbs:4.8, fat:1, fiber:0, calcium:120, iron:0.1},
  {name:'Cheese (processed)', cal:300, protein:20, carbs:3, fat:24, fiber:0, calcium:700, iron:0.5},
  {name:'Ghee', cal:900, protein:0, carbs:0, fat:100, fiber:0, calcium:0, iron:0},
  {name:'Butter', cal:717, protein:0.9, carbs:0.1, fat:81, fiber:0, calcium:24, iron:0},
  {name:'Almonds', cal:579, protein:21, carbs:22, fat:50, fiber:12.5, calcium:269, iron:3.7},
  {name:'Walnuts', cal:654, protein:15, carbs:14, fat:65, fiber:6.7, calcium:98, iron:2.9},
  {name:'Cashew', cal:553, protein:18, carbs:30, fat:44, fiber:3.3, calcium:37, iron:6.7},
  {name:'Sesame seeds', cal:573, protein:18, carbs:23, fat:50, fiber:12, calcium:975, iron:14.6},
  {name:'Flaxseed', cal:534, protein:18, carbs:29, fat:42, fiber:27, calcium:255, iron:5.7},
  {name:'Chia seeds', cal:486, protein:17, carbs:42, fat:31, fiber:34, calcium:631, iron:7.7},
  {name:'Sunflower seeds', cal:584, protein:21, carbs:20, fat:51, fiber:8.6, calcium:78, iron:5.2},
  {name:'Jaggery (gur)', cal:383, protein:0.4, carbs:98, fat:0.1, fiber:0, calcium:85, iron:11.4},
  {name:'Sugar (white)', cal:387, protein:0, carbs:100, fat:0, fiber:0, calcium:1, iron:0.1},
  {name:'Honey', cal:304, protein:0.3, carbs:82, fat:0, fiber:0.2, calcium:6, iron:0.4},
  {name:'Cooking oil (generic)', cal:884, protein:0, carbs:0, fat:100, fiber:0, calcium:0, iron:0},
  {name:'Tofu', cal:76, protein:8, carbs:1.9, fat:4.8, fiber:0.3, calcium:350, iron:5.4}
];
function findFood(query){
  const q=(query||'').trim().toLowerCase();
  if(!q) return null;
  return FOOD_DB.find(f=>f.name.toLowerCase()===q)
    || FOOD_DB.find(f=>f.name.toLowerCase().startsWith(q))
    || FOOD_DB.find(f=>f.name.toLowerCase().includes(q))
    || null;
}
function scaleFood(food,grams){
  const k=grams/100, r=v=>Math.round(v*k*10)/10;
  return { cal:Math.round(food.cal*k), protein:r(food.protein), carbs:r(food.carbs), fat:r(food.fat), fiber:r(food.fiber), calcium:Math.round(food.calcium*k), iron:r(food.iron) };
}

// =====================================================
// CONTENT — GROOMING
// =====================================================
const GROOMING_DAILY = [
  {t:'Skincare — morning', s:'Cleanse, moisturize, sunscreen if stepping out'},
  {t:'Skincare — night', s:'Cleanse + moisturize before bed'},
  {t:'Hair care', s:'Comb/style; oil 2–3x/week'},
  {t:'Oral hygiene check', s:'Brush + floss both times today'},
  {t:'Nails & hands', s:'Quick check — trim if needed'}
];
const GROOMING_WEEKLY = [
  {t:'Exfoliate skin', s:'Once a week, face and body'},
  {t:'Prep one outfit in advance', s:'Iron/steam something for an important day ahead'}
];

// =====================================================
// CONTENT — MIND (KNOWLEDGE)
// =====================================================
const MIND_DAILY = [
  {t:'Read for 10–15 min', s:'Any book, article, or industry piece'},
  {t:'Learn one new thing', s:'A skill, tool, or concept — write it down somewhere'},
  {t:'Journal / reflect', s:'5 min — what went well, what to adjust'},
  {t:'Practice speaking your ideas out loud', s:'e.g. a self-introduction, a talking point — 5 min'}
];
const MIND_WEEKLY = [
  {t:'Go deep on one topic', s:'One full article, chapter, or course lesson, properly understood'},
  {t:'Review the week', s:'What moved you forward? What didn\'t? Adjust next week\'s focus'}
];

// =====================================================
// MILESTONES
// =====================================================
const MILESTONES = [
  { id:'m1', offset:3, title:'Show up 3 days straight', desc:'2-min versions only.' },
  { id:'m2', offset:7, title:'First full week', desc:'Tracker filled all 7 days.' },
  { id:'m3', offset:14, title:'Two weeks in', desc:'Movement becomes automatic.' },
  { id:'m4', offset:30, title:'One month', desc:'Move to full versions.' },
  { id:'m5', offset:42, title:'Six weeks', desc:'First waist check.' },
  { id:'m6', offset:60, title:'Two months', desc:'Add more if it feels easy.' },
  { id:'m7', offset:70, title:'Ten weeks', desc:'Second waist check.' },
  { id:'m8', offset:90, title:'Three months', desc:'Expect ~2–4kg loss if consistent.' },
  { id:'m9', offset:120, title:'Four months', desc:'Waist noticeably smaller.' },
  { id:'m10', offset:150, title:'Five months', desc:'Faint ab outline possible.' },
  { id:'m11', offset:180, title:'Six months', desc:'Visible ab definition.' }
];

// =====================================================
// RATIOS (for heatmaps / streaks)
// =====================================================
function fitnessRatio(d){
  const log = state.dailyLogs[d];
  const phase = phaseForDay(dayNumberForDate(d));
  const total = phase.yoga.length + phase.movement.length;
  if(!log || !total) return 0;
  let done=0;
  phase.yoga.forEach((_,i)=>{ if(log.tasks['yoga-'+i]) done++; });
  phase.movement.forEach((_,i)=>{ if(log.tasks['move-'+i]) done++; });
  return done/total;
}
function prefixRatioFn(prefix,total){
  return d=>{
    const log = state.dailyLogs[d];
    if(!log || !total) return 0;
    let done=0;
    for(let i=0;i<total;i++) if(log.tasks[prefix+'-'+i]) done++;
    return done/total;
  };
}
const mealsRatio = prefixRatioFn('meal',6);
const groomingRatio = prefixRatioFn('groomd', GROOMING_DAILY.length);
const mindRatio = prefixRatioFn('mindd', MIND_DAILY.length);
function combinedRatio(d){ return (fitnessRatio(d)+mealsRatio(d)+groomingRatio(d)+mindRatio(d))/4; }

function sectionStreak(prefixes, totalsFn){
  let streak=0, d=today, guard=0;
  while(guard<400){
    guard++;
    if(d < state.startDate) break;
    const log = state.dailyLogs[d];
    if(!log) break;
    const totals = totalsFn(d);
    let totalCount=0, done=0;
    prefixes.forEach(p=>{
      const t = totals[p]||0; totalCount+=t;
      for(let i=0;i<t;i++) if(log.tasks[p+'-'+i]) done++;
    });
    const ratio = totalCount ? done/totalCount : 0;
    if(ratio>=0.6){ streak++; d = toDateStr(addDays(d,-1)); } else break;
  }
  return streak;
}
function fitnessAdvice(streak, phase){
  const log = getDayLog(today);
  const yogaDone = phase.yoga.filter((_,i)=>log.tasks['yoga-'+i]).length;
  const moveDone = phase.movement.filter((_,i)=>log.tasks['move-'+i]).length;
  if(streak===0) return "Just show up today — even the 2-minute version counts. That's the whole game right now.";
  if(yogaDone < phase.yoga.length && moveDone===phase.movement.length) return "Movement's solid — yoga's the gap today. Even 2 minutes of breathing counts.";
  if(moveDone < phase.movement.length && yogaDone===phase.yoga.length) return "Yoga's on track — squeeze in the movement pieces around your day.";
  if(streak>=7 && phase.id<4) return "Strong streak — if the full versions feel easy, you can lean into the next phase early.";
  if(yogaDone===phase.yoga.length && moveDone===phase.movement.length) return "Both done for today. Nothing left to prove — rest easy.";
  return "Keep the chain alive — small and consistent beats big and occasional.";
}
function fitnessHistoryList(){
  const dates = Object.keys(state.dailyLogs).sort().reverse().slice(0,10);
  if(!dates.length) return `<div style="font-size:12.5px;color:#64748b">No past days yet.</div>`;
  return dates.map(d=>{
    const log = state.dailyLogs[d];
    const phase = phaseForDay(dayNumberForDate(d));
    const items = [...phase.yoga.map((it,i)=>({...it,key:'yoga-'+i})), ...phase.movement.map((it,i)=>({...it,key:'move-'+i}))];
    const doneCount = items.filter(it=>log.tasks[it.key]).length;
    return `<details style="background:#1e293b;border-radius:10px;margin-bottom:6px;overflow:hidden">
      <summary style="padding:10px 12px;font-size:13px;cursor:pointer;list-style:none;display:flex;justify-content:space-between">
        <span>${fmtDate(new Date(d+'T00:00:00'))}</span><span style="color:#22c55e">${doneCount}/${items.length}</span>
      </summary>
      <div style="padding:0 12px 12px;font-size:12px;color:#94a3b8">
        ${items.map(it=>`<div style="padding:3px 0">${log.tasks[it.key]?'✅':'⬜'} ${it.t}</div>`).join('')}
      </div>
    </details>`;
  }).join('');
}

// =====================================================
// SHARED UI PIECES
// =====================================================
function header(){
  const xp = updateLevel();
  return `
  <div style="padding:16px">
    <div style="background:#1e293b;padding:16px;border-radius:16px">
      <div style="display:flex;justify-content:space-between">
        <div>Level ${state.level}</div>
        <div style="color:#22c55e">${state.score}</div>
      </div>
      <div style="height:8px;background:#0f172a;margin-top:8px;border-radius:4px;overflow:hidden">
        <div style="width:${xp}%;height:8px;background:#22c55e"></div>
      </div>
      <div style="font-size:12px;margin-top:6px">🔥 ${state.streak} • ⚡ ${state.xp}</div>
    </div>
  </div>`;
}
function sectionTitle(label, num){
  return `<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin:18px 0 8px">${num?`<span style="color:#22c55e">${num} · </span>`:''}${label}</div>`;
}
function card(t,v){ return `<div style="margin-top:10px;background:#1e293b;padding:12px;border-radius:10px"><b>${t}</b><br>${v}</div>`; }
function checklist(items, section, log, isWeek){
  return `<div style="background:#1e293b;border-radius:12px;padding:4px 12px;margin-bottom:6px">
    ${items.map((it,idx)=>{
      const key = section+'-'+idx;
      const checked = !!log.tasks[key];
      return `
      <label style="display:flex;gap:10px;align-items:flex-start;padding:11px 0;border-bottom:1px solid #0f172a55;cursor:pointer">
        <input type="checkbox" data-log-key="${key}" data-log-target="${isWeek?'week':'day'}" ${checked?'checked':''} style="margin-top:3px;width:18px;height:18px;accent-color:#22c55e;flex-shrink:0">
        <span style="font-size:14px;line-height:1.4;${checked?'color:#64748b;text-decoration:line-through':''}">
          ${it.t}<br><span style="font-size:12px;color:#64748b">${it.s}</span>
        </span>
      </label>`;
    }).join('')}
  </div>`;
}
function details(summary, bodyHtml){
  return `<details style="background:#1e293b;border-radius:12px;margin-bottom:8px;overflow:hidden">
    <summary style="padding:12px 14px;cursor:pointer;font-size:13.5px;font-weight:600;list-style:none">${summary}</summary>
    <div style="padding:0 14px 14px;font-size:12.5px;color:#94a3b8;line-height:1.6">${bodyHtml}</div>
  </details>`;
}
function table(rows){
  return `<table style="width:100%;border-collapse:collapse;font-size:12.5px">
    ${rows.map(r=>`<tr>${r.map(c=>`<td style="padding:6px 4px;border-bottom:1px solid #0f172a55">${c}</td>`).join('')}</tr>`).join('')}
  </table>`;
}
function miniBar(label,done,total,emoji){
  const pct = total? Math.round(done/total*100):0;
  return `<div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px"><span>${emoji} ${label}</span><span style="color:#22c55e">${done}/${total}</span></div>
    <div style="height:6px;background:#0f172a;border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:6px;background:#22c55e"></div></div>
  </div>`;
}
function periodTabs(section){
  const current = viewState.period[section];
  return `<div style="display:flex;gap:6px;margin-bottom:10px">
    ${['daily','weekly','monthly'].map(p=>`
    <button data-period="${section}:${p}" style="flex:1;padding:8px;border-radius:8px;border:none;font-size:12px;font-weight:600;
    background:${current===p?'#22c55e':'#1e293b'};color:${current===p?'#02150a':'#94a3b8'}">${p.charAt(0).toUpperCase()+p.slice(1)}</button>`).join('')}
  </div>`;
}
function dateNav(section){
  const d = viewState.date[section];
  const atToday = d===today, atStart = d===state.startDate, atMax = d===previewMax;
  return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;background:#1e293b;padding:6px 8px;border-radius:10px">
    <button data-datenav="${section}:-1" ${atStart?'disabled':''} style="width:32px;height:36px;flex-shrink:0;background:none;border:none;color:${atStart?'#334155':'#22c55e'};font-size:18px;display:flex;align-items:center;justify-content:center">‹</button>
    <input type="date" data-dateinput="${section}" value="${d}" min="${state.startDate}" max="${previewMax}" style="flex:1;height:36px;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 8px;border-radius:6px;font-size:12.5px">
    <button data-datenav="${section}:1" ${atMax?'disabled':''} style="width:32px;height:36px;flex-shrink:0;background:none;border:none;color:${atMax?'#334155':'#22c55e'};font-size:18px;display:flex;align-items:center;justify-content:center">›</button>
    ${!atToday?`<button data-datenav="${section}:today" style="height:36px;flex-shrink:0;background:#334155;color:#fff;border:none;padding:0 10px;border-radius:6px;font-size:11px;white-space:nowrap">Today</button>`:''}
  </div>`;
}
function heatmap(dates, ratioFn, section){
  return `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">
    ${dates.map(d=>{
      const valid = d>=state.startDate && d<=today;
      let bg='transparent';
      if(valid){ const r=ratioFn(d); bg = r>=0.8?'#22c55e': r>=0.4?'#3f6212': r>0?'#334155':'#0f172a'; }
      return `<div ${valid?`data-jumpdate="${section}:${d}" title="${d}"`:''} style="aspect-ratio:1;border-radius:4px;${valid?'cursor:pointer;':''}background:${bg};border:1px solid #1e293b55"></div>`;
    }).join('')}
  </div>`;
}
function periodStats(dates, ratioFn){
  const valid = dates.filter(dd=>dd>=state.startDate && dd<=today);
  if(!valid.length) return {avg:0,practiced:0};
  const ratios = valid.map(ratioFn);
  return { avg: Math.round(ratios.reduce((a,b)=>a+b,0)/ratios.length*100), practiced: ratios.filter(r=>r>0).length };
}
function statsRow(stats){
  return `<div style="display:flex;gap:8px;margin-top:8px">
    <div style="flex:1;background:#1e293b;border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;color:#22c55e">${stats.avg}%</div><div style="font-size:10.5px;color:#64748b">avg completion</div></div>
    <div style="flex:1;background:#1e293b;border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;color:#22c55e">${stats.practiced}</div><div style="font-size:10.5px;color:#64748b">days active</div></div>
  </div>`;
}
function lineChart(points,color){
  const pts=[...points].sort((a,b)=>a.date<b.date?-1:1);
  if(pts.length<2) return `<div style="font-size:12.5px;color:#64748b">Add at least 2 entries to see a trend.</div>`;
  const w=280,h=90,pad=12;
  const vals=pts.map(p=>p.value);
  const min=Math.min(...vals)-2, max=Math.max(...vals)+2;
  const xStep=(w-2*pad)/(pts.length-1);
  const yFor=v=>h-pad-((v-min)/(max-min))*(h-2*pad);
  const path=pts.map((p,i)=>`${i===0?'M':'L'} ${pad+i*xStep} ${yFor(p.value)}`).join(' ');
  const dots=pts.map((p,i)=>`<circle cx="${pad+i*xStep}" cy="${yFor(p.value)}" r="3" fill="${color}"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;background:#0f172a;border-radius:8px"><path d="${path}" fill="none" stroke="${color}" stroke-width="2"/>${dots}</svg>`;
}

// =====================================================
// DASHBOARD
// =====================================================
function dashboard(){
  const section='dashboard';
  const period = viewState.period[section];
  const d = viewState.date[section];
  let body='';

  if(period==='daily'){
    const isToday = d===today;
    const phase = phaseForDay(dayNumberForDate(d));
    const fTotal = phase.yoga.length+phase.movement.length;
    const fDone = countDoneAt(d,'yoga',phase.yoga.length)+countDoneAt(d,'move',phase.movement.length);
    const mDone = countDoneAt(d,'meal',6);
    const gDone = countDoneAt(d,'groomd',GROOMING_DAILY.length);
    const kDone = countDoneAt(d,'mindd',MIND_DAILY.length);
    const score = scoreForDate(d);
    const plan = getPlan();

    body = `
      ${dateNav(section)}
      <div style="background:#1e293b;border-radius:14px;padding:16px;margin-bottom:12px;text-align:center">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">${isToday?"Today's score":'Score on '+fmtDate(new Date(d+'T00:00:00'))}</div>
        <div style="font-size:32px;color:#22c55e;font-weight:700;margin-top:4px">${score===null?'—':score}</div>
        ${score===null?`<div style="font-size:11px;color:#64748b;margin-top:2px">${d>today?"This day hasn't happened yet":'No data recorded for this day'}</div>`:''}
      </div>
      ${miniBar('Fitness',fDone,fTotal,'🏋️')}
      ${miniBar('Meals',mDone,6,'🍽')}
      ${miniBar('Grooming',gDone,GROOMING_DAILY.length,'🧴')}
      ${miniBar('Mind',kDone,MIND_DAILY.length,'🧠')}
      ${isToday ? `
        ${sectionTitle("Today's plan")}
        ${card("Meal",plan.meal)}
        ${card("Workout",plan.workout.join("<br>"))}
        ${card("Focus",plan.focus)}
        ${sectionTitle('Quick check-in')}
        <div>
        ${task("Workout","workout",15)}
        ${task("Steps","steps",10)}
        ${task("Meals / diet","diet",20)}
        ${task("Grooming","grooming",5)}
        ${task("Mind / knowledge","mind",10)}
        ${task("Posture","posture",5)}
        </div>
      ` : `<div style="font-size:12px;color:#64748b;margin-top:6px">Quick check-in is only for today. Visit each tab to log tasks for ${fmtDate(new Date(d+'T00:00:00'))}.</div>`}
    `;
  } else if(period==='weekly'){
    const dates = weekDatesFor(d);
    const scores = dates.map(x=> (x>=state.startDate && x<=today) ? scoreForDate(x) : null);
    const valid = scores.filter(s=>s!==null);
    const avg = valid.length? Math.round(valid.reduce((a,b)=>a+b,0)/valid.length):0;
    body = `
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">Week of ${fmtDate(new Date(dates[0]+'T00:00:00'))}</div>
      <div style="background:#1e293b;border-radius:12px;padding:12px;margin-bottom:12px">
        <div style="display:flex;align-items:flex-end;gap:5px;height:80px">
          ${dates.map((x,i)=>{
            const s=scores[i];
            const h = s===null?4:Math.max(4,Math.round((Math.min(s,100)/100)*80));
            const color = s===null?'#0f172a': s>=60?'#22c55e':'#475569';
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div title="${x}" ${s!==null?`data-jumpdate="dashboard:${x}"`:''} style="width:100%;height:${h}px;background:${color};border-radius:3px 3px 0 0;${s!==null?'cursor:pointer':''}"></div>
              <div style="font-size:9px;color:#64748b">${new Date(x+'T00:00:00').toLocaleDateString('en-IN',{weekday:'narrow'})}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:#1e293b;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;color:#22c55e">${avg}</div><div style="font-size:11px;color:#64748b">weekly avg score</div></div>
        <div style="background:#1e293b;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;color:#22c55e">${valid.filter(s=>s>=60).length}</div><div style="font-size:11px;color:#64748b">good days (60+)</div></div>
      </div>
    `;
  } else {
    const dates = last28DatesFor(d);
    body = `
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">Last 28 days ending ${fmtDate(new Date(d+'T00:00:00'))}</div>
      <div style="background:#1e293b;border-radius:12px;padding:12px;margin-bottom:12px">${heatmap(dates, combinedRatio, section)}</div>
      <div style="font-size:11px;color:#64748b">Tap a day to open it in Daily view.</div>
    `;
  }

  return `<div style="padding:16px">
    <button id="notifBtn" style="background:#22c55e;color:#02150a;padding:9px 14px;border-radius:10px;border:none;font-weight:600;margin-bottom:10px">Enable Notifications</button>
    ${sectionTitle('Dashboard')}
    ${periodTabs(section)}
    ${body}
  </div>`;
}
function task(label,key,xp){
  return `<div data-habit="${key}" data-xp="${xp}"
  style="padding:12px;margin-top:8px;border-radius:10px;cursor:pointer;
  background:${state.habits[key]?'#22c55e':'#1e293b'};color:${state.habits[key]?'#02150a':'#fff'};font-weight:${state.habits[key]?'600':'400'}">
    ${label} (+${xp})
  </div>`;
}

// =====================================================
// FITNESS TAB
// =====================================================
function vitalsField(label, id, extraAttrs, unit){
  return `<label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">${label}</label>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input id="${id}" ${extraAttrs} style="flex:1;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px">
      ${unit?`<div style="width:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#94a3b8;font-size:12px">${unit}</div>`:''}
    </div>`;
}
function vitalsForm(){
  return `<div style="background:#1e293b;border-radius:12px;padding:14px;margin-bottom:10px">
    ${vitalsField('Date','vDate',`type="date" value="${today}" max="${today}"`,null)}
    ${vitalsField('Heart rate','vHR','type="number" placeholder="e.g. 72"','bpm')}
    ${vitalsField('Steps','vSteps','type="number" placeholder="e.g. 6500"','steps')}
    ${vitalsField('Sleep','vSleep','type="number" step="0.1" placeholder="e.g. 7.5"','hours')}
    ${vitalsField('SpO2','vSpo2','type="number" placeholder="e.g. 98"','%')}
    <button id="saveVitalsBtn" style="width:100%;height:44px;background:#22c55e;color:#02150a;border-radius:8px;border:none;font-weight:600">Save vitals</button>
    <div style="font-size:10.5px;color:#64748b;margin-top:6px">Enter readings from your watch (Boat Chronos or any device) manually.</div>
  </div>`;
}
function vitalsHistory(){
  const logs = [...state.vitalsLogs].sort((a,b)=>a.date<b.date?1:-1);
  if(!logs.length) return `<div style="font-size:12.5px;color:#64748b">No vitals logged yet.</div>`;
  const hrPoints = logs.filter(l=>l.heartRate).map(l=>({date:l.date,value:l.heartRate}));
  return `
    ${hrPoints.length>1?lineChart(hrPoints,'#f87171'):''}
    <div style="background:#1e293b;border-radius:10px;padding:8px 12px;margin-top:8px">
      ${table([['Date','HR','Steps','Sleep','SpO2'], ...logs.slice(0,7).map(l=>[fmtDate(new Date(l.date+'T00:00:00')), l.heartRate||'—', l.steps||'—', l.sleepHours?l.sleepHours+'h':'—', l.spo2?l.spo2+'%':'—'])])}
    </div>`;
}
function fitnessTab(){
  const section='fitness';
  const period = viewState.period[section];
  const d = viewState.date[section];
  let checklistBody='';

  if(period==='daily'){
    const n = dayNumberForDate(d);
    const phase = phaseForDay(n);
    const log = getDayLog(d);
    checklistBody = `
      ${dateNav(section)}
      <div style="font-size:12px;color:#64748b;margin-bottom:6px">Day ${n} · ${phase.name}</div>
      ${sectionTitle('Yoga & breathing','01')}
      ${checklist(phase.yoga,'yoga',log,false)}
      ${sectionTitle('Movement','02')}
      ${checklist(phase.movement,'move',log,false)}
    `;
  } else if(period==='weekly'){
    const dates = weekDatesFor(d);
    checklistBody = `
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">Week of ${fmtDate(new Date(dates[0]+'T00:00:00'))}</div>
      <div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, fitnessRatio, section)}</div>
      ${statsRow(periodStats(dates, fitnessRatio))}
      <div style="font-size:11px;color:#64748b;margin-top:8px">Tap a day to open it.</div>
    `;
  } else {
    const dates = last28DatesFor(d);
    checklistBody = `
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">Last 28 days</div>
      <div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, fitnessRatio, section)}</div>
      ${statsRow(periodStats(dates, fitnessRatio))}
    `;
  }

  const streak = sectionStreak(['yoga','move'], dateStr=>{
    const phase = phaseForDay(dayNumberForDate(dateStr));
    return {yoga:phase.yoga.length, move:phase.movement.length};
  });
  const advice = fitnessAdvice(streak, phaseForDay(dayNumber()));

  return `<div style="padding:16px">
    ${sectionTitle('Fitness')}
    ${periodTabs(section)}
    ${checklistBody}

    ${sectionTitle('Streak & advice')}
    <div style="background:#1e293b;border-radius:12px;padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:20px">🔥</span><span style="font-size:18px;font-weight:700;color:#22c55e">${streak}</span><span style="font-size:12px;color:#64748b">day streak</span>
      </div>
      <div style="font-size:13px;color:#cbd5e1;line-height:1.5">${advice}</div>
    </div>

    ${sectionTitle('Vitals')}
    ${vitalsForm()}
    ${vitalsHistory()}

    ${sectionTitle('Past days')}
    ${fitnessHistoryList()}

    <div style="margin-top:10px;font-size:11.5px;color:#64748b">▶ Exercise demo videos — coming soon.</div>
  </div>`;
}

// =====================================================
// MEALS TAB
// =====================================================
function nutritionCalculator(){
  return `<div style="background:#1e293b;border-radius:12px;padding:14px;margin-bottom:10px">
    <label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">Food item</label>
    <input list="foodOptions" id="calcFood" value="${calcState.query}" placeholder="e.g. Paneer" style="width:100%;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px;margin-bottom:10px">
    <datalist id="foodOptions">${FOOD_DB.map(f=>`<option value="${f.name}">`).join('')}</datalist>

    <label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">Quantity</label>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input type="number" id="calcGrams" value="${calcState.grams}" placeholder="e.g. 100" style="flex:1;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px">
      <div style="width:60px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#94a3b8;font-size:13px">grams</div>
    </div>

    <div style="display:flex;gap:8px">
      <button id="calcBtn" style="flex:1;height:44px;background:#22c55e;color:#02150a;border-radius:8px;border:none;font-weight:600">Calculate</button>
      <button id="calcResetBtn" style="flex:1;height:44px;background:none;border:1px solid #334155;color:#94a3b8;border-radius:8px;font-weight:600">Reset</button>
    </div>
    ${calcState.error?`<div style="color:#f87171;font-size:12.5px;margin-top:10px">${calcState.error}</div>`:''}
    ${calcState.result?`<div style="margin-top:12px">
      <div style="font-size:13px;font-weight:600;margin-bottom:6px">${calcState.query} — ${calcState.grams} grams</div>
      ${table([
        ['Calories', calcState.result.cal+' kcal'],
        ['Protein', calcState.result.protein+' g'],
        ['Carbs', calcState.result.carbs+' g'],
        ['Fat', calcState.result.fat+' g'],
        ['Fiber', calcState.result.fiber+' g'],
        ['Calcium', calcState.result.calcium+' mg'],
        ['Iron', calcState.result.iron+' mg']
      ])}
    </div>`:''}
    <div style="font-size:10.5px;color:#64748b;margin-top:8px">Approximate reference values, not lab-precise.</div>
  </div>`;
}
function mealsTab(){
  const section='meals';
  const period = viewState.period[section];
  const d = viewState.date[section];
  let body='';

  if(period==='daily'){
    const rotation = MEAL_ROTATION[dowIndexForDate(d)];
    const log = getDayLog(d);
    const mealItems = [
      {t:rotation.breakfast, s:'Breakfast'},
      {t:rotation.mid, s:'Mid-morning'},
      {t:rotation.lunchDal, s:'Lunch — dal/curry'},
      {t:rotation.lunchSabzi, s:'Lunch — sabzi'},
      {t:rotation.evening, s:'Evening'},
      {t:rotation.dinner, s:'Dinner'}
    ];
    body = `${dateNav(section)}${sectionTitle("Today's meal plan")}${checklist(mealItems,'meal',log,false)}`;
  } else if(period==='weekly'){
    const dates = weekDatesFor(d);
    body = `<div style="font-size:12px;color:#64748b;margin-bottom:8px">Week of ${fmtDate(new Date(dates[0]+'T00:00:00'))}</div>
      <div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, mealsRatio, section)}</div>
      ${statsRow(periodStats(dates, mealsRatio))}`;
  } else {
    const dates = last28DatesFor(d);
    body = `<div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, mealsRatio, section)}</div>${statsRow(periodStats(dates, mealsRatio))}`;
  }

  return `<div style="padding:16px">
    ${sectionTitle('Meals')}
    ${periodTabs(section)}
    ${body}

    ${sectionTitle('Daily targets')}
    ${table([['Protein','~110–115g'],['Calcium','~1000mg'],['Iron','~17–18mg'],['Fiber','~30g']])}

    ${sectionTitle('Nutrition calculator')}
    ${nutritionCalculator()}

    ${sectionTitle('Reference')}
    ${details('Eating out — street food & pizza', `
      <p><b>Rule:</b> 1–2 planned outside meals a week, not daily.</p>
      <p><b>Street food:</b> sev puri/bhel over pani puri, dahi vada over vada pav, fresh nimbu paani over sugary lassi.</p>
      <p><b>Pizza:</b> thin crust, vegetable-heavy, paneer over extra cheese, salad instead of garlic bread.</p>
    `)}
    ${details('Vitamin B12 note', `Pure vegetarian diets commonly run low on B12. Worth a blood test or asking a doctor about a basic supplement.`)}
  </div>`;
}

// =====================================================
// GROOMING TAB
// =====================================================
function cycleCard(label, key, emoji, cycle){
  const next = addDays(cycle.last, cycle.interval);
  const today0 = new Date(today+'T00:00:00');
  const daysLeft = Math.ceil((next-today0)/86400000);
  const overdue = daysLeft<=0;
  return `<div style="background:#1e293b;border-radius:12px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:14px;font-weight:600">${emoji} ${label}</div>
      <div style="font-size:11px;color:${overdue?'#f87171':'#94a3b8'};margin-top:2px">${overdue?'Due now':daysLeft+' day'+(daysLeft===1?'':'s')+' left'} · every ${cycle.interval}d</div>
    </div>
    <button data-cycle="${key}" style="background:#22c55e;color:#02150a;border:none;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600">Mark done</button>
  </div>`;
}
function groomingTab(){
  const section='grooming';
  const period = viewState.period[section];
  const d = viewState.date[section];
  let body='';

  if(period==='daily'){
    const log = getDayLog(d);
    body = `${dateNav(section)}${checklist(GROOMING_DAILY,'groomd',log,false)}`;
  } else if(period==='weekly'){
    const wk = isoWeekKeyForDate(d);
    const weekLog = getWeekLog(wk);
    const dates = weekDatesFor(d);
    body = `
      ${sectionTitle("This week's tasks")}
      ${checklist(GROOMING_WEEKLY,'groomw',weekLog,true)}
      ${sectionTitle('Daily completion')}
      <div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, groomingRatio, section)}</div>
      ${statsRow(periodStats(dates, groomingRatio))}
    `;
  } else {
    const dates = last28DatesFor(d);
    body = `<div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, groomingRatio, section)}</div>${statsRow(periodStats(dates, groomingRatio))}`;
  }

  return `<div style="padding:16px">
    ${sectionTitle('Grooming')}

    ${sectionTitle('Grooming cycles')}
    ${cycleCard('Haircut','haircut','💇',state.groomingCycles.haircut)}
    ${cycleCard('Beard','beard','🧔',state.groomingCycles.beard)}

    ${periodTabs(section)}
    ${body}

    ${sectionTitle('More, coming soon')}
    <div style="background:#1e293b;border-radius:10px;padding:12px;font-size:12.5px;color:#94a3b8">Skin care routine and hair-removal scheduling (armpits, pubic) — we'll design these together next.</div>
  </div>`;
}

// =====================================================
// MIND / KNOWLEDGE TAB
// =====================================================
function goalsList(){
  if(!state.knowledgeGoals.length) return `<div style="font-size:12.5px;color:#64748b;margin-bottom:10px">No goals yet — add one below (e.g. finish a book by a date).</div>`;
  return state.knowledgeGoals.map(g=>{
    const icon = {Book:'📖',Podcast:'🎧',Course:'🎓',Other:'✳️'}[g.type]||'✳️';
    const endD = new Date(g.end+'T00:00:00'), today0 = new Date(today+'T00:00:00');
    const daysLeft = Math.max(1, Math.round((endD-today0)/86400000)+1);
    const remaining = Math.max(0, g.totalMinutes - g.completedMinutes);
    const pct = Math.min(100, Math.round((g.completedMinutes/g.totalMinutes)*100));
    const complete = g.done || remaining<=0;
    const dailyTarget = complete?0:Math.ceil(remaining/daysLeft);
    const overdue = !complete && today0 > endD;
    return `<div style="background:#1e293b;border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:14px;font-weight:600">${icon} ${g.title}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px">${fmtDate(new Date(g.start+'T00:00:00'))} → ${fmtDate(endD)}</div>
        </div>
        <button data-goal-del="${g.id}" style="background:none;border:1px solid #334155;color:#94a3b8;padding:4px 8px;border-radius:6px;font-size:11px">Delete</button>
      </div>
      <div style="height:8px;background:#0f172a;border-radius:4px;overflow:hidden;margin-top:10px">
        <div style="width:${pct}%;height:8px;background:${complete?'#22c55e':'#eab308'}"></div>
      </div>
      <div style="font-size:11px;color:#64748b;margin-top:4px">${g.completedMinutes}/${g.totalMinutes} min · ${pct}%</div>
      ${complete
        ? `<div style="margin-top:8px;font-size:12.5px;color:#22c55e;font-weight:600">✓ Goal complete</div>`
        : `<div style="margin-top:8px;font-size:12.5px;color:${overdue?'#f87171':'#cbd5e1'}">${overdue?'Overdue — ':''}~${dailyTarget} min/day to finish by ${fmtDate(endD)}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input type="number" id="goalMin-${g.id}" placeholder="Minutes today" style="flex:1;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px;font-size:13px">
          <button data-goal-log="${g.id}" style="height:44px;background:#22c55e;color:#02150a;border:none;padding:0 16px;border-radius:8px;font-weight:600;font-size:12.5px">Log</button>
        </div>`}
    </div>`;
  }).join('');
}
function addGoalForm(){
  return `<details style="background:#1e293b;border-radius:12px;margin-bottom:14px;overflow:hidden">
    <summary style="padding:12px 14px;cursor:pointer;font-size:13.5px;font-weight:600;list-style:none">+ Add a learning goal</summary>
    <div style="padding:0 14px 14px">
      <label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">Title</label>
      <input type="text" id="goalTitle" placeholder="e.g. Atomic Habits" style="width:100%;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px;margin-bottom:10px">

      <label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">Type</label>
      <select id="goalType" style="width:100%;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px;margin-bottom:10px">
        <option value="Book">Book</option>
        <option value="Podcast">Podcast series</option>
        <option value="Course">Course</option>
        <option value="Other">Other</option>
      </select>

      <label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">Start date</label>
      <input type="date" id="goalStart" value="${today}" style="width:100%;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px;margin-bottom:10px">

      <label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">Target finish date</label>
      <input type="date" id="goalEnd" style="width:100%;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px;margin-bottom:10px">

      <label style="display:block;font-size:11px;color:#64748b;margin-bottom:4px">Total time needed (optional estimate)</label>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <input type="number" id="goalTotal" placeholder="e.g. 480" style="flex:1;background:#0f172a;border:1px solid #334155;color:#fff;padding:0 12px;border-radius:8px">
        <div style="width:70px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#94a3b8;font-size:12px">minutes</div>
      </div>

      <button id="addGoalBtn" style="width:100%;height:44px;background:#22c55e;color:#02150a;border-radius:8px;border:none;font-weight:600">Add goal</button>
    </div>
  </details>`;
}
function mindTab(){
  const section='mind';
  const period = viewState.period[section];
  const d = viewState.date[section];
  let body='';

  if(period==='daily'){
    const log = getDayLog(d);
    body = `${dateNav(section)}${checklist(MIND_DAILY,'mindd',log,false)}`;
  } else if(period==='weekly'){
    const wk = isoWeekKeyForDate(d);
    const weekLog = getWeekLog(wk);
    const dates = weekDatesFor(d);
    body = `
      ${sectionTitle("This week's tasks")}
      ${checklist(MIND_WEEKLY,'mindw',weekLog,true)}
      ${sectionTitle('Daily completion')}
      <div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, mindRatio, section)}</div>
      ${statsRow(periodStats(dates, mindRatio))}
    `;
  } else {
    const dates = last28DatesFor(d);
    body = `<div style="background:#1e293b;border-radius:12px;padding:12px">${heatmap(dates, mindRatio, section)}</div>${statsRow(periodStats(dates, mindRatio))}`;
  }

  return `<div style="padding:16px">
    ${sectionTitle('Knowledge')}
    ${sectionTitle('Active goals')}
    ${goalsList()}
    ${addGoalForm()}
    ${periodTabs(section)}
    ${body}
  </div>`;
}

// =====================================================
// PROGRESS TAB
// =====================================================
function statsBlock(){
  const totalDays = state.history.length+1;
  const avg = state.history.length ? Math.round(state.history.reduce((s,h)=>s+h.score,0)/state.history.length) : state.score;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">
    <div style="background:#1e293b;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;color:#22c55e">${state.streak}</div><div style="font-size:11px;color:#64748b">current streak</div></div>
    <div style="background:#1e293b;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;color:#22c55e">${totalDays}</div><div style="font-size:11px;color:#64748b">days on Carely</div></div>
    <div style="background:#1e293b;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;color:#22c55e">${state.level}</div><div style="font-size:11px;color:#64748b">level</div></div>
    <div style="background:#1e293b;border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;color:#22c55e">${avg}</div><div style="font-size:11px;color:#64748b">avg daily score</div></div>
  </div>`;
}
function historyBars(){
  const hist = [...state.history].slice(-14);
  if(!hist.length) return `<div style="font-size:12.5px;color:#64748b">No history yet.</div>`;
  return `<div style="display:flex;align-items:flex-end;gap:4px;height:70px;margin-top:6px">
    ${hist.map(h=>{
      const height = Math.max(4, Math.round((Math.min(h.score,100)/100)*70));
      const color = h.score>=60?'#22c55e':'#475569';
      return `<div title="${h.date}: ${h.score}" style="flex:1;height:${height}px;background:${color};border-radius:3px 3px 0 0"></div>`;
    }).join('')}
  </div>`;
}
function progress(){
  const wLogs = [...state.weightLogs].sort((a,b)=> a.date<b.date?1:-1);
  const today0 = new Date(today+'T00:00:00');
  return `<div style="padding:16px">
    ${sectionTitle('Your numbers')}
    ${statsBlock()}

    ${sectionTitle('Score history (last 14 days)')}
    <div style="background:#1e293b;border-radius:10px;padding:12px">${historyBars()}</div>

    ${sectionTitle('Weight & waist')}
    <div style="background:#1e293b;border-radius:12px;padding:14px">
      ${vitalsField('Date','inDate',`type="date" value="${today}" max="${today}"`,null)}
      ${vitalsField('Weight','inWeight','type="number" step="0.1" placeholder="e.g. 72.4"','kg')}
      ${vitalsField('Waist','inWaist','type="number" step="0.1" placeholder="e.g. 88.5"','cm')}
      <button id="saveLogBtn" style="width:100%;height:44px;background:#22c55e;color:#02150a;border-radius:8px;border:none;font-weight:600">Save entry</button>
    </div>
    <div style="margin-top:10px">${lineChart(wLogs.filter(l=>l.weight).map(l=>({date:l.date,value:l.weight})), '#22c55e')}</div>
    ${wLogs.length?`<div style="margin-top:10px;background:#1e293b;border-radius:10px;padding:8px 12px">
      ${table([['Date','Weight','Waist'], ...wLogs.slice(0,10).map(l=>[fmtDate(new Date(l.date+'T00:00:00')), l.weight?l.weight+'kg':'—', l.waist?l.waist+'cm':'—'])])}
    </div>`:''}

    ${sectionTitle('Milestones')}
    <div style="background:#1e293b;border-radius:12px;padding:6px 14px">
      ${MILESTONES.map(m=>{
        const target = addDays(state.startDate, m.offset);
        const done = !!state.milestonesChecked[m.id];
        const overdue = !done && target < today0;
        return `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #0f172a55">
          <div data-milestone="${m.id}" style="width:20px;height:20px;border-radius:50%;flex-shrink:0;margin-top:2px;cursor:pointer;
            background:${done?'#22c55e':'#0f172a'};border:1.5px solid ${done?'#22c55e':'#334155'};display:flex;align-items:center;justify-content:center;font-size:11px;color:#02150a">${done?'✓':''}</div>
          <div>
            <div style="font-size:13.5px;font-weight:600">${m.title}</div>
            <div style="font-size:11px;color:${overdue?'#f87171':'#22c55e'};font-family:monospace">${fmtDate(target)}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px">${m.desc}</div>
          </div>
        </div>`;
      }).join('')}
    </div>

    ${sectionTitle('Progress photos')}
    <input type="file" id="photo" accept="image/*" style="color:#94a3b8;font-size:12.5px"/>
    <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
      ${state.photos.map(p=>`<img src="${p}" style="width:80px;height:80px;object-fit:cover;border-radius:8px">`).join("")}
    </div>
  </div>`;
}

// =====================================================
// NAV + ROUTER
// =====================================================
function nav(){
  return `<div style="position:fixed;bottom:10px;left:10px;right:10px;display:flex;justify-content:space-around;background:#020617;padding:12px;border-radius:16px;border:1px solid #1e293b">
    ${navItem("dashboard","🏠")}
    ${navItem("fitness","🏋️")}
    ${navItem("meals","🍽")}
    ${navItem("grooming","🧴")}
    ${navItem("mind","🧠")}
    ${navItem("progress","📈")}
  </div>`;
}
function navItem(p,i){ return `<div data-page="${p}" style="color:${state.page===p?'#22c55e':'#64748b'};font-size:20px">${i}</div>`; }
function screen(){
  if(state.page==="dashboard") return dashboard();
  if(state.page==="fitness") return fitnessTab();
  if(state.page==="meals") return mealsTab();
  if(state.page==="grooming") return groomingTab();
  if(state.page==="mind") return mindTab();
  if(state.page==="progress") return progress();
}

// =====================================================
// EVENTS
// =====================================================
function bind(){
  app.onclick = e => {
    const t = e.target.closest("[data-page],[data-habit],[data-milestone],[data-period],[data-datenav],[data-jumpdate],[data-cycle],[data-goal-log],[data-goal-del]");
    if(!t) return;

    if(t.dataset.page){ state.page=t.dataset.page; save(); render(); return; }

    if(t.dataset.habit){
      const k=t.dataset.habit, xp=parseInt(t.dataset.xp);
      state.habits[k]=!state.habits[k];
      state.score += state.habits[k]?10:-10;
      state.xp += state.habits[k]?xp:-xp;
      save(); render(); return;
    }

    if(t.dataset.milestone){
      state.milestonesChecked[t.dataset.milestone] = !state.milestonesChecked[t.dataset.milestone];
      save(); render(); return;
    }

    if(t.dataset.period){
      const [section,p] = t.dataset.period.split(':');
      viewState.period[section]=p; render(); return;
    }

    if(t.dataset.datenav){
      const [section,delta] = t.dataset.datenav.split(':');
      if(delta==='today') viewState.date[section]=today;
      else viewState.date[section] = clampDate(toDateStr(addDays(viewState.date[section], parseInt(delta))));
      render(); return;
    }

    if(t.dataset.jumpdate){
      const [section,d] = t.dataset.jumpdate.split(':');
      viewState.date[section]=d; viewState.period[section]='daily';
      render(); return;
    }

    if(t.dataset.cycle){
      state.groomingCycles[t.dataset.cycle].last = today;
      save(); render(); return;
    }

    if(t.dataset.goalLog){
      const id=t.dataset.goalLog;
      const input=document.getElementById('goalMin-'+id);
      const mins=parseFloat(input?.value);
      if(mins>0){
        const g=state.knowledgeGoals.find(x=>x.id===id);
        if(g){ g.completedMinutes+=mins; g.sessions=g.sessions||[]; g.sessions.push({date:today,minutes:mins}); save(); render(); }
      }
      return;
    }

    if(t.dataset.goalDel){
      state.knowledgeGoals = state.knowledgeGoals.filter(g=>g.id!==t.dataset.goalDel);
      save(); render(); return;
    }
  };

  app.onchange = e => {
    const cb = e.target.closest("input[data-log-key]");
    if(cb){
      const logObj = cb.dataset.logTarget==='week' ? getWeekLog(isoWeekKey()) : getDayLog(viewState.date[currentSectionFor(cb)] || today);
      logObj.tasks[cb.dataset.logKey] = cb.checked;
      save(); render(); return;
    }
    const dateIn = e.target.closest("input[data-dateinput]");
    if(dateIn){
      const section = dateIn.dataset.dateinput;
      viewState.date[section] = clampDate(dateIn.value);
      render(); return;
    }
  };

  const notifBtn=document.getElementById("notifBtn");
  if(notifBtn) notifBtn.onclick=requestNotification;

  const saveLogBtn = document.getElementById("saveLogBtn");
  if(saveLogBtn){
    saveLogBtn.onclick = () => {
      const date = document.getElementById("inDate").value || today;
      const weight = parseFloat(document.getElementById("inWeight").value);
      const waist = parseFloat(document.getElementById("inWaist").value);
      if(!weight && !waist) return;
      const idx = state.weightLogs.findIndex(l=>l.date===date);
      const entry = { date, weight: weight||null, waist: waist||null };
      if(idx>=0) state.weightLogs[idx]=entry; else state.weightLogs.push(entry);
      save(); render();
    };
  }

  const saveVitalsBtn = document.getElementById("saveVitalsBtn");
  if(saveVitalsBtn){
    saveVitalsBtn.onclick = () => {
      const date = document.getElementById("vDate").value || today;
      const heartRate = parseFloat(document.getElementById("vHR").value) || null;
      const steps = parseFloat(document.getElementById("vSteps").value) || null;
      const sleepHours = parseFloat(document.getElementById("vSleep").value) || null;
      const spo2 = parseFloat(document.getElementById("vSpo2").value) || null;
      if(!heartRate && !steps && !sleepHours && !spo2) return;
      const idx = state.vitalsLogs.findIndex(l=>l.date===date);
      const entry = { date, heartRate, steps, sleepHours, spo2 };
      if(idx>=0) state.vitalsLogs[idx]=entry; else state.vitalsLogs.push(entry);
      save(); render();
    };
  }

  const addGoalBtn = document.getElementById("addGoalBtn");
  if(addGoalBtn){
    addGoalBtn.onclick = () => {
      const title = document.getElementById('goalTitle').value.trim();
      const type = document.getElementById('goalType').value;
      const start = document.getElementById('goalStart').value;
      const end = document.getElementById('goalEnd').value;
      let total = parseFloat(document.getElementById('goalTotal').value);
      if(!title || !start || !end) return;
      if(!total || total<=0){ total = {Book:480,Podcast:180,Course:600,Other:300}[type] || 300; }
      state.knowledgeGoals.push({ id:'g'+Date.now(), title, type, start, end, totalMinutes: total, completedMinutes:0, sessions:[], done:false });
      save(); render();
    };
  }

  const calcBtn=document.getElementById('calcBtn');
  if(calcBtn){
    calcBtn.onclick=()=>{
      const q=document.getElementById('calcFood').value;
      const g=parseFloat(document.getElementById('calcGrams').value)||100;
      const food=findFood(q);
      calcState.query=q; calcState.grams=g;
      if(food){ calcState.result=scaleFood(food,g); calcState.error=null; }
      else { calcState.result=null; calcState.error='Item not found — try a different name.'; }
      render();
    };
  }
  const calcResetBtn=document.getElementById('calcResetBtn');
  if(calcResetBtn){ calcResetBtn.onclick=()=>{ calcState={query:'',grams:100,result:null,error:null}; render(); }; }

  const photoInput=document.getElementById("photo");
  if(photoInput){
    photoInput.onchange=e=>{
      const r=new FileReader();
      r.onload=()=>{ state.photos.push(r.result); save(); render(); };
      r.readAsDataURL(e.target.files[0]);
    };
  }
}
// map a checkbox back to which tab's date it belongs to, based on its key prefix
function currentSectionFor(cb){
  const key = cb.dataset.logKey || '';
  if(key.startsWith('yoga')||key.startsWith('move')) return 'fitness';
  if(key.startsWith('meal')) return 'meals';
  if(key.startsWith('groom')) return 'grooming';
  if(key.startsWith('mind')) return 'mind';
  return state.page;
}

// =====================================================
// RENDER
// =====================================================
function render(){
  app.innerHTML = `<div style="min-height:100vh;background:#020617;color:white;padding-bottom:90px">
    ${header()}
    ${screen()}
    ${nav()}
  </div>`;
  bind();
}

render();
