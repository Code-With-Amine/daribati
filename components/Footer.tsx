import { Home, FileText, RefreshCw, User } from "lucide-react"

const navItems = [
  { icon: Home, label: "Home" },
  { icon: FileText, label: "Docs" },
  { icon: RefreshCw, label: "History" },
  { icon: User, label: "Profile" },
]

export default function FooterNav() {
  return (
<footer
  className="
    my-4
    mx-auto
    w-[90%] max-w-[880px]
    bg-white
    border border-slate-200
    rounded-2xl
    shadow-lg
    z-50
    pb-[env(safe-area-inset-bottom)]
  "
>


  <div className="max-w-7xl mx-auto flex items-center justify-between px-2 py-3 md:py-4">
    {navItems.map((item, index) => {
      const Icon = item.icon
      return (
        <button
          key={index}
          className="
            group relative flex flex-col items-center justify-center
            w-14 h-14 rounded-xl
            transition-all duration-300 ease-out
            hover:bg-gradient-to-r
            hover:from-[#262EE3]
            hover:to-[#150AA3]
          "
        >
          <Icon className="
            w-6 h-6 text-slate-500
            transition-colors duration-300
            group-hover:text-white
          " />

          <span className="
            absolute -bottom-3
            w-1.5 h-1.5 rounded-full
            bg-[#262EE3]
            opacity-0 scale-0
            transition-all duration-300
            group-hover:opacity-100
            group-hover:scale-100
          " />
        </button>
      )
    })}
  </div>
</footer>

  )
}
