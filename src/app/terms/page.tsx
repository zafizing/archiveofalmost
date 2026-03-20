export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white font-serif selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24">

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="text-[11px] tracking-[0.5em] text-neutral-500 uppercase font-bold">Legal</div>
          <h1 className="text-4xl md:text-5xl font-light italic text-white/90">Terms of Service</h1>
          <div className="w-10 h-[1px] bg-neutral-800"></div>
          <p className="text-sm text-neutral-500 italic">Last updated: March 2026</p>
        </div>

        <div className="space-y-12 text-white/70 leading-relaxed">

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">1. Acceptance of Terms</h2>
            <p className="text-base font-light">By accessing or using Archive of Almost ("the Archive"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. The Archive reserves the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">2. Description of Service</h2>
            <p className="text-base font-light">Archive of Almost is a digital museum that permanently archives photographs and accompanying stories submitted by users. The Archive accepts a limited number of objects — no more than 250 — each reviewed and admitted at the sole discretion of the Archive's curators. Submission does not guarantee acceptance.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">3. Submission & Acceptance</h2>
            <p className="text-base font-light">Submitting an application to the Archive is free of charge. If your submission is accepted, you will be notified via the email provided and invited to complete your archival for a one-time fee of $1,000 USD. Payment is required to finalize your entry in the collection. The Archive reserves the right to decline any submission without explanation.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">4. Intellectual Property & Content Rights</h2>
            <p className="text-base font-light">You retain full ownership of all photographs and written content you submit. By submitting content to the Archive, you grant Archive of Almost a perpetual, worldwide, non-exclusive, royalty-free license to display, reproduce, and distribute your content solely for the purposes of operating and promoting the Archive. You represent and warrant that you own or have the necessary rights to all submitted content.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">5. Prohibited Content</h2>
            <p className="text-base font-light">You may not submit content that is unlawful, defamatory, obscene, or that infringes upon the rights of any third party. Content depicting violence, hate speech, or any material that violates applicable laws is strictly prohibited. The Archive may remove any content at its discretion without prior notice or refund.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">6. Permanence & Modifications</h2>
            <p className="text-base font-light">Once an object is admitted to the Archive's permanent collection, it will not be removed or altered at the request of the submitter. The Archive may, in exceptional circumstances, remove content that is found to violate these terms or applicable law. By submitting, you acknowledge and accept the permanent nature of the archival.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">7. Limitation of Liability</h2>
            <p className="text-base font-light">Archive of Almost provides its service on an "as is" basis. We make no warranties, express or implied, regarding the availability, accuracy, or reliability of the service. To the fullest extent permitted by law, Archive of Almost shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">8. Governing Law</h2>
            <p className="text-base font-light">These Terms of Service shall be governed by and construed in accordance with applicable international law. Any disputes arising from these terms shall be resolved through good-faith negotiation before any formal legal proceedings.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">9. Contact</h2>
            <p className="text-base font-light">For any questions regarding these terms, please contact us at <span className="text-white/90">hello@archiveofalmost.co</span>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
