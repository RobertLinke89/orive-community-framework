import { CATEGORIES } from "@/lib/claim/categories";
import type { CategoryKey } from "@/lib/claim/categories";
import { dateLabel, fromPriceLabel, listingPath, OFFER_TYPES, priceLabel, TYPE_CHIP, TYPE_LABEL, type OfferType, type PublicOffer } from "@/lib/offers/model";

/** Day-mode (white) offer UI. Every card has an image: own image or category image labelled "Beispielbild". */
function Img({ o, eager = false, cls = "oimg" }: { o: PublicOffer; eager?: boolean; cls?: string }) {
  return (
    <figure className={cls}>
      <img src={o.image.url} alt={o.image.alt} loading={eager ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" />
      {o.image.label ? <span className="imglabel">{o.image.label}</span> : null}
    </figure>
  );
}

function Meta({ o }: { o: PublicOffer }) {
  const d = o.type === "event" ? dateLabel(o.startsAt) : null;
  const bits = [d, o.duration].filter(Boolean) as string[];
  return bits.length ? <p className="ometa">{bits.join(" · ")}</p> : null;
}

export function OfferCard({ o, showFacilitator = false }: { o: PublicOffer; showFacilitator?: boolean }) {
  const p = priceLabel(o);
  return (
    <a className="ocard" href={o.href} data-type={o.type}>
      <Img o={o} />
      <div className="obody">
        <span className="otype">{TYPE_CHIP[o.type]}</span>
        <h3>{o.title}</h3>
        <Meta o={o} />
        {showFacilitator ? <p className="ofac">{o.facilitator.name}{o.facilitator.city ? ` · ${o.facilitator.city}` : ""}</p> : null}
        {p ? <b className="oprice">{p}</b> : null}
      </div>
    </a>
  );
}

/** (1) Section on the facilitator profile, grouped by type. Renders nothing without offers. */
export function FacilitatorOffersSection({ groups, category }: { groups: { type: OfferType; offers: PublicOffer[] }[]; category: CategoryKey }) {
  if (!groups.length) return null;
  const from = fromPriceLabel(groups.flatMap((g) => g.offers));
  return (
    <section className="orive-offers" id="angebote" aria-label="Angebote">
      <div className="owrap">
        <h2>Angebote{from ? <small className="ofrom">{from}</small> : null}</h2>
        {groups.map((g) => (
          <div key={g.type} className="ogroup">
            <h3 className="oghead">{TYPE_LABEL[g.type]} <span>{g.offers.length}</span></h3>
            <div className="ogrid">{g.offers.map((o) => <OfferCard key={o.id} o={o} />)}</div>
          </div>
        ))}
        <p className="omore"><a href={listingPath(category)}>Alle {CATEGORIES[category].label}-Angebote ansehen</a></p>
      </div>
    </section>
  );
}

/** (2) /{category}/angebote with type filter (plain links -> works without JS, crawlable). */
export function CategoryOffersView({ category, type, offers, counts }: { category: CategoryKey; type: OfferType | null; offers: PublicOffer[]; counts: Record<OfferType, number> }) {
  const c = CATEGORIES[category];
  const total = OFFER_TYPES.reduce((n, t) => n + counts[t], 0);
  return (
    <main className="orive-offers page" style={{ ["--acc" as any]: c.accent }}>
      <div className="owrap">
        <p className="crumb"><a href="/">Orive</a> / <span>{c.label}</span></p>
        <h1>{c.label}: {type ? TYPE_LABEL[type] : "Alle Angebote"}</h1>
        <nav className="ofilter" aria-label="Nach Typ filtern">
          <a href={listingPath(category)} aria-current={!type ? "page" : undefined}>Alle <span>{total}</span></a>
          {OFFER_TYPES.map((t) => (
            <a key={t} href={listingPath(category, t)} aria-current={type === t ? "page" : undefined} className={counts[t] ? "" : "empty"}>{TYPE_LABEL[t]} <span>{counts[t]}</span></a>
          ))}
        </nav>
        {offers.length ? <div className="ogrid">{offers.map((o) => <OfferCard key={o.id} o={o} showFacilitator />)}</div>
          : <p className="oempty">Hier erscheinen bald Angebote.</p>}
      </div>
    </main>
  );
}

/** (3) Offer detail; links back to the facilitator profile. */
export function OfferDetailView({ offer: o, more }: { offer: PublicOffer; more: PublicOffer[] }) {
  const c = CATEGORIES[o.facilitator.category];
  const p = priceLabel(o);
  return (
    <main className="orive-offers page detail" style={{ ["--acc" as any]: c.accent }}>
      <div className="owrap">
        <p className="crumb"><a href={listingPath(o.facilitator.category)}>{c.label}-Angebote</a> / <a href={listingPath(o.facilitator.category, o.type)}>{TYPE_LABEL[o.type]}</a></p>
        <div className="dgrid">
          <Img o={o} eager cls="oimg dimg" />
          <div>
            <span className="otype">{TYPE_CHIP[o.type]}</span>
            <h1>{o.title}</h1>
            <p className="dfac">von <a href={o.facilitator.href}>{o.facilitator.name}</a>{o.facilitator.city ? ` · ${o.facilitator.city}` : ""}</p>
            <Meta o={o} />
            {p ? <p className="dprice">{p}</p> : null}
            <div className="dact">
              <a className="obook" href={o.facilitator.href}>Termin buchen</a>
              <a className="oghost" href={o.facilitator.href}>Zum Profil von {o.facilitator.name}</a>
            </div>
            {o.description ? <p className="ddesc">{o.description}</p> : null}
            {o.externalUrl ? <p className="dsrc"><a href={o.externalUrl} rel="nofollow noopener noreferrer" target="_blank">Details auf der Website des Anbieters</a></p> : null}
          </div>
        </div>
        {more.length ? (<><h2>Weitere Angebote von {o.facilitator.name}</h2><div className="ogrid">{more.map((m) => <OfferCard key={m.id} o={m} />)}</div></>) : null}
      </div>
    </main>
  );
}
