import { toast } from 'react-toastify';
import type SDK from './sdk/SDK';
import type { Dispatch } from '@reduxjs/toolkit';
import { showConfirm } from './stores/confirmSlice';
import { setDontAskCardmarket } from './stores/userSlice';
import React from 'react';
import { Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
import { registerCustom, registerResolver } from './services/confirmService';

export function getTabProps(index: number) {
  return {
    id: `navigation-tab-${index}`,
    'aria-controls': `navigation-tabpanel-${index}`,
  };
}

/**
 * Copy text to clipboard and show a toast notification
 */
export function clipboard(text: string): void {
  navigator.clipboard.writeText(text);
  toast.info(`Copied to clipboard: ${text}`);
}

/**
 * Handles opening Cardmarket URL with user confirmation
 * @param cardNumber - The card number to fetch the marketplace URL for
 * @param sdk - SDK instance for making API calls
 * @param dispatch - Redux dispatch function
 * @param dontAskCardmarket - Current state of "don't ask again" preference
 * @returns Promise that resolves when the process is complete
 */
export async function handleCardmarketUrl(
  cardNumber: string,
  sdk: SDK,
  dispatch: Dispatch,
  dontAskCardmarket: boolean
): Promise<void> {
  try {
    toast.info('Fetching Cardmarket URL...');

    // Fetch the marketplace URL
    const url = await sdk.cardsManager.getCardMarketplaceUrl(cardNumber);

    if (!url) {
      toast.error('Failed to fetch Cardmarket URL');
      return;
    }

    // If user has selected "don't ask again", open directly
    if (dontAskCardmarket) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success('Opening Cardmarket...');
      return;
    }

    // Show confirmation dialog with "don't ask again" checkbox
    const confirmId = `cardmarket-confirm-${Date.now()}`;
    let dontAskAgain = false;

    // Create custom content with checkbox
    const customContent = React.createElement(
      Box,
      { sx: { display: 'flex', flexDirection: 'column', gap: 2 } },
      React.createElement(
        Typography,
        { variant: 'body1' },
        `You will be redirected to:`
      ),
      React.createElement(
        Typography,
        {
          variant: 'body2',
          sx: {
            wordBreak: 'break-all',
            color: 'primary.main',
            fontWeight: 'bold',
          },
        },
        url
      ),
      React.createElement(FormControlLabel, {
        control: React.createElement(Checkbox, {
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            dontAskAgain = e.target.checked;
          },
        }),
        label: "Don't ask me again",
      })
    );

    registerCustom(confirmId, customContent);

    // Wait for user confirmation using Promise
    const confirmed = await new Promise<boolean>((resolve) => {
      registerResolver(confirmId, resolve);

      dispatch(
        showConfirm({
          id: confirmId,
          title: 'Open Cardmarket?',
          message: '',
          customKey: confirmId,
          variant: 'info',
          confirmText: 'Open',
          cancelText: 'Cancel',
          dismissible: true,
          confirmTextIsHref: true,
          confirmHref: url,
        })
      );
    });

    if (confirmed) {
      // Save preference if checkbox was checked
      if (dontAskAgain) {
        dispatch(setDontAskCardmarket(true));
        toast.info("Preference saved: Won't ask again for Cardmarket links");
      }
    }
  } catch (error) {
    console.error('Error fetching Cardmarket URL:', error);
    toast.error('Failed to fetch Cardmarket URL. Please try again.');
  }
}
