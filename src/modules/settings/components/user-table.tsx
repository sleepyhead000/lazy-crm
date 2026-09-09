"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/modules/shared/ui/input";
import { Select } from "@/modules/shared/ui/select";
import { Button } from "@/modules/shared/ui/button";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "sales_rep", label: "Sales Rep" },
  { value: "read_only", label: "Read Only" },
];

interface UserTableProps {
  members: {
    id: string;
    role: string;
    user: { id: string; name: string | null; email: string };
  }[];
}

export function UserTable({ members }: UserTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateRole(memberId: string, role: string) {
    setLoading(memberId);
    await fetch("/api/settings/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, role }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
            <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">User</th>
            <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-subtle)]">
          {members.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-[var(--color-text)]">{m.user.name || "Unnamed"}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{m.user.email}</p>
              </td>
              <td className="px-4 py-3">
                <Select
                  value={m.role}
                  onChange={(e) => updateRole(m.id, e.target.value)}
                  options={ROLE_OPTIONS}
                  className="w-40"
                  disabled={loading === m.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("sales_rep");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/settings/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Invitation sent!");
      setEmail("");
      router.refresh();
    } else {
      setMessage(data.error || "Failed to invite");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="user@company.com"
        className="flex-1"
      />
      <Select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        options={ROLE_OPTIONS}
        className="w-40"
      />
      <Button type="submit" disabled={loading} className="mb-0.5">
        {loading ? "Inviting..." : "Invite"}
      </Button>
      {message && <span className="text-sm text-[var(--color-text-secondary)] ml-2">{message}</span>}
    </form>
  );
}
