'use client';

export default function BrandLogo({ className = 'w-48 h-20' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Pinyon+Script&display=swap');
          .brand-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 5px;
          }
          .brand-subtitle {
            font-family: 'Pinyon Script', cursive;
            font-size: 46px;
          }
        `}} />
      </defs>

      {/* PIERRE GUSZO */}
      <text
        x="250"
        y="95"
        fill="currentColor"
        fontSize="54"
        textAnchor="middle"
        className="brand-title"
      >
        PIERRE GUSZO
      </text>

      {/* Crafted for your Elegance */}
      <text
        x="250"
        y="155"
        fill="currentColor"
        textAnchor="middle"
        className="brand-subtitle"
      >
        Crafted for your Elegance
      </text>
    </svg>
  );
}
