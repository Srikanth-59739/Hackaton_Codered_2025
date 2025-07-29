import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

export default function MyGroups() {
  const { user } = useAuth();
  const { groups } = useData();

  if (!user) return <p className="text-center mt-20">Please log in.</p>;

  // Groups created or joined by user (joined groups: member_count logic omitted, demo only created_by)
  const myGroups = groups.filter(g => g.created_by === user.id);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Groups</h1>
      {myGroups.length === 0 ? (
        <p>No groups created yet.</p>
      ) : (
        <ul className="space-y-4">
          {myGroups.map(group => (
            <li
              key={group.id}
              className="border rounded p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <p className="text-sm text-gray-600">Subject: {group.subject}</p>
              <p className="text-sm text-gray-600">Time: {new Date(group.time_slot).toLocaleString()}</p>
              <p className="text-sm text-gray-600">
                Members: {group.member_count} / {group.capacity}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}