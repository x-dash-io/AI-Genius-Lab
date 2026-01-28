"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toastSuccess, toastError, toastWarning } from "@/lib/toast";

export function BulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ importedCount: number; errors: any[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/courses/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        toastSuccess(`Successfully imported ${data.importedCount} courses`);
        if (data.errors.length > 0) {
          toastWarning(`Imported with ${data.errors.length} errors`);
        }
      } else {
        toastError(data.error || "Failed to import courses");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toastError("An unexpected error occurred during import");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Course Import
        </CardTitle>
        <CardDescription>
          Upload a CSV file to import or update multiple courses at once.
          Required columns: id, slug, title. Optional: description, category, priceCents, inventory, isPublished.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              Choose CSV File
            </label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Import CSV
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-muted space-y-2">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Imported {result.importedCount} courses successfully
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {result.errors.length} errors occurred:
                </div>
                <ul className="text-xs text-muted-foreground list-disc pl-6 max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      Row {i + 1}: {err.error} (Title: {err.row.title})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
