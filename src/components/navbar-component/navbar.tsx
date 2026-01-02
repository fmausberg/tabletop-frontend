// components/Navbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdminLoggedIn, isUserLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-navbar-background shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-navbar-text">
            MY-FINANCES
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/home"
              className="hover:text-navbar-hover text-navbar-text"
            >
              Home
            </Link>

            {isUserLoggedIn && (
              <>
                <Link
                  href="/home/user/dashboard"
                  className="hover:text-navbar-hover text-navbar-text"
                >
                  Dashboard
                </Link>
                <Link
                  href="/home/user/partner"
                  className="hover:text-navbar-hover text-navbar-text"
                >
                  Partner
                </Link>
                <Link
                  href="/home/user/transactions"
                  className="hover:text-navbar-hover text-navbar-text"
                >
                  Transactions
                </Link>
                <Link
                  href="/home/user/buckets"
                  className="hover:text-navbar-hover text-navbar-text"
                >
                  Buckets
                </Link>
              </>
            )}

            {isAdminLoggedIn && (
              <>
                <Link
                  href="/admin/categories"
                  className="hover:text-navbar-hover text-navbar-text"
                >
                  Partner
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primaryButton-text"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logout/Login Buttons */}
          <div className="hidden md:flex items-center">
            {isUserLoggedIn || isAdminLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-primaryButton hover:bg-primaryButton-hover text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="mr-2">
                  <Button type="submit" className="w-full" color="primary">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button type="submit" className="w-full" color="primary">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <Link
              href="/home"
              className="block py-2 hover:text-navbar-hover text-navbar-text"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block py-2 hover:text-navbar-hover text-navbar-text"
            >
              About
            </Link>

            {isUserLoggedIn && (
              <>
                <Link
                  href="/home/questions"
                  className="block py-2 hover:text-navbar-hover text-navbar-text"
                >
                  Questions
                </Link>
                <Link
                  href="/home/user"
                  className="block py-2 hover:text-navbar-hover text-navbar-text"
                >
                  Profile
                </Link>
              </>
            )}

            {isAdminLoggedIn && (
              <Link
                href="/home/user"
                className="block py-2 hover:text-navbar-hover text-navbar-text"
              >
                Admin
              </Link>
            )}

            <div className="flex gap-2 pt-4">
              {isUserLoggedIn || isAdminLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-primaryButton hover:bg-primaryButton-hover text-white font-bold py-2 px-4 rounded"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="bg-primaryButton hover:bg-primaryButton-hover text-white font-bold py-2 px-4 rounded">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="bg-primaryButton hover:bg-primaryButton-hover text-white font-bold py-2 px-4 rounded">
                      Register
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
