export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white font-serif selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24">

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="text-[11px] tracking-[0.5em] text-neutral-500 uppercase font-bold">Legal</div>
          <h1 className="text-4xl md:text-5xl font-light italic text-white/90">Privacy Policy</h1>
          <div className="w-10 h-[1px] bg-neutral-800"></div>
          <p className="text-sm text-neutral-500 italic">Last updated: March 2026</p>
        </div>

        <div className="space-y-12 text-white/70 leading-relaxed">

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">1. Information We Collect</h2>
            <p className="text-base font-light">When you submit an application to the Archive, we collect the information you provide: your name (or chosen anonymity), email address, a photograph, a written story, and the year associated with your memory. We do not collect any information beyond what is necessary to operate the Archive.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">2. How We Use Your Information</h2>
            <p className="text-base font-light">Your email address is used solely to notify you of your application status. If accepted, it is used to coordinate your archival and process payment. Your name, photograph, and story — if accepted — are displayed permanently in the Archive's public collection. We do not use your information for marketing, advertising, or any purpose beyond the operation of the Archive.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">3. Data Storage & Security</h2>
            <p className="text-base font-light">Your data is stored securely using Supabase, a trusted cloud infrastructure provider. We implement industry-standard security measures to protect your information from unauthorized access, disclosure, or destruction. Photographs are stored in secure cloud storage and served via encrypted connections.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">4. Third-Party Services</h2>
            <p className="text-base font-light">We use Paddle as our payment processor. When you complete a payment, your financial information is handled directly by Paddle and is never stored on our servers. We also use Supabase for database and file storage. These providers have their own privacy policies which govern their handling of your data.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">5. Public Display of Content</h2>
            <p className="text-base font-light">By submitting to and being accepted into the Archive, you acknowledge that your photograph, story, year, and name (or chosen pseudonym) will be displayed publicly and permanently on archiveofalmost.co. This public display is the core nature of the Archive's service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">6. Data Retention</h2>
            <p className="text-base font-light">Accepted submissions are retained permanently as part of the Archive's collection. Rejected or pending applications may be deleted from our systems after 90 days. Email addresses are retained only as long as necessary to complete the archival process.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">7. Your Rights</h2>
            <p className="text-base font-light">You have the right to request access to the personal data we hold about you. You may request deletion of your data prior to acceptance into the collection. Once your object has been permanently archived, removal requests cannot be honored, as this is inherent to the nature of the service you purchased.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">8. Cookies</h2>
            <p className="text-base font-light">The Archive does not use tracking cookies or advertising pixels. We may use essential session cookies solely for the purpose of operating the website's core functionality.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm tracking-[0.3em] uppercase font-bold text-white/90">9. Contact</h2>
            <p className="text-base font-light">For any privacy-related inquiries or data requests, please contact us at <span className="text-white/90">hello@archiveofalmost.co</span>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
