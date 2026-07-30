import { createContext, useState } from 'react'

export const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null)

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  )
}
