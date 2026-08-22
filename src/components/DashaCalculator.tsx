"use client";

import { useMemo, useState } from "react";
import {
  NAKSHATRAS,
  DASHA_SEQUENCE,
  getPlanet,
  palatmak,
  calculateBhukt,
  calculateDashaTimeline,
  formatYMD,
  formatDate,
  parseDateInput,
  type Nakshatra,
} from "@/lib/vimshottari";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#8a6a2f]">
      {children}
    </span>
  );
}

function Card({
  title,
  step,
  children,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#e8d7ae] bg-[#fffdf6]/90 p-6 shadow-[0_18px_50px_rgba(120,80,20,0.10)] ring-1 ring-[#e8d7ae]">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#c9942c] to-[#8c5a12] font-serif text-sm text-white shadow">
          {step}
        </span>
        <h2 className="font-serif text-xl tracking-wide text-[#5a3210]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NumBox({
  value,
  onChange,
  suffix,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  suffix: string;
  error?: boolean;
}) {
  return (
    <div className="flex-1">
      <div
        className={`flex items-center rounded-xl border bg-white/80 px-3 py-2 transition focus-within:ring-2 ${
          error
            ? "border-[#a11d1d] ring-[#a11d1d]/30"
            : "border-[#e0cb9a] focus-within:ring-[#c9942c]/40"
        }`}
      >
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full bg-transparent text-lg font-semibold text-[#4a2c0c] outline-none"
          placeholder="0"
        />
        <span className="ml-2 text-sm text-[#a08149]">{suffix}</span>
      </div>
    </div>
  );
}

export default function DashaCalculator() {
  const [birthDate, setBirthDate] = useState("2018-01-12");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [nak, setNak] = useState<Nakshatra>(NAKSHATRAS[4]);

  const [bhayatG, setBhayatG] = useState("6");
  const [bhayatP, setBhayatP] = useState("25");
  const [bhabhogG, setBhabhogG] = useState("53");
  const [bhabhogP, setBhabhogP] = useState("32");

  const [cycles, setCycles] = useState(9);
  const [showSteps, setShowSteps] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const n = (s: string) => (s === "" ? NaN : Number(s));

  const errors: string[] = [];
  if (!parseDateInput(birthDate)) errors.push("कृपया वैध जन्म तिथि चुनें।");
  if (isNaN(n(bhayatG)) || isNaN(n(bhayatP))) errors.push("भयात की घटी व पल भरें।");
  if (isNaN(n(bhabhogG)) || isNaN(n(bhabhogP))) errors.push("भभोग की घटी व पल भरें।");
  const palErrBhayat = !isNaN(n(bhayatP)) && n(bhayatP) > 59;
  const palErrBhabhog = !isNaN(n(bhabhogP)) && n(bhabhogP) > 59;
  if (palErrBhayat) errors.push("भयात का पल 0 से 59 के बीच होना चाहिए।");
  if (palErrBhabhog) errors.push("भभोग का पल 0 से 59 के बीच होना चाहिए।");

  const bhabhogPalatmak =
    !isNaN(n(bhabhogG)) && !isNaN(n(bhabhogP)) ? palatmak(n(bhabhogG), n(bhabhogP)) : NaN;
  if (!isNaN(bhabhogPalatmak) && bhabhogPalatmak <= 0)
    errors.push("भभोग शून्य नहीं हो सकता।");

  const valid = errors.length === 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAKSHATRAS;
    return NAKSHATRAS.filter(
      (x) =>
        x.hi.includes(q) ||
        x.en.toLowerCase().includes(q) ||
        String(x.index) === q,
    );
  }, [query]);

  const lordPlanet = getPlanet(nak.lord);

  const result = useMemo(() => {
    if (!valid) return null;
    const bd = parseDateInput(birthDate)!;
    const by = palatmak(n(bhayatG), n(bhayatP));
    const bb = palatmak(n(bhabhogG), n(bhabhogP));
    const calc = calculateBhukt(by, bb, lordPlanet.years);
    const timeline = calculateDashaTimeline(bd, nak.lord, calc.bhogya, cycles);
    return { calc, timeline, bd };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, birthDate, bhayatG, bhayatP, bhabhogG, bhabhogP, nak, cycles, lordPlanet.years]);

  const show = submitted && result;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24">
      {/* HEADER */}
      <header className="relative mb-10 mt-10 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,148,44,0.18),transparent_65%)]" />
        <p className="font-serif text-2xl text-[#a11d1d]">॥ श्री गणेशाय नमः ॥</p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide text-[#5a3210] sm:text-6xl">
          विंशोत्तरी दशा गणक
        </h1>
        <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.4em] text-[#a08149] sm:text-sm">
          Vimshottari Dasha • Precision Calculation
        </p>
        <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-[#c9942c]">
          <span className="h-px w-24 bg-gradient-to-r from-transparent to-[#c9942c]" />
          <span className="text-lg">✺</span>
          <span className="h-px w-24 bg-gradient-to-l from-transparent to-[#c9942c]" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card step="१" title="जन्म विवरण">
          <div className="space-y-5">
            <div>
              <Label>जन्म तारीख</Label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e0cb9a] bg-white/80 px-3 py-2 text-lg font-semibold text-[#4a2c0c] outline-none focus:ring-2 focus:ring-[#c9942c]/40"
              />
            </div>
            <div className="relative">
              <Label>जन्म नक्षत्र</Label>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="mt-2 flex w-full items-center justify-between rounded-xl border border-[#e0cb9a] bg-white/80 px-3 py-2 text-left text-lg font-semibold text-[#4a2c0c] focus:ring-2 focus:ring-[#c9942c]/40"
              >
                <span>
                  {nak.hi}{" "}
                  <span className="text-sm font-normal text-[#a08149]">({nak.en})</span>
                </span>
                <span className="text-[#c9942c]">▾</span>
              </button>
              {open && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#e0cb9a] bg-[#fffdf6] shadow-2xl">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="नक्षत्र खोजें… / Search"
                    className="w-full border-b border-[#eadfc3] bg-white px-3 py-2 text-sm outline-none"
                  />
                  <ul className="max-h-64 overflow-y-auto">
                    {filtered.map((x) => (
                      <li key={x.index}>
                        <button
                          type="button"
                          onClick={() => {
                            setNak(x);
                            setOpen(false);
                            setQuery("");
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#faf1dc] ${
                            x.index === nak.index ? "bg-[#f6e9cd]" : ""
                          }`}
                        >
                          <span className="font-semibold text-[#5a3210]">
                            {x.index}. {x.hi}{" "}
                            <span className="font-normal text-[#a08149]">{x.en}</span>
                          </span>
                          <span className="text-[#8a6a2f]">{getPlanet(x.lord).hi}</span>
                        </button>
                      </li>
                    ))}
                    {filtered.length === 0 && (
                      <li className="px-3 py-3 text-sm text-[#a08149]">कोई नक्षत्र नहीं मिला</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#e8d7ae] bg-gradient-to-br from-[#fdf4e0] to-[#faead0] p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a08149]">दशा स्वामी</p>
              <p className="mt-1 font-serif text-3xl text-[#a11d1d]">
                {lordPlanet.symbol} {lordPlanet.hi}
              </p>
              <p className="mt-1 text-sm text-[#6b4b1e]">
                महादशा अवधि: {lordPlanet.years} वर्ष
              </p>
            </div>
          </div>
        </Card>

        <Card step="२" title="पंचांग विवरण">
          <div className="space-y-6">
            <div>
              <Label>भयात (Bhayat)</Label>
              <div className="mt-2 flex gap-3">
                <NumBox value={bhayatG} onChange={setBhayatG} suffix="घटी" />
                <NumBox
                  value={bhayatP}
                  onChange={setBhayatP}
                  suffix="पल"
                  error={palErrBhayat}
                />
              </div>
              {palErrBhayat && (
                <p className="mt-2 text-sm font-semibold text-[#a11d1d]">
                  ⚠ पल का मान 0 से 59 तक ही मान्य है।
                </p>
              )}
            </div>
            <div>
              <Label>भभोग (Bhabhog)</Label>
              <div className="mt-2 flex gap-3">
                <NumBox value={bhabhogG} onChange={setBhabhogG} suffix="घटी" />
                <NumBox
                  value={bhabhogP}
                  onChange={setBhabhogP}
                  suffix="पल"
                  error={palErrBhabhog}
                />
              </div>
              {palErrBhabhog && (
                <p className="mt-2 text-sm font-semibold text-[#a11d1d]">
                  ⚠ पल का मान 0 से 59 तक ही मान्य है।
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-[#e8d7ae] bg-white/70 p-3">
                <p className="text-xs text-[#a08149]">पलात्मक भयात</p>
                <p className="font-serif text-2xl text-[#5a3210]">
                  {isNaN(n(bhayatG)) || isNaN(n(bhayatP))
                    ? "—"
                    : palatmak(n(bhayatG), n(bhayatP))}
                </p>
              </div>
              <div className="rounded-xl border border-[#e8d7ae] bg-white/70 p-3">
                <p className="text-xs text-[#a08149]">पलात्मक भभोग</p>
                <p className="font-serif text-2xl text-[#5a3210]">
                  {isNaN(bhabhogPalatmak) ? "—" : bhabhogPalatmak}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {!valid && (
        <div className="mt-6 rounded-xl border border-[#a11d1d]/30 bg-[#fdf0ee] p-4">
          <ul className="list-inside list-disc text-sm font-semibold text-[#a11d1d]">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          disabled={!valid}
          onClick={() => setSubmitted(true)}
          className="rounded-full bg-gradient-to-r from-[#a11d1d] via-[#c9942c] to-[#a11d1d] px-10 py-4 font-serif text-lg tracking-widest text-[#fff8e6] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          गणना करें
        </button>
      </div>

      {show && result && (
        <div className="mt-12 space-y-6">
          {/* SUMMARY */}
          <section className="rounded-2xl border border-[#e8d7ae] bg-[#fffdf6]/90 p-6 shadow-[0_18px_50px_rgba(120,80,20,0.10)]">
            <h2 className="mb-5 text-center font-serif text-2xl text-[#5a3210]">
              गणना परिणाम
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["जन्म नक्षत्र", `${nak.hi} (${nak.en})`],
                ["जन्म महादशा", `${lordPlanet.hi} — ${lordPlanet.years} वर्ष`],
                ["भुक्त महादशा", formatYMD(result.calc.bhukt)],
                ["भोग्य महादशा", formatYMD(result.calc.bhogya)],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-[#e8d7ae] bg-gradient-to-br from-[#fdf4e0] to-[#faead0] p-4 text-center"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[#a08149]">{k}</p>
                  <p className="mt-1 font-serif text-lg text-[#5a3210]">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-sm text-[#6b4b1e]">
              जन्म तिथि <b>{formatDate(result.bd)}</b> से {lordPlanet.hi} महादशा का
              शेष भोग्य भाग <b>{formatDate(result.timeline[0].end)}</b> को समाप्त होगा।
            </p>
          </section>

          {/* STEPS */}
          <section className="rounded-2xl border border-[#e8d7ae] bg-[#fffdf6]/90 p-6">
            <button
              onClick={() => setShowSteps((s) => !s)}
              className="flex w-full items-center justify-between font-serif text-xl text-[#5a3210]"
            >
              गणना कैसे हुई?
              <span className="text-[#c9942c]">{showSteps ? "▴" : "▾"}</span>
            </button>
            {showSteps && (
              <div className="mt-5 space-y-3 font-mono text-sm text-[#4a2c0c]">
                {[
                  `भयात पलात्मक = ${bhayatG} × 60 + ${bhayatP} = ${result.calc.bhayatPal}`,
                  `भभोग पलात्मक = ${bhabhogG} × 60 + ${bhabhogP} = ${result.calc.bhabhogPal}`,
                  `भयात × ${lordPlanet.hi} दशा वर्ष = ${result.calc.bhayatPal} × ${result.calc.dashaYears} = ${result.calc.product}`,
                  `${result.calc.product} ÷ ${result.calc.bhabhogPal}   →   Q1 = ${result.calc.q1} , R1 = ${result.calc.r1}`,
                  `R1 × 12 = ${result.calc.r1} × 12 = ${result.calc.r1x12}`,
                  `${result.calc.r1x12} ÷ ${result.calc.bhabhogPal}   →   Q2 = ${result.calc.q2} , R2 = ${result.calc.r2}`,
                  `R2 × 30 = ${result.calc.r2} × 30 = ${result.calc.r2x30}`,
                  `${result.calc.r2x30} ÷ ${result.calc.bhabhogPal}   →   Q3 = ${result.calc.q3} , R3 = ${result.calc.r3}`,
                  `भुक्त = Q1 वर्ष, Q2 माह, Q3 दिन = ${formatYMD(result.calc.bhukt)}`,
                  `भोग्य = ${result.calc.dashaYears} वर्ष 00 माह 00 दिन − भुक्त = ${formatYMD(result.calc.bhogya)}`,
                ].map((line, i) => (
                  <p
                    key={i}
                    className="rounded-lg border border-[#eadfc3] bg-white/70 px-3 py-2"
                  >
                    {line}
                  </p>
                ))}
                <p className="pt-2 text-xs text-[#a08149]">
                  नोट: इस गणना में 1 वर्ष = 12 माह तथा 1 माह = 30 दिन (भागफल–शेषफल विधि) —
                  कोई दशमलव अथवा सन्निकटन प्रयोग नहीं किया गया।
                </p>
              </div>
            )}
          </section>

          {/* TIMELINE */}
          <section className="overflow-hidden rounded-2xl border border-[#e8d7ae] bg-[#fffdf6]/90">
            <h2 className="border-b border-[#eadfc3] p-5 text-center font-serif text-2xl text-[#5a3210]">
              महादशा कालक्रम
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f6e9cd] to-[#faead0] text-[#6b4b1e]">
                    <th className="px-4 py-3 text-left font-semibold">ग्रह</th>
                    <th className="px-4 py-3 text-left font-semibold">अवधि</th>
                    <th className="px-4 py-3 text-left font-semibold">प्रारंभ</th>
                    <th className="px-4 py-3 text-left font-semibold">समाप्ति</th>
                  </tr>
                </thead>
                <tbody>
                  {result.timeline.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t border-[#eadfc3] ${
                        row.isBhogya ? "bg-[#fdf0e0]" : i % 2 ? "bg-white/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-serif text-base text-[#a11d1d]">
                        {row.planet.symbol} {row.planet.hi}
                      </td>
                      <td className="px-4 py-3 text-[#5a3210]">{row.durationLabel}</td>
                      <td className="px-4 py-3 text-[#5a3210]">{formatDate(row.start)}</td>
                      <td className="px-4 py-3 text-[#5a3210]">{formatDate(row.end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center gap-3 p-5">
              <button
                onClick={() => setCycles((c) => c + 9)}
                className="rounded-full border border-[#c9942c] px-6 py-2 text-sm font-semibold text-[#8c5a12] hover:bg-[#faf1dc]"
              >
                अगला चक्र दिखाएँ (+9)
              </button>
              {cycles > 9 && (
                <button
                  onClick={() => setCycles(9)}
                  className="rounded-full border border-[#e0cb9a] px-6 py-2 text-sm text-[#a08149] hover:bg-[#faf1dc]"
                >
                  रीसेट
                </button>
              )}
            </div>
          </section>

          {/* CYCLE REFERENCE */}
          <section className="rounded-2xl border border-[#e8d7ae] bg-[#fffdf6]/90 p-6">
            <h2 className="mb-4 text-center font-serif text-xl text-[#5a3210]">
              सम्पूर्ण विंशोत्तरी चक्र (१२० वर्ष)
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-9">
              {DASHA_SEQUENCE.map((p) => (
                <div
                  key={p.key}
                  className={`rounded-xl border p-3 text-center ${
                    p.key === nak.lord
                      ? "border-[#a11d1d] bg-[#fdf0e0]"
                      : "border-[#e8d7ae] bg-white/60"
                  }`}
                >
                  <p className="text-lg text-[#c9942c]">{p.symbol}</p>
                  <p className="font-serif text-sm text-[#5a3210]">{p.hi}</p>
                  <p className="text-xs text-[#a08149]">{p.years} वर्ष</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <footer className="mt-16 text-center text-xs tracking-widest text-[#a08149]">
        ॥ शुभं भवतु ॥
      </footer>
    </div>
  );
}
