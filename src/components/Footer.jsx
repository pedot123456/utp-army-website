export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/board/ARM_1.png" alt="ARMy Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="text-gray-900 text-xl font-bold block">ARMy</span>
              <span className="text-xs text-gray-500">Marketing &amp; Admission Youth</span>
            </div>
          </div>

          <div className="flex gap-4 text-xl">
            <a
              href="https://www.instagram.com/utp.army/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#003865] transition"
            >
              <i className="fab fa-instagram" />
            </a>
            <a
              href="https://www.linkedin.com/company/admission-records-marketing-youth-army"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#003865] transition"
            >
              <i className="fab fa-linkedin" />
            </a>
            <a
              href="https://www.tiktok.com/@utp.army"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#003865] transition"
            >
              <i className="fab fa-tiktok" />
            </a>
            <a
              href="mailto:army_arm@utp.edu.my"
              className="text-gray-400 hover:text-[#003865] transition"
            >
              <i className="fa-regular fa-envelope" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; 2026 ARMy · Universiti Teknologi PETRONAS</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
