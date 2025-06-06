
import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: 'fast' | 'slow' | 'offline';
  saveData: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'fast',
    saveData: false
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      let isSlowConnection = false;
      let connectionType: 'fast' | 'slow' | 'offline' = 'fast';
      
      if (!navigator.onLine) {
        connectionType = 'offline';
      } else if (connection) {
        // Consider 2G, slow-2g as slow connections
        const slowConnections = ['slow-2g', '2g'];
        isSlowConnection = slowConnections.includes(connection.effectiveType);
        connectionType = isSlowConnection ? 'slow' : 'fast';
      }

      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection,
        connectionType,
        saveData: connection?.saveData || false
      });
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Listen for connection changes if available
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}
