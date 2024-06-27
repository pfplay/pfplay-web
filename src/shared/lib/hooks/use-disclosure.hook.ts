import { useCallback, useState } from 'react';

type UseDisclosureProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
};

/**
 * @see reference - https://chakra-ui.com/docs/hooks/use-disclosure
 */
export function useDisclosure(props: UseDisclosureProps = {}) {
  const [localOpenState, setopen] = useState(props.defaultOpen || false);

  const open = props.open !== undefined ? props.open : localOpenState;
  const isControlled = props.open !== undefined;

  const onClose = useCallback(() => {
    if (!isControlled) {
      setopen(false);
    }
    props.onClose?.();
  }, [isControlled]);

  const onOpen = useCallback(() => {
    if (!isControlled) {
      setopen(true);
    }
    props.onOpen?.();
  }, [isControlled]);

  const onToggle = useCallback(() => {
    if (open) {
      onClose();
    } else {
      onOpen();
    }
  }, [open, onOpen, onClose]);

  return {
    open,
    onOpen,
    onClose,
    onToggle,
  };
}
