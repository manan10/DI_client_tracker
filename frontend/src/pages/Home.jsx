import DataUploader from "../components/Home/DataUploader";
import DirectoryBlock from "../components/Home/DirectoryBlock";
import InteractionTimeline from "../components/Home/InteractionTimeline";
import Navbar from "../components/Navbar";
import StatCards from "../components/Home/StatCards";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-10 py-12">
        <StatCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <DirectoryBlock clientCount="443" />
            <InteractionTimeline interactions={[]} />
          </div>

          <div className="space-y-8">
            <DataUploader />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
