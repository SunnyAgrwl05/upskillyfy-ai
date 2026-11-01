import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ScrollTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function MainLayout() {
  const { pathname } = useLocation();
  const isResumeEditor = pathname.startsWith("/career/resume/editor/");

  if (isResumeEditor) {
    return (
      <>
        <ScrollTop />
        <main className="resume-editor-page">
          <Outlet />
        </main>
      </>
    );
  }

  return (
    <>
      <ScrollTop />

      <Navbar />

      <main className="page-wrap">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

