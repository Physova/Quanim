export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-20 font-mono">
      <h1 className="text-4xl font-bold mb-10 uppercase tracking-tighter">Privacy Policy</h1>
      <p className="text-white/40 max-w-2xl leading-relaxed">
        Physova is an educational platform. We do not sell your data. 
        Authentication is handled via NextAuth. Standard analytics may be collected 
        to improve visualization performance.
      </p>
    </div>
  );
}
