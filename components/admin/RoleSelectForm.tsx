"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/rbac";

interface RoleSelectFormProps {
  currentRole: Role;
  userId: string;
  isCurrentUser: boolean;
  changeRoleAction: (userId: string, formData: FormData) => Promise<void>;
}

export function RoleSelectForm({
  currentRole,
  userId,
  isCurrentUser,
  changeRoleAction,
}: RoleSelectFormProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCurrentUser || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("role", selectedRole);
    await changeRoleAction(userId, formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Role</Label>
        <p className="text-lg capitalize">{currentRole}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Change to</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as Role)}
          disabled={isCurrentUser || isSubmitting}
        >
          <SelectTrigger id="role" name="role" className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {isCurrentUser && (
          <p className="text-xs text-muted-foreground">
            You cannot modify your own role for security reasons.
          </p>
        )}
      </div>
      <Button type="submit" disabled={isCurrentUser || isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Role"}
      </Button>
    </form>
  );
}
