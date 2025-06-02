import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

export const userAuthStore = create((set,get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdateProfile: false,
  isUpdatingProfile: false,
  onlineUsers:[],
  socket: null,


  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check')
      set({ authUser: res.data.user })
      get().connectSocket()
    } catch (error) {
      console.log('error in check auth', error)
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post('/auth/signUp', data)
      set({ authUser: res.data.newUser })
      get().connectSocket()
      toast.success('Account Created Successfully !')
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isSigningUp: false })
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      const res = await axiosInstance.post('/auth/login', data)
      set({ authUser: res.data?.user })
      get().connectSocket()
      toast.success('Login Successfully !')
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isLoggingIn: false })
    }
  },

  logout: async () => {
    try {
      axiosInstance.post('/auth/logout')
      set({ authUser: null })
      get().disconnectSocket()
      toast.success('Logout Successfully!')
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

 updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.patch("/auth/update-profile", data);
      set({ authUser: res.data?.updatedUser });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: ()=>{
    const { authUser } = get();
    if(!authUser || get().socket?.connected) return;
    
    const socket = io(import.meta.env.VITE_BASE_URL, {
      query: {
        userId: authUser._id
      }
    })
    socket.connect()

    socket.on("getOnlineUsers", (userIds)=>{
      set({onlineUsers: userIds})
    })

    set({socket: socket})
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}))