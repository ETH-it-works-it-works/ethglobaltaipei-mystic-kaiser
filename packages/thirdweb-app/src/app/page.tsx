import Navigation from "@/components/landing-page/Navigation";

export default function Home() {
  return <div>
    <Navigation />
    <div className="bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-12">
        <div className="py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Welcome to the Landing Page</h1>
        </div>
      </div>
    </div>
  </div>;
}
