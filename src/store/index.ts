import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Site, Avance, Photo, RapportHebdo, TrajetSite } from '../types'
import { SEED_SITES, SEED_AVANCES, SEED_TRAJETS } from '../lib/seed-data'

export interface AuthUser {
  email: string
  name: string
}

interface AppState {
  // Data
  sites: Site[]
  avances: Avance[]
  photos: Photo[]
  rapports: RapportHebdo[]
  trajets: TrajetSite[]

  // Settings
  darkMode: boolean
  initialized: boolean

  // Auth
  currentUser: AuthUser | null
  login: (email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void

  // Actions — sites
  setSites: (sites: Site[]) => void
  addSite: (site: Site) => void
  updateSite: (id: string, updates: Partial<Site>) => void

  // Actions — avances
  setAvances: (avances: Avance[]) => void
  addAvance: (avance: Avance) => void
  updateAvance: (id: string, updates: Partial<Avance>) => void
  deleteAvance: (id: string) => void

  // Actions — photos
  setPhotos: (photos: Photo[]) => void
  addPhoto: (photo: Photo) => void
  updatePhoto: (id: string, updates: Partial<Photo>) => void

  // Actions — rapports
  setRapports: (rapports: RapportHebdo[]) => void
  addRapport: (rapport: RapportHebdo) => void

  // Actions — trajets
  setTrajets: (trajets: TrajetSite[]) => void
  addTrajet: (trajet: TrajetSite) => void
  updateTrajet: (id: string, updates: Partial<TrajetSite>) => void
  deleteTrajet: (id: string) => void

  // Actions — settings
  toggleDarkMode: () => void
  resetData: () => void
  initSeed: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      sites: [],
      avances: [],
      photos: [],
      rapports: [],
      trajets: [],
      darkMode: true,
      initialized: false,
      currentUser: null,

      login: (email, password) => {
        // Credentials autorisees (demo)
        const ACCOUNTS: Record<string, { password: string; name: string }> = {
          'admin@sitepilot.ma': { password: 'sitepilot2026', name: 'Administrateur' },
          'rachid@sitepilot.ma': { password: 'rachid2026', name: 'Rachid Idrissi' },
          'mekki@sitepilot.ma': { password: 'mekki2026', name: 'Mekki' },
        }
        const key = email.trim().toLowerCase()
        const account = ACCOUNTS[key]
        if (!account) {
          return { ok: false, error: 'Email introuvable' }
        }
        if (account.password !== password) {
          return { ok: false, error: 'Mot de passe incorrect' }
        }
        set({ currentUser: { email: key, name: account.name } })
        return { ok: true }
      },

      logout: () => set({ currentUser: null }),

      setSites: (sites) => set({ sites }),

      addSite: (site) =>
        set((state) => ({ sites: [...state.sites, site] })),

      updateSite: (id, updates) =>
        set((state) => ({
          sites: state.sites.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      setAvances: (avances) => set({ avances }),

      addAvance: (avance) =>
        set((state) => ({ avances: [...state.avances, avance] })),

      updateAvance: (id, updates) =>
        set((state) => ({
          avances: state.avances.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      deleteAvance: (id) =>
        set((state) => ({
          avances: state.avances.filter((a) => a.id !== id),
        })),

      setPhotos: (photos) => set({ photos }),

      addPhoto: (photo) =>
        set((state) => ({ photos: [...state.photos, photo] })),

      updatePhoto: (id, updates) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      setRapports: (rapports) => set({ rapports }),

      addRapport: (rapport) =>
        set((state) => ({ rapports: [rapport, ...state.rapports] })),

      setTrajets: (trajets) => set({ trajets }),

      addTrajet: (trajet) =>
        set((state) => ({ trajets: [...state.trajets, trajet] })),

      updateTrajet: (id, updates) =>
        set((state) => ({
          trajets: state.trajets.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTrajet: (id) =>
        set((state) => ({
          trajets: state.trajets.filter((t) => t.id !== id),
        })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      resetData: () =>
        set({
          sites: [],
          avances: [],
          photos: [],
          rapports: [],
          trajets: [],
          initialized: false,
        }),

      initSeed: () => {
        if (!get().initialized) {
          set({
            sites: SEED_SITES,
            avances: SEED_AVANCES,
            trajets: SEED_TRAJETS,
            initialized: true,
          })
        } else if (get().trajets.length === 0) {
          // Migration: inject seed trajets for existing installs
          set({ trajets: SEED_TRAJETS })
        }
      },
    }),
    {
      name: 'sitepilot-storage',
    }
  )
)
