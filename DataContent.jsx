import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);

  // Load profile and groups from localStorage for demo
  useEffect(() => {
    if (user) {
      const p = localStorage.getItem(profile_${user.id});
      setProfile(p ? JSON.parse(p) : null);

      const g = localStorage.getItem("groups");
      setGroups(g ? JSON.parse(g) : []);
    } else {
      setProfile(null);
      setGroups([]);
    }
  }, [user]);

  // Save profile changes
  const saveProfile = (newProfile) => {
    if (user) {
      localStorage.setItem(profile_${user.id}, JSON.stringify(newProfile));
      setProfile(newProfile);
    }
  };

  // Save groups changes
  const saveGroups = (newGroups) => {
    localStorage.setItem("groups", JSON.stringify(newGroups));
    setGroups(newGroups);
  };

  return (
    <DataContext.Provider value={{ profile, saveProfile, groups, saveGroups }}>
      {children}
    </DataContext.Provider>
  );
}