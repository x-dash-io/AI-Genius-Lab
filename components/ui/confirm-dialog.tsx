"use client";

import { useState, createContext, useContext, useCallback, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  icon?: ReactNode;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
    setResolvePromise(null);
    setOptions(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
    setResolvePromise(null);
    setOptions(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[var(--z-overlay)] bg-[hsl(var(--foreground)/0.5)] backdrop-blur-[var(--blur-sm)]"
              onClick={handleCancel}
            />
            <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="w-full max-w-md"
              >
                <Card className="ui-surface overflow-hidden border shadow-xl">
                  <CardHeader className="pb-4 bg-muted/30 pt-6">
                    <div className="flex items-start gap-5">
                      <div
                        className={`shrink-0 rounded-full p-3 ${
                          options.variant === "destructive"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/12 text-warning"
                        }`}
                      >
                        {options.icon || (
                          options.variant === "destructive" ? (
                            <Trash2 className="h-6 w-6" />
                          ) : (
                            <AlertTriangle className="h-6 w-6" />
                          )
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-xl font-bold">{options.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {options.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground hover:text-foreground"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex gap-3 pt-6 pb-6 px-6 bg-card">
                    <Button
                      variant={options.variant === "destructive" ? "destructive" : "default"}
                      size="lg"
                      className="flex-1 font-bold shadow-md"
                      onClick={handleConfirm}
                    >
                      {options.confirmText || "Confirm"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 font-semibold hover:bg-muted"
                      onClick={handleCancel}
                    >
                      {options.cancelText || "Cancel"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (context === undefined) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider");
  }
  return context;
}
