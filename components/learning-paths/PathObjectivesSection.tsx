"use client";

import { CheckCircle2, Target, Users, BookOpen, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Learning Objectives */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-foreground">Learning Objectives</h3>
          </div>
          {objectives.length > 0 ? (
            <div className="space-y-2">
              {objectives.map((objective, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-muted-foreground/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{objective}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No objectives defined</p>
          )}
        </div>

        {/* Key Skills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-foreground">Skills You'll Master</h3>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills defined</p>
          )}
        </div>
      </div>

      {/* Additional Info Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {targetAudience && (
          <div className="rounded-lg border border-muted-foreground/10 bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase text-muted-foreground">Target Audience</p>
            </div>
            <p className="text-sm text-foreground">{targetAudience}</p>
          </div>
        )}

        {prerequisites && (
          <div className="rounded-lg border border-muted-foreground/10 bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-semibold uppercase text-muted-foreground">Prerequisites</p>
            </div>
            <p className="text-sm text-foreground">{prerequisites}</p>
          </div>
        )}

        {estimatedHours && (
          <div className="rounded-lg border border-muted-foreground/10 bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-4 w-4 text-green-600 flex items-center justify-center text-xs font-bold">⏱</span>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Estimated Time</p>
            </div>
            <p className="text-sm text-foreground">{estimatedHours} hours</p>
          </div>
        )}
      </div>
    </section>
  );
}
