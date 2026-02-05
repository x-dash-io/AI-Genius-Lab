"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toastSuccess, toastError } from "@/lib/toast";

interface DeleteButtonProps {
    id: string;
    title: string;
    description?: string;
    onDelete: (id: string) => Promise<any>;
    disabled?: boolean;
}

export function DeleteButton({
    id,
    title,
    description = "This action cannot be undone. This will permanently delete this item.",
    onDelete,
    disabled = false,
}: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(id);
            toastSuccess(
                "Deleted",
                `${title} has been successfully deleted.`
            );
            setOpen(false);
        } catch (error: any) {
            toastError(
                "Error",
                error.message || "Something went wrong."
            );
            setOpen(false); // Close dialog even on error to reset
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:shadow-[0_2px_8px_hsl(var(--destructive)_/_0.15)] transition-all" disabled={disabled || isDeleting}>
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 text-destructive mb-2">
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <AlertDialogTitle className="text-xl">Delete {title}?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} className="h-11">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/95 hover:shadow-[0_4px_12px_hsl(var(--destructive)_/_0.3)] h-11 px-8 transition-all"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Permanently"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
