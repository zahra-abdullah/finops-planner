import Overview from './pages/Overview';
import Plans from './pages/Plans';
import AuditLog from './pages/AuditLog';
import Assistant from './pages/Assistant';
import AgentOrchestrator from './pages/AgentOrchestrator';
import Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "Plans": Plans,
    "AuditLog": AuditLog,
    "Assistant": Assistant,
    "AgentOrchestrator": AgentOrchestrator,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: Layout,
};