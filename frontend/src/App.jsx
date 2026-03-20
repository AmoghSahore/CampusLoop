import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PostAdPage from "./components/PostAdPage";
import ProductDetailsPage from "./components/ProductDetailsPage";
import ChatPage from "./components/ChatPage";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import WishlistPage from "./components/WishlistPage";
import VerifyEmail from "./components/VerifyEmail";

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/post-ad" element={
          <ProtectedRoute>
            <PostAdPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
