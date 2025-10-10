"use client";
import MCQGenerator from "./components/MCQGenerator";
import Instructions from "./components/Instructions";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Question Paper Generator
          </h1>
          <p className="text-gray-600">
            Create professional question papers with live preview
          </p>
        </header>

        <Instructions />
        <MCQGenerator />
      </div>
    </div>
  );
}
