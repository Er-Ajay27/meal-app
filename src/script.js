const API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
let favorites = [];
const favoritesData = localStorage.getItem("favorites");

if (favoritesData) {
  try {
    favorites = JSON.parse(favoritesData);
  } catch (error) {
    console.error("Error parsing favorites from local storage:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById("search");

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value;
      if (query) {
        fetch(`${API_URL}${query}`)
          .then((response) => response.json())
          .then((data) => displayResults(data.meals));
      } else {
        document.getElementById("results").innerHTML = "";
      }
    });
  }

  // Load meal details if on meal page
  if (document.getElementById("meal-name")) {
    const params = new URLSearchParams(window.location.search);
    const mealId = params.get("id");

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
      .then((response) => response.json())
      .then((data) => {
        const meal = data.meals[0];
        document.getElementById("meal-name").innerHTML = meal.strMeal;
        document.getElementById("meal-photo").src = meal.strMealThumb;
        document.getElementById("instructions").innerHTML = meal.strInstructions;
        document.getElementById("add-favorite").onclick = () => {
          addToFavorites(mealId);
          alert(`${meal.strMeal} has been added to favorites!`);
        };
      });
  }

  // Load favorite meals if on favorites page
  if (document.getElementById("favorite-meals")) {
    const favoriteMealsDiv = document.getElementById("favorite-meals");
    favorites.forEach((mealId) => {
      fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then((response) => response.json())
        .then((data) => {
          const meal = data.meals[0]; // Fixed from data.meal[0] to data.meals[0]
          const mealDiv = document.createElement("div");
          mealDiv.className = "card mb-3";
          mealDiv.innerHTML = `
              <div class="card-body">
                  <h5 class="card-title">${meal.strMeal}</h5>
                  <button class="btn btn-danger" onclick="removeFromFavorites('${mealId}')">Remove</button>
              </div>
          `;
          favoriteMealsDiv.appendChild(mealDiv);
        });
    });
  }
});

// Function to display search results
function displayResults(meals) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!meals) return;

  meals.forEach((meal) => {
    const mealDiv = document.createElement("div");
    mealDiv.className = "card mb-3";
    mealDiv.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${meal.strMeal}</h5>
            <button class="btn btn-warning" onclick="addToFavorites('${meal.idMeal}')">Favorite</button>
            <a href="meal.html?id=${meal.idMeal}" class="btn btn-info">Details</a>
        </div>
    `;
    resultsDiv.appendChild(mealDiv);
  });
}

// Function to add a meal to favorites
function addToFavorites(mealId) {
  if (!favorites.includes(mealId)) {
    favorites.push(mealId);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

// Function to remove a meal from favorites
function removeFromFavorites(mealId) {
  favorites = favorites.filter((id) => id !== mealId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  location.reload(); // Refresh to update the display
}
