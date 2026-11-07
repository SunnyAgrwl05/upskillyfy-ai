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
import AssessmentBranches from "./pages/AssessmentBranches";
import AssessmentBranchTests from "./pages/AssessmentBranchTests";
import AssessmentTest from "./pages/AssessmentTest";

import ITServices from "./pages/Services/ITServices";
import ITSupport from "./pages/Services/ITSupport";
import ITConsulting from "./pages/Services/ITConsulting";
import AIAutomation from "./pages/Services/AIAutomation";
import UIUX from "./pages/Services/UIUX";
import Cloud from "./pages/Services/Cloud";

import Internships from "./pages/Career/Internships";
import Placements from "./pages/Career/Placements";
import DSAHub from "./pages/Career/DSAHub";
import { ResumeEditor, ResumeGallery, ResumeProjects, ResumeTemplateDetail } from "./pages/Career/ResumeWorkspace";
import OverleafDashboard from "./pages/Career/OverleafDashboard";
import ATSResumeBuilder from "./pages/Career/ATSResumeBuilder";

import Courses from "./pages/Learning/Courses";
import CoursePlayer from "./pages/Learning/CoursePlayer";
import Roadmaps from "./pages/Learning/Roadmaps";
import RoadmapDetail from "./pages/Learning/RoadmapDetail";
import Resources from "./pages/Learning/Resources";

import Events from "./pages/Community/Events";
import Ambassador from "./pages/Community/Ambassador";
import Hackathons from "./pages/Community/Hackathons";
import HackathonDetail from "./pages/Community/HackathonDetail";
import InnovationHome from "./pages/Community/InnovationHome";
import InnovationChallenges from "./pages/Community/InnovationChallenges";
import AIHackathons from "./pages/Community/AIHackathons";
import HackathonDashboard from "./pages/Community/HackathonDashboard";
import MyHackathons from "./pages/Community/MyHackathons";
import MyTeams from "./pages/Community/MyTeams";
import HackathonWorkspace from "./pages/Community/HackathonWorkspace";
import OrganizerDashboard from "./pages/Community/OrganizerDashboard";
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
          <Route element={<HackathonLayout />}>
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/hackathons/all" element={<Hackathons />} />
            <Route path="/hackathons/login" element={<HackathonLogin />} />
            <Route path="/hackathons/register" element={<HackathonRegister />} />
            <Route path="/hackathons/profile" element={<HackathonParticipantProfile />} />
            <Route path="/hackathons/my-registrations" element={<MyHackathons />} />
            <Route path="/hackathons/my-teams" element={<MyTeams />} />
            <Route path="/hackathons/submissions" element={<HackathonPortalStatus title="My submissions" description="Submission activity across your hackathon workspaces." />} />
            <Route path="/hackathons/dashboard" element={<HackathonDashboard />} />
            <Route path="/hackathons/organizer" element={<OrganizerDashboard />} />
            <Route path="/hackathons/:slug/register" element={<HackathonWorkspace />} />
            <Route path="/hackathons/:slug/workspace" element={<HackathonWorkspace />} />
            <Route path="/hackathons/:slug/workspace/:tab" element={<HackathonWorkspace />} />
            <Route path="/hackathons/:slug" element={<HackathonDetail />} />
            <Route path="/hackathons/*" element={<NotFound />} />

            <Route path="/community/hackathons" element={<Hackathons />} />
            <Route path="/community/hackathons/all" element={<Hackathons />} />
            <Route path="/community/hackathons/:slug" element={<HackathonDetail />} />
            <Route path="/community/hackathon-dashboard" element={<HackathonDashboard />} />
            <Route path="/community/hackathons/dashboard" element={<HackathonDashboard />} />
            <Route path="/community/my-hackathons" element={<MyHackathons />} />
            <Route path="/community/my-teams" element={<MyTeams />} />
            <Route path="/community/submissions" element={<HackathonPortalStatus title="My submissions" description="Submission activity across your hackathon workspaces." />} />
            <Route path="/community/certificates" element={<HackathonPortalStatus title="Certificates" description="Your participation certificates and recognitions." />} />
            <Route path="/community/notifications" element={<HackathonPortalStatus title="Notifications" description="Updates from the innovation platform." />} />
            <Route path="/community/profile" element={<HackathonPortalStatus title="Profile and portfolio" description="Your participant profile and portfolio." />} />
            <Route path="/community/organizer" element={<OrganizerDashboard />} />
            <Route path="/community/hackathons/organizer" element={<OrganizerDashboard />} />
            <Route path="/community/hackathon-workspace/:slug" element={<HackathonWorkspace />} />
            <Route path="/community/hackathon-workspace/:slug/:tab" element={<HackathonWorkspace />} />
            <Route path="/community/hackathons/:slug/workspace" element={<HackathonWorkspace />} />
            <Route path="/community/hackathons/:slug/workspace/:tab" element={<HackathonWorkspace />} />
            <Route path="/community/innovation" element={<InnovationHome />} />
            <Route path="/community/innovation-challenges" element={<InnovationChallenges />} />
            <Route path="/community/ai-hackathons" element={<AIHackathons />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessments" element={<AssessmentBranches />} />

            <Route path="/assessment" element={<AssessmentBranches />} />
            <Route
              path="/assessment/branch/:branchId"
              element={<AssessmentBranchTests />}
            />
            <Route
              path="/assessment/test/:testId"
              element={<AssessmentTest />}
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
              path="/career/placements"
              element={<Placements />}
            />
            <Route path="/career/dsa" element={<DSAHub />} />
            <Route
              path="/career/resume"
              element={<OverleafDashboard />}
            />
            <Route
              path="/career/resume/templates"
              element={<ResumeGallery />}
            />
            <Route path="/career/resume/templates/:templateId" element={<ResumeTemplateDetail />} />
            <Route path="/career/resume/create" element={<ATSResumeBuilder />} />
            <Route path="/career/resume/projects" element={<ResumeProjects />} />
            <Route path="/career/resume/editor/:projectId" element={<ResumeEditor />} />
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
              path="/community/opensource"
              element={<Events />}
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
