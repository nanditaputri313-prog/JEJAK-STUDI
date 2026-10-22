import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import StudyTrackPage from './pages/StudyTrackPage'
import FocusPage from './pages/FocusPage'
import CalendarPage from './pages/CalendarPage'
import JournalPage from './pages/JournalPage'
import GoalsPage from './pages/GoalsPage'
import WeeklyReviewPage from './pages/WeeklyReviewPage'
import ProgressPage from './pages/ProgressPage'
import AchievementsPage from './pages/AchievementsPage'
import ResourcesPage from './pages/ResourcesPage'
import SemesterWrappedPage from './pages/SemesterWrappedPage'
import PricingPage from './pages/PricingPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ArchivePage from './pages/ArchivePage'

function LoadingScreen(){return <div className="grid min-h-screen place-items-center bg-app"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--primary)]"/><p className="mt-4 text-sm muted">Menyiapkan jejakmu...</p></div></div>}
function RequireAuth({children}:{children:React.ReactNode}){const{account,loading}=useApp();const loc=useLocation();if(loading)return <LoadingScreen/>;if(!account)return <Navigate to="/login" replace state={{from:loc.pathname}}/>;if(!account.onboardingCompleted)return <Navigate to="/onboarding" replace/>;return <>{children}</>}
function OnboardingGuard(){const{account,loading}=useApp();if(loading)return <LoadingScreen/>;if(!account)return <Navigate to="/register" replace/>;if(account.onboardingCompleted)return <Navigate to="/app/dashboard" replace/>;return <OnboardingPage/>}
function PublicOnly({children}:{children:React.ReactNode}){const{account,loading}=useApp();if(loading)return <LoadingScreen/>;if(account)return <Navigate to={account.onboardingCompleted?'/app/dashboard':'/onboarding'} replace/>;return <>{children}</>}
function NotFound(){return <div className="grid min-h-screen place-items-center bg-app px-4"><div className="text-center"><p className="text-7xl font-extrabold text-[var(--primary)]">404</p><h1 className="mt-4 text-2xl font-bold">Halaman tidak ditemukan.</h1><a href="/" className="mt-6 inline-block rounded-2xl bg-[var(--primary)] px-5 py-3 font-semibold text-white">Kembali</a></div></div>}

function AppRoutes(){return <Routes><Route path="/" element={<LandingPage/>}/><Route path="/login" element={<PublicOnly><LoginPage/></PublicOnly>}/><Route path="/register" element={<PublicOnly><RegisterPage/></PublicOnly>}/><Route path="/onboarding" element={<OnboardingGuard/>}/><Route path="/app" element={<RequireAuth><AppLayout/></RequireAuth>}><Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage/>}/><Route path="study" element={<StudyTrackPage/>}/><Route path="tasks" element={<TasksPage/>}/><Route path="calendar" element={<CalendarPage/>}/><Route path="journal" element={<JournalPage/>}/><Route path="goals" element={<GoalsPage/>}/><Route path="focus" element={<FocusPage/>}/><Route path="review" element={<WeeklyReviewPage/>}/><Route path="progress" element={<ProgressPage/>}/><Route path="achievements" element={<AchievementsPage/>}/><Route path="resources" element={<ResourcesPage/>}/><Route path="wrapped" element={<SemesterWrappedPage/>}/><Route path="pricing" element={<PricingPage/>}/><Route path="checkout" element={<CheckoutPage/>}/><Route path="profile" element={<ProfilePage/>}/><Route path="settings" element={<SettingsPage/>}/><Route path="archive" element={<ArchivePage/>}/></Route><Route path="*" element={<NotFound/>}/></Routes>}
export default function App(){return <AppProvider><AppRoutes/></AppProvider>}
