import { useCallback, createElement, type FC } from 'react';
import { useDispatch } from 'react-redux';
import { showConfirm, closeConfirm } from '../stores/confirmSlice';
import { registerResolver } from '../services/confirmService';
import { registerCustom } from '../services/confirmService';
import type { ConfirmVariant } from '../stores/confirmSlice';

type ConfirmOptions = {
  title?: string;
  message?: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string | null;
  dismissible?: boolean;
  custom?: FC | null;
};

const resolvers = new Map<string, { resolve: (v: boolean) => void }>();

export const useConfirm = () => {
  const dispatch = useDispatch();

  const makeId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  const confirm = useCallback(
    (opts: ConfirmOptions) => {
      const id = makeId();

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
      const r = resolvers.get(id);
      if (r) {
        r.resolve(value);
        resolvers.delete(id);
      }
      dispatch(closeConfirm());
    },
    [dispatch]
  );

  return { confirm, resolve };
};

export default useConfirm;
