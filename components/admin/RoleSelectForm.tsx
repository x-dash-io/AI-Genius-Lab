"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
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
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCurrentUser || isSubmitting || selectedRole === currentRole) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("role", selectedRole);
      await changeRoleAction(userId, formData);
      toast({
        title: "Role updated",
        description: `User role has been changed to ${selectedRole}.`,
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update role";
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Reset to current role on failure
      setSelectedRole(currentRole);
    } finally {
      setIsSubmitting(false);
    }
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
            <SelectItem value="customer" disabled={currentRole === "customer"}>
              Customer
            </SelectItem>
            <SelectItem value="admin" disabled={currentRole === "admin"}>
              Admin
            </SelectItem>
          </SelectContent>
        </Select>
        {isCurrentUser && (
          <p className="text-xs text-muted-foreground">
            You cannot modify your own role for security reasons.
          </p>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={isCurrentUser || isSubmitting || selectedRole === currentRole}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Role"
        )}
      </Button>
    </form>
  );
}
