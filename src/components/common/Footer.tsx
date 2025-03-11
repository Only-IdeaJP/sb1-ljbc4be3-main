import { Link } from "react-router-dom";
import { FOOTER_LINKS } from "../../../constant/Constant";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-4">
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="hover:text-indigo-600">
                {label}
              </Link>
            ))}
          </div>

          {/* Dynamic Copyright */}
          <div className="text-center text-sm text-gray-500">
            © {currentYear} Sumire AI School. All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
