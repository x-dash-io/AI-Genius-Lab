"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleHelp,
  Component,
  Layers,
  LayoutGrid,
} from "lucide-react";

import { toast } from "@/lib/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton, SkeletonCard, SkeletonForm, SkeletonTable } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const sampleRows = [
  { id: "CO-102", item: "AI Product Strategy", status: "Published", owner: "A. Rivera" },
  { id: "LP-024", item: "Automation Architect Path", status: "Draft", owner: "M. Chen" },
  { id: "CO-331", item: "Prompt Ops Fundamentals", status: "Published", owner: "L. Brooks" },
];

export function UiShowcasePage() {
  const [emailOptIn, setEmailOptIn] = useState(true);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="font-display text-3xl font-semibold tracking-tight">UI Showcase</h1>
              <p className="text-sm text-muted-foreground">
                Internal contract page for Phase 2 foundation primitives and patterns.
              </p>
            </div>
            <Badge>Internal</Badge>
          </div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "UI Showcase" },
            ]}
          />
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buttons and Badges</CardTitle>
              <CardDescription>Tokenized action styles and emphasis levels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="premium">Premium</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Alert</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inputs and Form Controls</CardTitle>
              <CardDescription>Consistent form system with labels and states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="showcase-name">Name</Label>
                  <Input id="showcase-name" placeholder="Alex Rivera" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="showcase-role">Role</Label>
                  <Select>
                    <SelectTrigger id="showcase-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-notes">Notes</Label>
                <Textarea id="showcase-notes" placeholder="Describe expected behavior and acceptance criteria." />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="newsletter" checked={emailOptIn} onCheckedChange={(value) => setEmailOptIn(value === true)} />
                  <Label htmlFor="newsletter">Email release notes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="release-switch" checked={emailOptIn} onCheckedChange={setEmailOptIn} />
                  <Label htmlFor="release-switch">Enable notifications</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Plan Tier</Label>
                <RadioGroup defaultValue="pro" className="grid gap-2 sm:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border p-2">
                    <RadioGroupItem value="starter" id="tier-starter" />
                    <Label htmlFor="tier-starter">Starter</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border p-2">
                    <RadioGroupItem value="pro" id="tier-pro" />
                    <Label htmlFor="tier-pro">Pro</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border p-2">
                    <RadioGroupItem value="enterprise" id="tier-enterprise" />
                    <Label htmlFor="tier-enterprise">Enterprise</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation and Surface Patterns</CardTitle>
              <CardDescription>Tabs, dropdowns, avatars, and tooltip interaction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="rounded-[var(--radius-sm)] border p-3 text-sm">
                  Overview tab content area.
                </TabsContent>
                <TabsContent value="details" className="rounded-[var(--radius-sm)] border p-3 text-sm">
                  Detail tab content area.
                </TabsContent>
                <TabsContent value="history" className="rounded-[var(--radius-sm)] border p-3 text-sm">
                  History tab content area.
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Help">
                      <CircleHelp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Keyboard shortcut: press / for search</TooltipContent>
                </Tooltip>

                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/100?img=14" alt="Design system avatar" />
                  <AvatarFallback>AG</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overlays and Toasts</CardTitle>
              <CardDescription>Dialog, drawer, and notification primitives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm change</DialogTitle>
                      <DialogDescription>This modal uses the shared dialog primitive.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Quick inspector</DrawerTitle>
                      <DrawerDescription>Drawer/sheet pattern for mobile-first contextual tasks.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-6">
                      <p className="text-sm text-muted-foreground">Use this for secondary workflows without route changes.</p>
                    </div>
                    <DrawerFooter>
                      <Button variant="outline">Close</Button>
                      <Button>Apply</Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => toast({ title: "Saved", description: "Settings were updated.", variant: "success" })}
                >
                  Success Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Heads up", description: "Action requires review.", variant: "warning" })}
                >
                  Warning Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast({ title: "Failed", description: "Unable to complete request.", variant: "destructive" })}
                >
                  Error Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Table Shell and Pagination</CardTitle>
            <CardDescription>Reusable table pattern for management and reporting pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.item}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Published" ? "secondary" : "outline"}>{row.status}</Badge>
                    </TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Empty State Pattern</CardTitle>
              <CardDescription>Consistent empty-state messaging and call to action.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<LayoutGrid className="h-6 w-6" />}
                title="No records yet"
                description="Create your first item to populate this workspace."
                action={<Button size="sm">Create Item</Button>}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Alerts</CardTitle>
              <CardDescription>System feedback messages and semantic status styles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>New billing profile updates are available.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your access changes were applied.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Payment method expires in 3 days.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Loading and Progress Patterns</CardTitle>
            <CardDescription>Skeletons and stepper primitives for async/task workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <SkeletonCard />
              <SkeletonForm />
              <SkeletonTable rows={4} cols={3} />
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Stepper
              currentStep="validation"
              steps={[
                { id: "draft", label: "Draft", description: "Content drafted" },
                { id: "validation", label: "Validation", description: "Quality checks" },
                { id: "approval", label: "Approval", description: "Stakeholder sign-off" },
                { id: "publish", label: "Publish", description: "Release complete" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Surface Preview
            </CardTitle>
            <CardDescription>
              Shared surface styling with tokenized contrast across themes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This card uses the base card surface without optional effects mode switching.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Component className="h-4 w-4" />
              Foundation Completion
            </CardTitle>
            <CardDescription>Phase 2 showcase includes forms, table shell, empty state, skeletons, dialogs, and toasts.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </TooltipProvider>
  );
}
