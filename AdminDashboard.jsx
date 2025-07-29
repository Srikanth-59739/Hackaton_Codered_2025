import React from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { groups } = useData();

  if (!user || !user.isAdmin) {
    return <p className="text-center mt-20">Access denied</p>;
  }

  // Basic stats
  const totalUsers = "N/A (mock)"; // In real app, fetch from backend
  const totalGroups = groups.length;

  // Popular subjects
  const subjectCount = groups.reduce((acc, g) => {
    acc[g.subject] = (acc[g.subject] || 0) + 1;
    return acc;
  }, {});

  const sortedSubjects = Object.entries(subjectCount).sort((a, b) => b[1] - a[1]);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p>Total Users (mock): {totalUsers}</p>
        <p>Total Groups: {totalGroups}</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Popular Subjects</h2>
        <ul className="list-disc list-inside">
          {sortedSubjects.map(([subject, count]) => (
            <li key={subject}>
              {subject}: {count} group{count > 1 ? "s" : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}