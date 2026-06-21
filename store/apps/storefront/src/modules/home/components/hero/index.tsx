import { Github } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"

const Hero = () => {
  return (
    <div className="relative h-[80vh] w-full border-b-4 border-on-surface bg-surface flex flex-col justify-center items-center overflow-hidden p-6 md:p-12">
      {/* Decorative Splatter Background */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none select-none z-0">
        <svg
          className="text-primary-container opacity-20 w-[600px] h-[600px]"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 15 C35 5 20 15 15 35 C10 50 2 60 8 75 C15 88 30 95 50 92 C70 95 85 88 92 75 C98 60 90 50 85 35 C80 15 65 5 50 15 Z" />
          <circle cx="15" cy="20" r="5" />
          <circle cx="82" cy="15" r="4" />
          <circle cx="88" cy="80" r="6" />
          <circle cx="10" cy="70" r="3" />
          <path d="M35 85 Q30 95 28 98" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <path d="M65 88 Q70 98 72 99" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M50 90 V100" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center text-center gap-8 max-w-4xl border-4 border-on-surface bg-surface p-8 md:p-16 brutalist-shadow-lg">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-sm md:text-base font-bold text-primary uppercase tracking-[0.2em] border-2 border-primary px-3 py-1 w-fit mx-auto bg-primary/10">
            STREETWEAR ARCHIVE
          </span>
          <h1 className="font-display-xl text-on-surface leading-none uppercase select-none">
            SURPLUS
            <br />
            CLAIMS
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto mt-2 leading-relaxed">
            Raw digital rebellion. Decoupled commerce engine pushing premium print-on-demand drops directly to the void.
          </p>
        </div>

        <a
          href="https://github.com/medusajs/dtc-starter"
          target="_blank"
          className="w-full sm:w-auto"
        >
          <Button variant="primary" className="w-full sm:w-auto text-base-semi py-3 px-8 border-2 border-black">
            EXPLORE THE SOURCE <Github className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </div>
    </div>
  )
}

export default Hero
