export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-outline-variant md:px-margin-desktop mt-auto flex w-full flex-col items-center gap-4 border-t px-4 py-8 text-center">
      <span className="font-headline-md text-headline-md text-on-surface">TACTICAL VAULT</span>
      <div className="font-data-label text-data-label flex flex-wrap justify-center gap-4 md:gap-6">
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          Community Discord
        </a>
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          Steam Workshop
        </a>
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          Submit Tactic
        </a>
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          Privacy Policy
        </a>
      </div>
      <p className="font-data-label text-data-label text-on-surface-variant/50 mt-4 text-xs md:text-sm">
        © 2024 TACTICAL VAULT. ALL RIGHTS RESERVED. CS2 IS A TRADEMARK OF VALVE CORP.
      </p>
    </footer>
  );
}
