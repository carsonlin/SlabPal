import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Batches from "./pages/Batches"
import Analytics from "./pages/Analytics"
import Login from "./pages/Login"
import Submission from "./pages/Submission"
import BatchDetail from "./pages/BatchDetail"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login is standalone — NO sidebar */}
        <Route path="/login" element={<Login />} />

        {/* These pages share the Layout (sidebar) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Batches" element={<Batches />} />
          <Route path="/Analytics" element={<Analytics />} />
          <Route path="/Submission" element={<Submission />} />
          <Route path="/BatchDetail/:id" element={<BatchDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App