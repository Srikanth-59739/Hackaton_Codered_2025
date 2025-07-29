import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import toast from "react-hot-toast";

function isFuture(slotISO) {
  return new Date(slotISO) > new Date();
}

function matchesProfile(group, profile) {
  if (!profile?.courses?.length || !profile?.timeSlots?.length) return false;
  const subjectMatch = profile.courses.some(
    c => c.toLowerCase().trim() === group.subject.toLowerCase().trim()
  );
  const slotMatch = profile.timeSlots.some(
    slot => slot.startDate.substring(0, 16) === group.time_slot.substring(0, 16)
  );
  return subjectMatch && slotMatch && isFuture(group.time_slot);
}

export default function GroupDiscovery() {
  const { user } = useAuth();
  const { profile, groups, saveGroups } = useData();

  if (!user) return <p className="text-center mt-20">Please login first.</p>;
  if (!profile) return <p className="mt-12 text-center">Complete your profile to see matched groups.</p>;

  const matchedGroups = groups.filter(group => 
    matchesProfile(group, profile) && group.member_count < group.capacity
  );

  const joinGroup = (groupId) => {
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groups[groupIndex].member_count >= groups[groupIndex].capacity) {
      toast.error("Group is full.");
      return;
    }
    groups[groupIndex].member_count += 1;
    saveGroups([...groups]);
    toast.success("Joined the group!");
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Recommended Groups</h1>
      {matchedGroups.length === 0 && (
        <p className="text-center text-gray-500">No matching groups available currently.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matchedGroups.map(group => (
          <div key={group.id} className="border rounded p-4 shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold">{group.name}</h2>
            <p className="text-sm text-gray-600">Subject: {group.subject}</p>
            <p className="text-sm text-gray-600">Time: {new Date(group.time_slot).toLocaleString()}</p>
            <p className="text-sm text-gray-600">
              Members: {group.member_count} / {group.capacity}
            </p>
            <button
              className={mt-3 px-4 py-2 rounded ${group.member_count >= group.capacity ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}}
              disabled={group.member_count >= group.capacity}
              onClick={() => joinGroup(group.id)}
            >
              {group.member_count >= group.capacity ? "Full" : "Join"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
*