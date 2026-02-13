"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/lib/toast";
import {
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialFeatured
} from "@/app/actions/testimonials";

export function useTestimonialActions() {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();
    type TestimonialPayload = Parameters<typeof createTestimonial>[0];

    const handleCreate = async (data: TestimonialPayload) => {
        if (isPending) return false;
        setIsPending(true);
        try {
            const result = await createTestimonial(data);
            if (result.success) {
                toastSuccess("Testimonial created", "Student success story added successfully");
                router.refresh();
                return true;
            } else {
                toastError("Failed to create", result.error || "Please check the form and try again");
            }
            return false;
        } catch (error) {
            toastError("Failed to create", error instanceof Error ? error.message : "Please check the form and try again");
            return false;
        } finally {
            setIsPending(false);
        }
    };

    const handleUpdate = async (id: string, data: TestimonialPayload) => {
        if (isPending) return false;
        setIsPending(true);
        try {
            const result = await updateTestimonial(id, data);
            if (result.success) {
                toastSuccess("Testimonial updated", "Success story saved successfully");
                router.refresh();
                return true;
            } else {
                toastError("Failed to update", result.error || "Changes could not be saved");
            }
            return false;
        } catch (error) {
            toastError("Failed to update", error instanceof Error ? error.message : "Changes could not be saved");
            return false;
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (isPending) return false;
        setIsPending(true);
        try {
            const result = await deleteTestimonial(id);
            if (result.success) {
                toastSuccess("Testimonial deleted", "Success story removed from records");
                router.refresh();
                return true;
            } else {
                toastError("Failed to delete", result.error || "Testimonial could not be removed");
            }
            return false;
        } catch (error) {
            toastError("Failed to delete", error instanceof Error ? error.message : "Testimonial could not be removed");
            return false;
        } finally {
            setIsPending(false);
        }
    };

    const handleToggleFeatured = async (id: string, featured: boolean) => {
        if (isPending) return false;
        setIsPending(true);
        try {
            const result = await toggleTestimonialFeatured(id, featured);
            if (result.success) {
                toastSuccess(
                    featured ? "Featured on Homepage" : "Removed from Homepage",
                    featured ? "This story is now visible to visitors" : "Successfully hidden from homepage"
                );
                router.refresh();
                return true;
            } else {
                toastError("Status update failed", result.error || "Could not update featured status");
            }
            return false;
        } catch (error) {
            toastError("Status update failed", error instanceof Error ? error.message : "Could not update featured status");
            return false;
        } finally {
            setIsPending(false);
        }
    };

    return {
        isPending,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleToggleFeatured,
    };
}
