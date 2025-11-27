import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function ProfileSelectorDropdown({
  label = "Select profile",
  profiles = [],
  selectedProfileId,
  onSelectProfile,
  onQuickCreate
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const ref = useRef(null);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p._id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    return profiles.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectProfile = (id) => {
    onSelectProfile?.(id);
    setOpen(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError("Name required");
      return;
    }

    setError('');
    setIsCreating(true);
    const res = await onQuickCreate?.({ name: newName.trim() });
    setIsCreating(false);

    if (!res?.success) {
      setError(res.error || "Failed to add profile");
      return;
    }

    setNewName("");
    setSearch("");
  };

  return (
    <div className="profile-dropdown" ref={ref}>
      {label && (
        <label className="profile-dropdown-label">{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="profile-dropdown-trigger"
      >
        <div className="profile-dropdown-trigger-text">
          <span style={{ fontWeight: 500 }}>
            {selectedProfile?.name || "Choose..."}
          </span>
        </div>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="profile-dropdown-panel">
          {/* Search */}
          <div className="profile-dropdown-search">
            <input
              type="text"
              placeholder="Search profiles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          {filteredProfiles.length === 0 ? (
            <div className="profile-dropdown-empty">No profiles found</div>
          ) : (
            filteredProfiles.map((p) => (
              <div
                key={p._id}
                className={
                  "profile-dropdown-item" +
                  (p._id === selectedProfileId
                    ? " profile-dropdown-item-selected"
                    : "")
                }
                onClick={() => selectProfile(p._id)}
              >
                {p.name}
              </div>
            ))
          )}

          {/* Quick Add */}
          <div className="profile-dropdown-add">
            <div className="profile-dropdown-add-title">Quick add user</div>

            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            {error && (
              <div className="profile-dropdown-error">{error}</div>
            )}

            <button
              type="button"
              className="profile-dropdown-add-btn"
              onClick={handleAdd}
              disabled={isCreating}
            >
              {isCreating ? "Adding…" : "Add User"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
