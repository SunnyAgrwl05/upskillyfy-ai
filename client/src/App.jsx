import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ITServices from "./pages/Services/ITServices";
import ITSupport from "./pages/Services/ITSupport";
import ITConsulting from "./pages/Services/ITConsulting";
import AIAutomation from "./pages/Services/AIAutomation";
import UIUX from "./pages/Services/UIUX";
import Cloud from "./pages/Services/Cloud";

import Internships from "./pages/Career/Internships";
import Placements from "./pages/Career/Placements";
import DSAHub from "./pages/Career/DSAHub";
import ResumeBuilder from "./pages/Career/ResumeBuilder";

import Courses from "./pages/Learning/Courses";
import Roadmaps from "./pages/Learning/Roadmaps";
import Resources from "./pages/Learning/Resources";

import Events from "./pages/Community/Events";
import Ambassador from "./pages/Community/Ambassador";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/services/it-services"
              element={<ITServices />}
            />
            <Route
              path="/services/it-support"
              element={<ITSupport />}
            />
            <Route
              path="/services/it-consulting"
              element={<ITConsulting />}
            />
            <Route
              path="/services/ai-automation"
              element={<AIAutomation />}
            />
            <Route path="/services/uiux" element={<UIUX />} />
            <Route path="/services/cloud" element={<Cloud />} />

            <Route
              path="/career/internships"
              element={<Internships />}
            />
            <Route
              path="/career/placements"
              element={<Placements />}
            />
            <Route path="/career/dsa" element={<DSAHub />} />
            <Route
              path="/career/resume"
              element={<ResumeBuilder />}
            />
            <Route
              path="/career/interviews"
              element={<Contact />}
            />

            <Route
              path="/learning/courses"
              element={<Courses />}
            />
            <Route
              path="/learning/roadmaps"
              element={<Roadmaps />}
            />
            <Route
              path="/learning/resources"
              element={<Resources />}
            />
            <Route
              path="/learning/certifications"
              element={<Resources />}
            />

            <Route
              path="/community/events"
              element={<Events />}
            />
            <Route
              path="/community/ambassador"
              element={<Ambassador />}
            />
            <Route
              path="/community/hackathons"
              element={<Events />}
            />
            <Route
              path="/community/opensource"
              element={<Events />}
            />

            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}