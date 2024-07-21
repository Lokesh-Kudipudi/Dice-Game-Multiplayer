import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App></App>}>
        <Route path="/:id" element={<App></App>}></Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
