"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "@/lib/toast";

type PlanFormData = {
  id?: string;
  name: string;
  description: string;
  tier: "starter" | "pro" | "elite" | "professional" | "founder";
  priceMonthlyCents: number;
  priceAnnualCents: number;
  isActive: boolean;
};

export function SubscriptionPlanForm({
  initialData,
  saveAction,
}: {
  initialData?: PlanFormData;
  saveAction: (formData: FormData) => Promise<any>;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      await saveAction(formData);
      toast({ title: "Success", description: "Plan saved successfully.", variant: "success" });
      router.refresh();
      if (!initialData) {
        (e.target as HTMLFormElement).reset();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Plan" : "Create New Plan"}</CardTitle>
        <CardDescription>Configure pricing and tiers for your subscriptions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" name="name" defaultValue={initialData?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select name="tier" defaultValue={initialData?.tier || "starter"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro (Legacy)</SelectItem>
                  <SelectItem value="elite">Elite (Legacy)</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="founder">Founder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMonthly">Monthly Price (USD)</Label>
              <Input
                id="priceMonthly"
                name="priceMonthly"
                type="number"
                step="0.01"
                defaultValue={initialData ? (initialData.priceMonthlyCents / 100).toFixed(2) : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceAnnual">Annual Price (USD)</Label>
              <Input
                id="priceAnnual"
                name="priceAnnual"
                type="number"
                step="0.01"
                defaultValue={initialData ? (initialData.priceAnnualCents / 100).toFixed(2) : ""}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={initialData ? initialData.isActive : true}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {initialData ? "Update Plan" : "Create Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
