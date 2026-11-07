import { useLocation, Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isResumeEditor = pathname.startsWith("/career/resume/editor/");

  if (isResumeEditor) {
    return (
      <>
        <main className="resume-editor-page">
          <Outlet />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-wrap">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
