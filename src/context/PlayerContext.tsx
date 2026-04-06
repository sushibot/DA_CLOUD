import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Track } from '../types'

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused'

export type PlayerState = {
  tracks: Track[]
  currentTrack: Track | null
  status: PlayerStatus
  volume: number
}

export type PlayerAction =
  | { type: 'SET_TRACKS'; payload: Track[] }
  | { type: 'LOAD_TRACK'; payload: Track }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_VOLUME'; payload: number }

const LAST_TRACK_KEY = 'lastTrack'

function loadLastTrack(): Track | null {
  try {
    const raw = localStorage.getItem(LAST_TRACK_KEY)
    return raw ? (JSON.parse(raw) as Track) : null
  } catch {
    return null
  }
}

const initialState: PlayerState = {
  tracks: [],
  currentTrack: loadLastTrack(),
  status: 'idle',
  volume: 1,
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_TRACKS':
      return { ...state, tracks: action.payload }
    case 'LOAD_TRACK':
      localStorage.setItem(LAST_TRACK_KEY, JSON.stringify(action.payload))
      return { ...state, currentTrack: action.payload, status: 'loading' }
    case 'PLAY':
      return { ...state, status: 'playing' }
    case 'PAUSE':
      return { ...state, status: 'paused' }
    case 'STOP':
      return { ...state, status: 'paused' }
    case 'SET_VOLUME':
      return { ...state, volume: action.payload }
    default:
      return state
  }
}

type PlayerContextValue = {
  state: PlayerState
  dispatch: React.Dispatch<PlayerAction>
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)
  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
