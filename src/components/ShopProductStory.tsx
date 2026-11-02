type ShopProductStoryProps = {
  about: string;
  make: string;
  use: string;
  isDe: boolean;
  photos?: { about?: string; make?: string; use?: string };
};

export function ShopProductStory({ about, make, use, isDe, photos }: ShopProductStoryProps) {
  const sections = [
    { title: isDe ? "Das Produkt" : "The product", body: about, image: photos?.about },
    { title: isDe ? "Herstellung" : "How it is made", body: make, image: photos?.make },
    { title: isDe ? "Anwendung" : "How to use it", body: use, image: photos?.use },
  ];

  return (
    <section className="mt-10 space-y-3 border-t border-slate-200 pt-8 dark:border-white/10">
      {sections.map((section) => (
        <article
          key={section.title}
          className="flex gap-4 rounded-xl bg-slate-50 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5 dark:bg-white/[0.035]"
        >
          {section.image ? (
            <img
              src={section.image}
              alt=""
              className="h-24 w-24 shrink-0 rounded-md bg-white object-cover sm:h-28 sm:w-28"
            />
          ) : null}
          <div className="min-w-0">
            <h2 className="mb-1.5 text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
              {section.title}
            </h2>
            <p className="text-[13px] font-light leading-6 text-slate-600 dark:text-white/70">
              {section.body}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
