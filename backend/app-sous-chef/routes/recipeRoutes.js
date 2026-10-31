const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect } = require('../../authentication/authmiddleware'); // Matches your protect middleware

// Enforce auth across all recipe endpoints
router.use(protect);

// Smart Pantry Suggester
router.post('/suggest', recipeController.suggestRecipes);
// Ai Integration
router.post('/parse', recipeController.parseRawRecipe);

// Standard CRUD & Portion Scaler
router.get('/', recipeController.getRecipes);
router.post('/', recipeController.createRecipe);
router.get('/:id', recipeController.getRecipeById);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);



module.exports = router;