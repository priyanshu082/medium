import { cn } from "@/lib/utils"

const Footer = () => {
  return (
    <footer className={cn(
      "border-t",
      "py-8 md:py-6", 
      "bg-gradient-to-r from-slate-100 to-gray-100"
    )}>
      <div className="container flex flex-col items-center justify-between gap-6 md:h-32 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold">क</span>
            </div>
            <span className="font-semibold text-orange-600">कुम्भ</span>
          </div>
         
        </div>
        <div className="flex flex-col items-center gap-2 md:items-end">
        <p className="text-center text-lg text-gray-600 mt-2 md:text-left">
            Created by Priyanshu Singh <br />
            S/O: Mr. Pramod Kumar Singh 
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer