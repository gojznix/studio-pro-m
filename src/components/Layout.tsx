import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Layout = () => (
  <div className="min-h-screen bg-zinc-950 text-white">
    <Header />
    <main>
      <Outlet />
    </main>
  </div>
);
