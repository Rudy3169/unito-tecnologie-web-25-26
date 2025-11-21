import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./home.tsx"
import Catalog from "./catalog.tsx";
import "./styles/home.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Home />
    </React.StrictMode>
);