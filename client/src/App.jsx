import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Portfolio from "./pages/Portfolio/Portfolio";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import TermsOfService from "./pages/Legal/TermsOfService";
import Dashboard from "./pages/Dashboard/Dashboard";
import AssessmentHub from "./pages/Career/Assessments/AssessmentHub";
import AssessmentFaculty from "./pages/Career/Assessments/AssessmentFaculty";
import AssessmentBranches from "./pages/Career/Assessments/AssessmentBranches";
import AssessmentBranchTests from "./pages/Career/Assessments/AssessmentBranchTests";
import AssessmentTest from "./pages/Career/Assessments/AssessmentTest";

import ITServices from "./pages/Services/ITServices";
import ITSupport from "./pages/Services/ITSupport";
import ITConsulting from "./pages/Services/ITConsulting";
import AIAutomation from "./pages/Services/AIAutomation";
import UIUX from "./pages/Services/UIUX";
import Cloud from "./pages/Services/Cloud";

import Internships from "./pages/Career/Internships/Internships";
import InternshipDetail from "./pages/Career/Internships/InternshipDetail";
import Placements from "./pages/Career/Placements/Placements";
import DSAHub from "./pages/Career/DSA/DSAHub";
import { ResumeGallery, ResumeTemplateDetail } from "./pages/Career/Resume/ResumeWorkspace";
import ATSResumeBuilder from "./pages/Career/Resume/ATSResumeBuilder";
import ResumeAnalyzer from "./pages/Career/Resume/ResumeAnalyzer";
import OverleafDashboard from "./pages/Career/Resume/OverleafDashboard";
import OverleafEditor from "./pages/Career/Resume/OverleafEditor";

import Courses from "./pages/Learning/Courses/Courses";
import CoursePlayer from "./pages/Learning/Courses/CoursePlayer";
import Roadmaps from "./pages/Learning/Roadmaps/Roadmaps";
import RoadmapDetail from "./pages/Learning/Roadmaps/RoadmapDetail";
import Resources from "./pages/Learning/Resources/Resources";
import Achievements from "./pages/Achievements/Achievements";
import CertificateDetails from "./pages/Achievements/CertificateDetails";
import CertificateVerification from "./pages/Verification/CertificateVerification";
import AdminCertificates from "./pages/Admin/AdminCertificates";
import AdminDocuments from "./pages/Admin/AdminDocuments";

import Events from "./pages/Community/Events/Events";
import Ambassador from "./pages/Community/Ambassador/Ambassador";
import Hackathons from "./pages/Community/Hackathons";
import HackathonDetail from "./pages/Community/HackathonDetail";
import AIHackathons from "./pages/Community/AIHackathons";
import HackathonDashboard from "./pages/Community/HackathonDashboard";
import MyHackathons from "./pages/Community/MyHackathons";
import HackathonWorkspace from "./pages/Community/HackathonWorkspace";
import HackathonPortalStatus from "./pages/Community/HackathonPortalStatus";
import HackathonLayout from "./components/hackathons/HackathonLayout";
import HackathonLogin from "./pages/Community/HackathonLogin";
import HackathonRegister from "./pages/Community/HackathonRegister";
import HackathonParticipantProfile from "./pages/Community/HackathonParticipantProfile";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Dedicated full-screen examination portal without Navbar or Footer */}
          <Route
            path="/assessment/test/:testId"
            element={<AssessmentTest />}
          />
          <Route path="/career/resume/editor/:projectId" element={<OverleafEditor />} />

          <Route element={<HackathonLayout />}>
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/hackathons/all" element={<Hackathons />} />
            <Route path="/hackathons/login" element={<HackathonLogin />} />
            <Route path="/hackathons/register" element={<HackathonRegister />} />
            <Route path="/hackathons/profile" element={<HackathonParticipantProfile />} />
            <Route path="/hackathons/my-registrations" element={<MyHackathons />} />
            <Route path="/hackathons/dashboard" element={<HackathonDashboard />} />
            <Route path="/hackathons/submissions" element={<HackathonPortalStatus title="My submissions" description="Submission activity across your hackathon workspaces." />} />
            <Route path="/hackathons/:slug/register" element={<HackathonWorkspace />} />
            <Route path="/hackathons/:slug/workspace" element={<HackathonWorkspace />} />
            <Route path="/hackathons/:slug/workspace/:tab" element={<HackathonWorkspace />} />
            <Route path="/hackathons/:slug" element={<HackathonDetail />} />
            <Route path="/hackathons/*" element={<NotFound />} />
            <Route path="/community/hackathons" element={<Hackathons />} />
            <Route path="/community/hackathons/all" element={<Hackathons />} />
            <Route path="/community/hackathons/dashboard" element={<HackathonDashboard />} />
            <Route path="/community/hackathons/:slug" element={<HackathonDetail />} />
            <Route path="/community/hackathon-dashboard" element={<HackathonDashboard />} />
            <Route path="/community/my-hackathons" element={<MyHackathons />} />
            <Route path="/community/hackathon-workspace/:slug" element={<HackathonWorkspace />} />
            <Route path="/community/hackathon-workspace/:slug/:tab" element={<HackathonWorkspace />} />
            <Route path="/community/hackathons/:slug/workspace" element={<HackathonWorkspace />} />
            <Route path="/community/hackathons/:slug/workspace/:tab" element={<HackathonWorkspace />} />
            <Route path="/community/ai-hackathons" element={<AIHackathons />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/credentials" element={<AdminCertificates />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/verify/:token" element={<CertificateVerification />} />
            <Route path="/assessments" element={<AssessmentHub />} />
            <Route path="/assessment" element={<AssessmentHub />} />
            <Route path="/assessment/student" element={<AssessmentBranches />} />
            <Route path="/assessment/faculty" element={<AssessmentFaculty />} />
            <Route
              path="/assessment/branch/:branchId"
              element={<AssessmentBranchTests />}
            />

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
              path="/career/internships/:id"
              element={<InternshipDetail />}
            />
            <Route
              path="/internships"
              element={<Internships />}
            />
            <Route
              path="/internships/:id"
              element={<InternshipDetail />}
            />
            <Route
              path="/career/placements"
              element={<Placements />}
            />
            <Route path="/career/dsa" element={<DSAHub />} />
            <Route
              path="/career/resume"
              element={<ResumeGallery />}
            />
            <Route path="/career/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/career/resume/templates/:templateId" element={<ResumeTemplateDetail />} />
            <Route path="/career/resume/create" element={<ATSResumeBuilder />} />
            <Route path="/career/resume/projects" element={<OverleafDashboard />} />
            <Route
              path="/career/interviews"
              element={<Contact />}
            />

            <Route
              path="/learning/courses"
              element={<Courses />}
            />
            <Route
              path="/learning/courses/:courseId"
              element={<CoursePlayer />}
            />
            <Route
              path="/courses"
              element={<Courses />}
            />
            <Route
              path="/courses/:courseId"
              element={<CoursePlayer />}
            />
            <Route
              path="/learning/roadmaps"
              element={<Roadmaps />}
            />
            <Route
              path="/learning/roadmaps/:roadmapId"
              element={<RoadmapDetail />}
            />
            <Route
              path="/roadmaps/:roadmapId"
              element={<RoadmapDetail />}
            />
            <Route
              path="/learning/resources"
              element={<Resources />}
            />
            <Route
              path="/resources"
              element={<Resources />}
            />
            <Route
              path="/learning/certifications"
              element={<Achievements />}
            />
            <Route path="/learning/certifications/:id" element={<CertificateDetails />} />

            <Route
              path="/community/events"
              element={<Events />}
            />
            <Route
              path="/community/ambassador"
              element={<Ambassador />}
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
