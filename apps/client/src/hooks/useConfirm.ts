import { useCallback, createElement, type FC } from 'react';
import { useDispatch } from 'react-redux';
import { showConfirm, closeConfirm } from '../stores/confirmSlice';
import {
  confirmService,
  registerResolver,
  registerCustom,
} from '../services/confirmService';
import type { ConfirmVariant } from '../stores/confirmSlice';

export type ConfirmOptions = {
  title?: string;
  message?: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string | null;
  dismissible?: boolean;
  custom?: FC | null;
};

/**
 * Generates a unique ID for confirmation dialogs.
 */
const generateConfirmId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Hook to show confirmation dialogs.
 * Provides a testable interface for confirmation functionality.
 *
 * @example
 * const { confirm } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     variant: 'warning',
 *   });
 *
 *   if (confirmed) {
 *     // Perform deletion
 *   }
 * };
 */
export const useConfirm = () => {
  const dispatch = useDispatch();

  const confirm = useCallback(
    (opts: ConfirmOptions): Promise<boolean> => {
      const id = generateConfirmId();

      return new Promise<boolean>((resolve) => {
        registerResolver(id, resolve);

        if (opts.custom) {
          registerCustom(id, createElement(opts.custom));
        }

        dispatch(
          showConfirm({
            id,
            title: opts.title,
            message: opts.message,
            variant: opts.variant,
            confirmText: opts.confirmText,
            cancelText:
              typeof opts.cancelText === 'undefined'
                ? 'Cancel'
                : opts.cancelText,
            dismissible:
              typeof opts.dismissible === 'undefined' ? true : opts.dismissible,
            customKey: opts.custom ? id : null,
          })
        );
      });
    },
    [dispatch]
  );

  const resolve = useCallback(
    (id: string, value: boolean) => {
      confirmService.resolveConfirm(id, value);
      dispatch(closeConfirm());
    },
    [dispatch]
  );

  return { confirm, resolve };
};

export default useConfirm;
