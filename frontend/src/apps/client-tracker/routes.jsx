import React, { lazy } from "react";
import { Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const ClientDirectory = lazy(() => import("./pages/ClientDirectory"));
const ClientSettings = lazy(() => import("./pages/ClientSettings"));
const Accounts = lazy(() => import("./pages/Accounts"));
const ClientDetail = lazy(() => import("./pages/ClientDetail"));
const Operations = lazy(() => import("./pages/Operations"));
const Tools = lazy(() => import("./pages/Tools"));
const MaintenanceView = lazy(() => import("./pages/MaintenanceView"));
const TallyDebtorTest = lazy(() => import("./pages/TallyDebtorTest"));
const TallyTest = lazy(() => import("./pages/TallyTest"));

export const renderClientTrackerRoutes = (ProtectedRoute) => (
  <>
    <Route path="/tally-test" element={<TallyTest />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      }
    />
    <Route
      path="/directory"
      element={
        <ProtectedRoute>
          <ClientDirectory />
        </ProtectedRoute>
      }
    />
    <Route
      path="/client/:id"
      element={
        <ProtectedRoute>
          <ClientDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tasks"
      element={
        <ProtectedRoute>
          <Operations />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tools"
      element={
        <ProtectedRoute>
          <Tools />
        </ProtectedRoute>
      }
    />
    <Route
      path="/accounts"
      element={
        <ProtectedRoute>
          <Accounts />
        </ProtectedRoute>
      }
    />
    <Route
      path="/client/settings"
      element={
        <ProtectedRoute>
          <ClientSettings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/documents"
      element={
        <ProtectedRoute>
          <MaintenanceView />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tally-debtor-test"
      element={
        <ProtectedRoute>
          <TallyDebtorTest />
        </ProtectedRoute>
      }
    />
  </>
);