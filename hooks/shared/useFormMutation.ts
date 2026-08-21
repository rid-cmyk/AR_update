import { useState, useCallback } from 'react';
import { message, Modal } from 'antd';

export interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  confirmMessage?: string;
}

export function useFormMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      if (options.confirmMessage) {
        const confirmed = await new Promise<boolean>((resolve) => {
          Modal.confirm({ 
            content: options.confirmMessage, 
            onOk: () => resolve(true), 
            onCancel: () => resolve(false) 
          });
        });
        if (!confirmed) return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        if (options.successMessage) {
          message.success(options.successMessage);
        }
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        message.error(options.errorMessage || errorObj.message || 'Terjadi kesalahan');
        options.onError?.(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => { setError(null); setLoading(false); }, []);

  return { mutate, loading, error, reset };
}
