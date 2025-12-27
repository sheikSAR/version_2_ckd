import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ConfiguratorContextType {
  configPath: string | null
  setConfigPath: (path: string | null) => void
}

const ConfiguratorContext = createContext<ConfiguratorContextType | undefined>(undefined)

export const ConfiguratorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configPath, setConfigPath] = useState<string | null>(null)

  return (
    <ConfiguratorContext.Provider value={{ configPath, setConfigPath }}>
      {children}
    </ConfiguratorContext.Provider>
  )
}

export const useConfigurator = () => {
  const context = useContext(ConfiguratorContext)
  if (!context) {
    throw new Error('useConfigurator must be used within ConfiguratorProvider')
  }
  return context
}
