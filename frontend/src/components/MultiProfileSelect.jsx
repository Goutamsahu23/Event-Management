import React, { useState, useRef, useMemo, useEffect } from "react";

export default function MultiProfileSelect({
  profiles = [],
  value = [],
  onChange,
  onQuickCreate,
  label = ""
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const ref = useRef(null);

  const selectedProfiles = useMemo(() => {
    return profiles.filter((p) => value.includes(p._id));
  }, [profiles, value]);

  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    return profiles.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  // Close when clicked outside
  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const toggleProfile = (id) => {
    if (value.includes(id)) {
      onChange?.(value.filter((v) => v !== id));
    } else {
      onChange?.([...value, id]);
    }
  };

  const handleAdd = async () =>    {
    if (!newName.trim()) {
      setError("Name required");
      return;
    }

    setError("");
    setIsCreating(true);
    const res = await onQuickCreate?.({ name: newName.trim() });
    setIsCreating(false);

    if (!res?.success) {
      setError(res.error || "Failed to add");
      return;
    }

    setNewName("");
    setSearch("");
  };

  return (
    <div className="multi-select" ref={ref}>
      {label && <label className="multi-select-label">{label}</label>}

      {/* Trigger */}
      <button
        type="button"
        className="multi-select-trigger"
        onClick={() => setOpen(!open)}
      >
        <span className="multi-select-trigger-text">
          {selectedProfiles.length === 0
            ? "Choose profiles..."
            : selectedProfiles.map((p) => p.name).join(", ")}
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="multi-select-panel">
          {/* Search */}
          <div className="multi-select-search">
            <input
              type="text"
              placeholder="Search profiles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          {filteredProfiles.length === 0 ? (
            <div className="multi-select-empty">No profiles found</div>
          ) : (
            filteredProfiles.map((p) => (
              <div
                key={p._id}
                className={
                  "multi-select-item " +
                  (value.includes(p._id)
                    ? "multi-select-item-selected"
                    : "")
                }
                onClick={() => toggleProfile(p._id)}
              >
                <span>{p.name}</span>
                {value.includes(p._id) && <strong>✓</strong>}
              </div>
            ))
          )}

          {/* Quick Add */}
          <div className="multi-select-add">
            <div className="multi-select-add-title">Quick add user</div>

            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            {error && <div className="multi-select-error">{error}</div>}

            <button
              type="button"
              className="multi-select-add-btn"
              onClick={handleAdd}
              disabled={isCreating}
            >
              {isCreating ? "Adding..." : "Add User"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
