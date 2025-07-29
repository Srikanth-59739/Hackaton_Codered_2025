import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="flex flex-col items-center justify-center p-12 text-center">
      <h1 className="text-5xl font-extrabold mb-6">
        Find your perfect <span className="text-blue-600">study group</span>
      </h1>
      <p className="max-w-xl mb-8 text-gray-600">
        StudySync matches you with peers taking the same courses at the same time.
        Collaborative learning has never been easier.
      </p>
      <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
        Get Started
      </Link>
      <footer className="mt-20 text-gray-400 text-xs">
        © {new Date().getFullYear()} StudySync — Built with React and Tailwind CSS
      </footer>
    </section>
  );
}