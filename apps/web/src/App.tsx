import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoaList from './pages/CoaList';
import JournalForm from './pages/JournalForm';
import JournalList from './pages/JournalList';

function Protected({ children }: { children: JSX.Element }): JSX.Element {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/coa"
        element={
          <Protected>
            <CoaList />
          </Protected>
        }
      />
      <Route
        path="/journals"
        element={
          <Protected>
            <JournalList />
          </Protected>
        }
      />
      <Route
        path="/journals/new"
        element={
          <Protected>
            <JournalForm />
          </Protected>
        }
      />
    </Routes>
  );
}