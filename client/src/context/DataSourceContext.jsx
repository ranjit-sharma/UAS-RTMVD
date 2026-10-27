import { createContext, useContext, useState } from 'react';

const DataSourceContext = createContext();

export function DataSourceProvider({ children }) {
  const [dataSourceMode, setDataSourceModeState] = useState(() => {
    return localStorage.getItem('uas_data_source') || localStorage.getItem('uass_data_source') || 'instrument';
  }); // 'instrument' or 'simulated'

  const setDataSourceMode = (mode) => {
    localStorage.setItem('uas_data_source', mode);
    setDataSourceModeState(mode);
  };

  return (
    <DataSourceContext.Provider value={{ dataSourceMode, setDataSourceMode }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}
