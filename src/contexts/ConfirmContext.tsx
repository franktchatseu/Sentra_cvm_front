import { createContext, useContext, useState, ReactNode } from "react";
import ConfirmModal, {
  ConfirmType,
} from "../shared/components/ui/ConfirmModal";

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  setConfirmLoading: (loading: boolean) => void;
  closeConfirm: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions);
      setResolvePromise(() => resolve);
      setIsLoading(false);
      setIsOpen(true);
    });
  };

  const setConfirmLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const closeConfirm = () => {
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
      // Don't close immediately - let the caller control when to close
      // They should call closeConfirm() after the operation completes
    }
    // Note: We don't close here - the caller will close after API call
  };

  const handleClose = () => {
    if (!isLoading) {
      if (resolvePromise) {
        resolvePromise(false);
        setResolvePromise(null);
      }
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <ConfirmContext.Provider
      value={{ confirm, setConfirmLoading, closeConfirm }}
    >
      {children}
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        type={options.type}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        isLoading={isLoading}
      />
    </ConfirmContext.Provider>
  );
}
