"use client";

import { BookOpen, Clock3, Target, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PathObjectivesSectionProps {
  objectives?: string[];
  skills?: string[];
  targetAudience?: string;
  prerequisites?: string;
  estimatedHours?: number;
}

export function PathObjectivesSection({
  objectives = [],
  skills = [],
  targetAudience,
  prerequisites,
  estimatedHours,
}: PathObjectivesSectionProps) {
  return (
    <Card className="ui-surface border">
      <CardHeader>
        <CardTitle className="text-xl">Learning objectives</CardTitle>
        <CardDescription>Expected outcomes and preparation for this path.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-2.5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Outcomes
            </p>
            {objectives.length ? (
              <div className="grid gap-2">
                {objectives.map((objective) => (
                  <p
                    key={objective}
                    className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {objective}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Objectives are being finalized for this path.</p>
            )}
          </section>

          <section className="space-y-2.5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-primary" />
              Skills covered
            </p>
            {skills.length ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Skill tags are being updated.</p>
            )}
          </section>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Audience
            </p>
            <p className="mt-2 text-sm text-foreground">{targetAudience || "All learners"}</p>
          </div>
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Prerequisites
            </p>
            <p className="mt-2 text-sm text-foreground">{prerequisites || "No hard prerequisites"}</p>
          </div>
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Estimated time
            </p>
            <p className="mt-2 text-sm text-foreground">
              {estimatedHours ? `${estimatedHours} hours` : "Self-paced"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
