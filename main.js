const app = document.getElementById("app");

let score = 0;

const habits = ["Breakfast", "Lunch", "Dinner", "Protein", "Workout", "Steps"];

function render() {
  app.innerHTML = `
    <div class="p-4">
      <h1 class="text-2xl font-bold">Carely</h1>
      <p class="mb-2">❤️🏆 Score: ${score}</p>

      <div class="grid grid-cols-2 gap-2">
        ${habits
          .map(
            (h) => `
          <button onclick="toggle('${h}')"
            class="border p-2 rounded">
            ${h}
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

window.toggle = function () {
  score += 5;
  render();
};

render();

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
