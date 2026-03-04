export default function RefundPage() {
  return (
    <main className="min-h-screen bg-black text-white font-serif selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24">

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="text-[11px] tracking-[0.5em] text-neutral-500 uppercase font-bold">Legal</div>
          <h1 className="text-4xl md:text-5xl font-light italic text-white/90">Refund Policy</h1>
          <div className="w-10 h-[1px] bg-neutral-800"></div>
          <p className="text-sm text-neutral-500 italic">Last updated: March 2026</p>
        </div>

        <div className="space-y-12 text-white/70 leading-relaxed">

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">1. Nature of the Service</h2>
            <p className="text-base font-light">Archive of Almost offers a permanent digital archival service. The $1,000 fee paid upon acceptance covers the permanent addition of your object to the Archive's collection — a one-time, irreversible act. Due to the permanent and bespoke nature of this service, our refund policy reflects the gravity of this commitment.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">2. No Refunds After Archival</h2>
            <p className="text-base font-light">Once your object has been permanently added to the Archive's collection — meaning your photograph and story are live on archiveofalmost.co — no refund will be issued under any circumstances. By completing payment, you acknowledge that you are purchasing a permanent, non-reversible archival service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">3. Refunds Before Archival</h2>
            <p className="text-base font-light">If you have completed payment but your object has not yet been published to the Archive, you may request a full refund within 48 hours of payment. To request a refund, contact us at <span className="text-white/90">hello@archiveofalmost.co</span> with your name and order details. Refunds will be processed within 5–10 business days via the original payment method.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">4. Billing Errors</h2>
            <p className="text-base font-light">If you believe you have been charged incorrectly or experienced a billing error, please contact us within 7 days of the transaction at <span className="text-white/90">hello@archiveofalmost.co</span>. We will investigate and resolve any legitimate billing discrepancies promptly.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">5. Rejected Applications</h2>
            <p className="text-base font-light">Application to the Archive is free of charge. No payment is collected at the time of application. If your submission is not accepted, you will not be charged and no refund is applicable.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">6. Contact</h2>
            <p className="text-base font-light">For any refund-related inquiries, please contact us at <span className="text-white/90">hello@archiveofalmost.co</span>. We aim to respond to all inquiries within 2 business days.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
