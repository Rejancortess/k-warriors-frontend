import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./contexts/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
import { AuthListener } from "./components/auth/AuthListener";

export default function App() {
  return (
    <BrowserRouter>
      <AuthListener />
      <AppRoutes />
    </BrowserRouter>
  );
}
