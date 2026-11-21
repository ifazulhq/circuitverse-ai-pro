import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-24 py-8 px-10 md:px-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-400 text-sm">
          © 2026 CircuitVerse AI Pro. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm text-gray-400">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-300 hover:text-blue-400"
          >
            GitHub
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-300 hover:text-blue-400"
          >
            LinkedIn
          </a>

          <Link
            href="/contact"
            className="transition-colors duration-300 hover:text-blue-400"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}