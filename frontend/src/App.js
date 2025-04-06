import { Routes, Route } from "react-router";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";  
import Recommendations from "./pages/Recommendations";
import Genres from "./pages/Genres";
import GenreDetail from "./pages/GenreDetail";
import Book from "./pages/Book-details";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/genres" element={<Genres />} />
      <Route path="/genre/:genreName" element={<GenreDetail />} />
      <Route path="/books/:bookId" element={<Book />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
