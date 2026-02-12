"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/lib/toast";
import {
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialFeatured
} from "@/app/actions/testimonials";

export function useTestimonialActions() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    type TestimonialPayload = Parameters<typeof createTestimonial>[0];

    const handleCreate = async (data: TestimonialPayload) => {
        startTransition(async () => {
            const result = await createTestimonial(data);
            if (result.success) {
                toastSuccess("Testimonial created", "Student success story added successfully");
                router.refresh();
            } else {
                toastError("Failed to create", result.error || "Please check the form and try again");
            }
        });
    };

    const handleUpdate = async (id: string, data: TestimonialPayload) => {
        startTransition(async () => {
            const result = await updateTestimonial(id, data);
            if (result.success) {
                toastSuccess("Testimonial updated", "Success story saved successfully");
                router.refresh();
            } else {
                toastError("Failed to update", result.error || "Changes could not be saved");
            }
        });
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            const result = await deleteTestimonial(id);
            if (result.success) {
                toastSuccess("Testimonial deleted", "Success story removed from records");
                router.refresh();
            } else {
                toastError("Failed to delete", result.error || "Testimonial could not be removed");
            }
        });
    };

    const handleToggleFeatured = async (id: string, featured: boolean) => {
        startTransition(async () => {
            const result = await toggleTestimonialFeatured(id, featured);
            if (result.success) {
                toastSuccess(
                    featured ? "Featured on Homepage" : "Removed from Homepage",
                    featured ? "This story is now visible to visitors" : "Successfully hidden from homepage"
                );
                router.refresh();
            } else {
                toastError("Status update failed", result.error || "Could not update featured status");
            }
        });
    };

    return {
        isPending,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleToggleFeatured,
    };
}
