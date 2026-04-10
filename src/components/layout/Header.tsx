import { Menu, Moon, Sun } from 'lucide-react'
import { useStore } from '../../store'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { darkMode, toggleDarkMode } = useStore()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-[#0a0a0f]/80 backdrop-blur-xl">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-white/10 dark:text-gray-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-white/10 dark:text-gray-400 transition-colors"
        title={darkMode ? 'Mode clair' : 'Mode sombre'}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  )
}
