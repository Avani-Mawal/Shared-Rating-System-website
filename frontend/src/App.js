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
import Books from "./pages/myBooks";
import Search from "./pages/search";
import AuthorList from "./pages/Author-list";
import AuthorDetails from "./pages/Author";
import Year_Books from "./pages/Year-in-Books";
import Bookreviews from "./pages/Bookreviews";
import CommunityAuthors from "./pages/communityauthors";

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
      <Route path="/search" element={<Search />} />
      <Route path="/myBooks" element={<Books />} />
      <Route path="/AuthorList" element={<AuthorList />} /> 
      <Route path="/authors/:authorId" element={<AuthorDetails />} /> 
      <Route path="/year-in-books" element={<Year_Books />} />
      
      <Route path="/Bookreviews" element={<Bookreviews />} />
      <Route path="/communityauthors" element={<CommunityAuthors />} />
      <Route path="*" element={<NotFound />} /> 
    </Routes>
  );
}

export default App;
