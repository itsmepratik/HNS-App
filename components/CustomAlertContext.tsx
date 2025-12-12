import React, { createContext, useCallback, useContext, useState } from 'react';
import CustomDialog from './CustomDialog';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertContextType {
  showAlert: (
    title: string,
    message: string,
    type?: AlertType,
    actions?: AlertAction[]
  ) => void;
  hideAlert: () => void;
}

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined);

export function CustomAlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    type: AlertType;
    actions: AlertAction[];
  }>({
    title: '',
    message: '',
    type: 'info',
    actions: [],
  });

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      type: AlertType = 'info',
      actions: AlertAction[] = []
    ) => {
      // If no actions provided, add a default "OK" button
      const alertActions = actions.length > 0 ? actions : [
        { text: 'OK', onPress: () => setVisible(false), style: 'default' }
      ] as AlertAction[];

      // Wrap actions to ensure they close the modal if they don't explicitly do so?
      // Actually standard behavior is the callback runs, and we might need to close it manually or automatically.
      // Easiest pattern for Alert.alert replacement is to just run the callback.
      // But typically Alert.alert buttons auto-dismiss. Let's wrap them to auto-dismiss.
      
      const wrappedActions = alertActions.map(action => ({
        ...action,
        onPress: () => {
          action.onPress?.();
          setVisible(false);
        }
      }));

      setConfig({
        title,
        message,
        type,
        actions: wrappedActions,
      });
      setVisible(true);
    },
    []
  );

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <CustomAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomDialog
        visible={visible}
        title={config.title}
        message={config.message}
        type={config.type}
        actions={config.actions}
        onClose={hideAlert}
      />
    </CustomAlertContext.Provider>
  );
}

export function useCustomAlert() {
  const context = useContext(CustomAlertContext);
  if (context === undefined) {
    throw new Error('useCustomAlert must be used within a CustomAlertProvider');
  }
  return context;
}
