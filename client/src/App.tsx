import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, Navbar } from './auth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurant from './pages/Restaurant';
import Search from './pages/Search';
import RestaurantForm from './pages/RestaurantForm';
import ManageUsers from './pages/ManageUsers';
import NutritionSearch from './pages/NutritionSearch';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/search"         element={<Search />} />
          <Route path="/create"         element={<RestaurantForm />} />
          <Route path="/edit/:id"       element={<RestaurantForm />} />
          <Route path="/manage-users"   element={<ManageUsers />} />
          <Route path="/nutrition"      element={<NutritionSearch />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
