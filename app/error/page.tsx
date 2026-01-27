"use client";

import { Wrench } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 px-6 text-center">
      {/* Animated Icon */}
      <div className="animate-bounce mb-6">
        <Wrench className="w-20 h-20 text-blue-600" />
      </div>

      {/* Main Message */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Cette page est en construction
      </h1>
      <p className="text-lg text-slate-600 max-w-xl mb-8">
        Je travaille encore pour améliorer cette section. Merci de votre patience 🙏. Revenez bientôt pour découvrir les nouveautés !
      </p>

      {/* Go Back Home Button */}
      <Link
        href="/"
        className="inline-block px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
