import { useState, useCallback } from 'react';

interface UseOptimisticUpdateOptions<T> {
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
}

/**
 * Optimistic update hook
 * Veriyi hemen güncelle, API çağrısı başarısız olursa geri al
 * 
 * @param initialData - Başlangıç verisi
 * @param options - Seçenekler
 * @returns [data, updateOptimistically, isLoading]
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const updateOptimistically = useCallback(
    async <R,>(
      optimisticData: T,
      apiCall: () => Promise<R>
    ): Promise<R | null> => {
      const previousData = data;
      
      // Optimistic update
      setData(optimisticData);
      setIsLoading(true);

      try {
        // API çağrısı
        const result = await apiCall();
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        setIsLoading(false);
        return result;
      } catch (error) {
        // Hata durumunda geri al
        setData(previousData);
        setIsLoading(false);
        
        if (options.onError) {
          options.onError(error as Error);
        }
        
        return null;
      }
    },
    [data, options]
  );

  return { data, updateOptimistically, isLoading, setData };
}
