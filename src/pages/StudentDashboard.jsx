import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import ChatTab from '../components/dashboard/ChatTab';
import PastQuestionsTab from '../components/dashboard/PastQuestionsTab';
import CBTTab from '../components/dashboard/CBTTab';
import AskAITab from '../components/dashboard/AskAITab';
import VoiceCallTab from '../components/dashboard/VoiceCallTab';
import AdsTab from '../components/dashboard/AdsTab';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/chat/*" element={<ChatTab />} />
              <Route path="/past-questions" element={<PastQuestionsTab />} />
              <Route path="/cbt" element={<CBTTab />} />
              <Route path="/ask-ai" element={<AskAITab />} />
              <Route path="/voice-call" element={<VoiceCallTab />} />
              <Route path="/ads" element={<AdsTab />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;