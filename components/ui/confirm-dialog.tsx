"use client";

import { useState, createContext, useContext, useCallback, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={handleCancel}
            />
            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="w-full max-w-md"
              >
                <Card className="shadow-2xl border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        options.variant === "destructive" 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {options.icon || (
                          options.variant === "destructive" 
                            ? <Trash2 className="h-5 w-5" /> 
                            : <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{options.title}</CardTitle>
                        <CardDescription className="mt-1.5">
                          {options.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancel}
                    >
                      {options.cancelText || "Cancel"}
                    </Button>
                    <Button
                      variant={options.variant === "destructive" ? "destructive" : "default"}
                      className="flex-1"
                      onClick={handleConfirm}
                    >
                      {options.confirmText || "Confirm"}
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
