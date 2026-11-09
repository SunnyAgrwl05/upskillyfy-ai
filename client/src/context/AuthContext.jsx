import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'
const AuthContext = createContext()
export function AuthProvider({ children }) {
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true)
 useEffect(()=>{authAPI.me().then(r=>setUser(r.data)).catch(()=>setUser(null)).finally(()=>setLoading(false))},[])
 const login=async(email,password)=>{const r=await authAPI.login({email,password});setUser(r.data.user);return r.data}
 const register=async data=>{const r=await authAPI.register(data);setUser(r.data.user);return r.data}
 const loginWithGoogle=async(credential,options={})=>{const r=await authAPI.google({credential,...options});setUser(r.data.user);return r.data}
 const logout=async()=>{try{await authAPI.logout()}finally{setUser(null)}}
 return <AuthContext.Provider value={{user,loading,login,register,loginWithGoogle,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext)
