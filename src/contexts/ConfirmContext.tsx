import { createContext, useContext, useState, ReactNode } from 'react';
import ConfirmModal, { ConfirmType } from '../shared/components/ui/ConfirmModal';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: ''
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
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
      />
    </ConfirmContext.Provider>
  );
}
