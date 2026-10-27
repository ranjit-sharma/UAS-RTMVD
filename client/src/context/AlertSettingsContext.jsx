import { createContext, useContext, useState, useEffect } from 'react';

const defaultThresholds = {
  humidityMax: 95,
  tempMin: -50,
  windMax: 80
};

const AlertSettingsContext = createContext();

export function AlertSettingsProvider({ children }) {
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('uas_alert_thresholds') || localStorage.getItem('uass_alert_thresholds');
    return saved ? JSON.parse(saved) : defaultThresholds;
  });

  useEffect(() => {
    localStorage.setItem('uas_alert_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  return (
    <AlertSettingsContext.Provider value={{ thresholds, setThresholds }}>
      {children}
    </AlertSettingsContext.Provider>
  );
}

export const useAlertSettings = () => useContext(AlertSettingsContext);
