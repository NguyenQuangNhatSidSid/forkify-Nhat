import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) {
      return;
    }

    recipeView.renderSpinner();

    //0 updating results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1 Update bookmark view
    bookmarksView.update(model.state.bookmarks);

    //2 loading recipe
    await model.loadRecipe(id);
    // const { recipe } = model.state;

    //3 rendering recipe
    recipeView.render(model.state.recipe);
    // console.log(recipe);
  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearcjResults = async function () {
  try {
    //load
    resultsView.renderSpinner();

    // 1 Get search Query
    const query = searchView.getQuery();
    if (!query) return;

    //2 load search results
    await model.loadSearchResults(query);

    // 3 Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4  Render initial pagination button
    paginationView.render(model.state.search);
  } catch (error) {
    console.error(error);
  }
};
// controlSearcjResults();
// controlRecipes();
const controlPagination = function (goToPage) {
  // 1 Render new results

  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2  Render new initial pagination button
  paginationView.render(model.state.search);
};
const controlServings = function (newServings) {
  //Update the recipe serving( in state)
  model.updateServings(newServings);

  //Update the recipe view as well
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};
// window.addEventListener('hashchange', controlRecipes);

//controler for adding new book mark
const controlAddBookmark = function () {
  // 1 add and remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2 update recipeview after book mark
  recipeView.update(model.state.recipe);

  // 3 render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();
    //Upload recipe
    await model.uploadRecipe(newRecipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //Render Bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('This is Error: ', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearcjResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpLoad(controlAddRecipe);
};
init();
