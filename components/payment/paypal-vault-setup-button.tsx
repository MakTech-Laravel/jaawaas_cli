'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface PayPalVaultSetupButtonProps {
  mode?: 'save' | 'update';
  onError?: (error: string) => void;
  className?: string;
}

export const PAYPAL_PENDING_VAULT_TOKEN_KEY = 'paypal_pending_vault_setup_token';
export const PAYPAL_PENDING_VAULT_MODE_KEY = 'paypal_pending_vault_setup_mode';

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    }).response;
    const fieldError =
      response?.data?.errors?.auto_renew?.[0] ||
      response?.data?.errors?.return_url?.[0] ||
      response?.data?.errors?.vault_setup_token?.[0];
    if (fieldError) return fieldError;
    if (response?.data?.message) return response.data.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/**
 * Starts PayPal vault approval via redirect (no charge).
 * On return to /dashboard/manufacturer/subscription?vaultSetup=1 the page completes enable/update.
 */
export function PayPalVaultSetupButton({
  mode = 'save',
  onError,
  className = '',
}: PayPalVaultSetupButtonProps) {
  const [isStarting, setIsStarting] = useState(false);

  const startPayPalVaultSetup = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const returnUrl = `${origin}/dashboard/manufacturer/subscription?vaultSetup=1`;
      const cancelUrl = `${origin}/dashboard/manufacturer/subscription?vaultSetup=cancel`;

      const response = await apiClient.post('/manufacturer/subscriptions/vault-setup-token', {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      });

      const id = response.data?.data?.id;
      const approveUrl = response.data?.data?.approve_url;

      if (!id || typeof id !== 'string') {
        throw new Error(response.data?.message || 'Failed to create PayPal setup token');
      }

      if (!approveUrl || typeof approveUrl !== 'string') {
        throw new Error('PayPal did not return an approval URL. Check vault is enabled on the PayPal app.');
      }

      sessionStorage.setItem(PAYPAL_PENDING_VAULT_TOKEN_KEY, id);
      sessionStorage.setItem(PAYPAL_PENDING_VAULT_MODE_KEY, mode);

      window.location.href = approveUrl;
    } catch (err) {
      setIsStarting(false);
      onError?.(axiosErrorMessage(err, 'Failed to start PayPal payment method setup'));
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Button
        type="button"
        className="w-full"
        onClick={() => {
          void startPayPalVaultSetup();
        }}
        disabled={isStarting}
      >
        {isStarting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to PayPal...
          </>
        ) : (
          'Continue with PayPal'
        )}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        You will authorize PayPal once. No charge now — this saves your method for auto-renew.
      </p>
    </div>
  );
}
