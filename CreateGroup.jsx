import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import Input from "../components/Input";
import Datepicker from "react-tailwindcss-datepicker";
import toast from "react-hot-toast";

export default function CreateGroup() {
  const { user } = useAuth();
  const { groups, saveGroups } = useData();

  const [group, setGroup] = useState({
    name: "",
    subject: "",
    description: "",
    time_slot: null,
    capacity: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroup({ ...group, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!group.name || !group.subject || !group.time_slot || !group.capacity) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Check for slot capacity conflicts
    const slotGroups = groups.filter(g => 
      g.subject.toLowerCase() === group.subject.toLowerCase() && 
      new Date(g.time_slot).getTime() === new Date(group.time_slot?.startDate).getTime() &&
      g.member_count >= Number(g.capacity)
    );

    if (slotGroups.length > 0) {
      toast.error("A full group already exists at that subject/time.");
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: group.name,
      subject: group.subject,
      description: group.description,
      time_slot: group.time_slot.startDate,
      capacity: Number(group.capacity),
      member_count: 0,
      created_by: user.id,
      join_link: ""
    };

    saveGroups([...groups, newGroup]);
    toast.success("Group created.");
    setGroup({ name: "", subject: "", description: "", time_slot: null, capacity: "" });
  };

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
      <form onSubmit={handleSubmit}>
        <Input name="name" label="Group Name" value={group.name} onChange={handleChange} />
        <Input name="subject" label="Subject" value={group.subject} onChange={handleChange} />
        <Input name="description" label="Description" value={group.description} onChange={handleChange} />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Time Slot (date & time)</label>
          <Datepicker
            useRange={false}
            asSingle={true}
            value={group.time_slot}
            onChange={(slot) => setGroup({ ...group, time_slot: slot })}
            displayFormat="MMM DD, YYYY – hh:mm A"
            showShortcuts={false}
            primaryColor="blue"
          />
        </div>
        <Input 
          name="capacity" 
          label="Max Capacity" 
          value={group.capacity} 
          onChange={handleChange} 
          type="number"
          min={1}
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Create Group
        </button>
      </form>
    </main>
  );
}