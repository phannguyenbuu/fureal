import React from "react";
import HomePage from "../pages/HomePage/HomePage";
import TransitionComponent from "../components/Transition";
import AboutPage from "../pages/AboutPage/AboutPage";
import DevWorkPage from "../pages/DevWorkPage/DevWorkPage";
import DesignWorkPage from "../pages/DesignWorkPage/DesignWorkPage";
import EditGLBPage from "../pages/EditGLBPage/EditGLBPage";  // ✅ New page
import { Route, Routes } from "react-router";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

const Router = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <TransitionComponent>
            <HomePage />
          </TransitionComponent>
        }
      />
      <Route
        path="about"
        element={
          <TransitionComponent>
            {/* <AboutPage /> */}
          </TransitionComponent>
        }
      />
      <Route
        path="dev-work"
        element={
          <TransitionComponent>
            {/* <DevWorkPage /> */}
          </TransitionComponent>
        }
      />
      <Route
        path="design-work"
        element={
          <TransitionComponent>
            {/* <DesignWorkPage /> */}
          </TransitionComponent>
        }
      />
      <Route path="edit/:modelGroup/:modelFile" element={<EditGLBPage />} />
      {/* ✅ Quick preview route */}
      <Route path="preview/:modelName" element={<EditGLBPage previewOnly />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;
