import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthListener } from "./components/auth/AuthListener";

export default function App() {
  return (
    <BrowserRouter>
      <AuthListener />
      <AppRoutes />
    </BrowserRouter>
  );
}
