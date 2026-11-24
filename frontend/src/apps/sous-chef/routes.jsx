import React, { lazy } from "react";
import { Route } from "react-router-dom";

const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const CookMode = lazy(() => import("./pages/CookMode"));

export const renderSousChefRoutes = (ProtectedRoute) => (
  <>
    <Route
      path="/sous-chef/recipes"
      element={
        <ProtectedRoute>
          <Recipes />
        </ProtectedRoute>
      }
    />
    <Route
      path="/sous-chef/recipes/cook-mode"
      element={
        <ProtectedRoute>
          <CookMode />
        </ProtectedRoute>
      }
    />
    <Route
      path="/sous-chef/recipes/:id"
      element={
        <ProtectedRoute>
          <RecipeDetail />
        </ProtectedRoute>
      }
    />
  </>
);