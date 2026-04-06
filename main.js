if (state.page === "food") {

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
    burger: { p: 12, c: 30, f: 12, cal: 295 },
    fries: { p: 3, c: 41, f: 15, cal: 312 },
    sandwich: { p: 8, c: 26, f: 6, cal: 200 }
  };

  const foodKeys = Object.keys(foodDB);

  content = `
    <div class="bg-white/10 p-4 rounded-2xl shadow">

      <!-- SEARCH -->
      <input id="foodSearch" 
        oninput="showSuggestions(this.value)"
        class="text-black p-3 w-full mb-2 rounded"
        placeholder="Search food (paneer, pizza...)"/>

      <!-- SUGGESTIONS -->
      <div id="suggestions" class="mb-3"></div>

      <!-- QUANTITY -->
      <input id="quantityInput" 
        class="text-black p-3 w-full mb-3 rounded"
        placeholder="Quantity (grams)"/>

      <button onclick="addFoodNew()"
        class="bg-blue-500 w-full p-3 rounded mb-3">
        Add Food
      </button>

      ${state.foods.map((f, i) => `
        <div class="bg-black/30 p-3 mb-2 rounded flex justify-between items-center">
          <div>
            ${f.name} (${f.qty}g)<br/>
            Protein: ${f.p}g | Carbs: ${f.c}g | Fat: ${f.f}g
          </div>
          <button onclick="removeFood(${i})" class="text-red-400">✕</button>
        </div>
      `).join("")}

      <div class="mt-3 font-bold">
        Protein: ${totals.p}g | Carbs: ${totals.c}g | Fat: ${totals.f}g
      </div>
    </div>
  `;

  window.showSuggestions = function(value) {
    const list = foodKeys
      .filter(f => f.includes(value.toLowerCase()))
      .slice(0,5);

    document.getElementById("suggestions").innerHTML =
      list.map(f => `
        <div onclick="selectFood('${f}')"
          class="bg-gray-800 p-2 mb-1 rounded cursor-pointer">
          ${f}
        </div>
      `).join("");
  };

  window.selectFood = function(food) {
    document.getElementById("foodSearch").value = food;
    document.getElementById("suggestions").innerHTML = "";
  };

  window.addFoodNew = function() {
    const food = document.getElementById("foodSearch").value.toLowerCase();
    const qty = parseInt(document.getElementById("quantityInput").value) || 100;

    const data = foodDB[food];
    if (!data) return;

    const factor = qty / 100;

    state.foods.push({
      name: food,
      qty: qty,
      p: Math.round(data.p * factor),
      c: Math.round(data.c * factor),
      f: Math.round(data.f * factor)
    });

    document.getElementById("foodSearch").value = "";
    document.getElementById("quantityInput").value = "";

    save();
    render();
  };

  window.removeFood = function(index) {
    state.foods.splice(index, 1);
    save();
    render();
  };
}
