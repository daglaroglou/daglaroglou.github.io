import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "react-day-picker/style.css";

createRoot(document.getElementById("root")!).render(<App />);
