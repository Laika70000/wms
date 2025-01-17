import { useState } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  const confirm = (message: string, onConfirm: () => void) => {
    setConfirmation({
      isOpen: true,
      message,
      onConfirm
    });
  };

  const closeConfirmation = () => {
    setConfirmation({
      isOpen: false,
      message: '',
      onConfirm: () => {}
    });
  };

  return {
    confirmation,
    confirm,
    closeConfirmation
  };
};