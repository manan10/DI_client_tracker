import React, { lazy } from "react";
import { Route } from "react-router-dom";
import ExpenseTrackerLayout from "./layouts/ExpenseTrackerLayout";

const ExpenseDashboard = lazy(() => import("./pages/ExpenseDashboard"));
const ExpenseAnalytics = lazy(() => import("./pages/ExpenseAnalytics"));
const ExpenseHistory = lazy(() => import("./pages/ExpenseHistory"));
const ExpenseSettings = lazy(() => import("./pages/ExpenseSettings"));

export const renderExpenseTrackerRoutes = (ProtectedRoute) => (
  <>
    <Route
      element={
        <ProtectedRoute>
          <ExpenseTrackerLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/expenses" element={<ExpenseDashboard />} />
      <Route path="/expenses/analytics" element={<ExpenseAnalytics />} />
      <Route path="/expenses/history" element={<ExpenseHistory />} />
    </Route>

    <Route
      path="/expenses/settings"
      element={
        <ProtectedRoute>
          <ExpenseSettings />
        </ProtectedRoute>
      }
    />
  </>
);