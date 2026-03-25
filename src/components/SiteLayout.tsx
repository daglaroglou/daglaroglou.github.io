import { Outlet } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";

const SiteLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
};

export default SiteLayout;
