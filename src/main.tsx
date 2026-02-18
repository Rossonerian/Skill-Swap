import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (import.meta.env.DEV) {
	import("./dev/localDbSync").catch((e) => console.error("dev localDb sync failed", e));
}

createRoot(document.getElementById("root")!).render(<App />);
