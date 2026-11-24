import React, { lazy } from "react";
import { Route } from "react-router-dom";

const ShowRaterHome = lazy(() => import("./pages/ShowRaterHome"));
const Lists = lazy(() => import("./pages/Lists"));
const Stats = lazy(() => import("./pages/Stats"));
const Catalog = lazy(() => import("./pages/Catalog"));
const ListDetail = lazy(() => import("./pages/ListDetail"));

export const renderTvRankerRoutes = (ProtectedRoute) => (
  <>
    <Route
      path="/tv-rater"
      element={
        <ProtectedRoute>
          <ShowRaterHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tv-rater/lists"
      element={
        <ProtectedRoute>
          <Lists />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tv-rater/lists/:id"
      element={
        <ProtectedRoute>
          <ListDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tv-rater/stats"
      element={
        <ProtectedRoute>
          <Stats />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tv-rater/catalog"
      element={
        <ProtectedRoute>
          <Catalog />
        </ProtectedRoute>
      }
    />
  </>
);