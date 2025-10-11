"use client";
import { useState, useEffect } from "react";
import { generateAdvancedPDF, type PaperData } from "../utils/pdfGenerator";

interface MCQQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
}

interface MCQSection {
  id: string;
  sectionNumber: string; // e.g., "I", "II", "III"
  heading: string;
  subtitle?: string; // Added for instruction like "(Choose one)"
  marksCalculation: string;
  questions: MCQQuestion[];
}

interface QAQuestion {
  id: string;
  question: string;
}

interface QASection {
  id: string;
  sectionNumber: string; // e.g., "IV", "V", "VI"
  heading: string; // e.g., "Answer the following"
  instruction: string; // e.g., "(Any ten)"
  marksCalculation: string; // e.g., "10 X 2 = 20"
  questions: QAQuestion[];
}

interface MatchPair {
  id: string;
  leftItem: string;
  rightItem: string;
}

interface MatchSection {
  id: string;
  sectionNumber: string;
  heading: string;
  instruction?: string;
  marksCalculation: string;
  pairs: MatchPair[];
}

interface PaperHeader {
  title: string;
  subtitle: string;
  className: string;
  subject: string;
  date: string;
  time: string;
  maxMarks: string;
}

export default function MCQGenerator() {
  const [mcqSections, setMcqSections] = useState<MCQSection[]>([]);
  const [qaSections, setQaSections] = useState<QASection[]>([]);
  const [matchSections, setMatchSections] = useState<MatchSection[]>([]);

  // Section order tracking - maintains creation order
  const [sectionOrder, setSectionOrder] = useState<
    Array<{ type: "mcq" | "qa" | "match"; id: string }>
  >([]);

  const [selectedSectionType, setSelectedSectionType] = useState<string>("");

  const [paperHeader, setPaperHeader] = useState<PaperHeader>({
    title: "",
    subtitle: "",
    className: "",
    subject: "",
    date: "",
    time: "",
    maxMarks: "",
  });

  // State for collapsible questions
  const [collapsedMCQs, setCollapsedMCQs] = useState<Set<string>>(new Set());
  const [collapsedQAs, setCollapsedQAs] = useState<Set<string>>(new Set());
  const [collapsedMatches, setCollapsedMatches] = useState<Set<string>>(
    new Set()
  );

  // Toggle functions for collapsible questions
  const toggleMCQCollapse = (questionId: string) => {
    setCollapsedMCQs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const toggleQACollapse = (sectionId: string, questionId: string) => {
    const key = `${sectionId}-${questionId}`;
    setCollapsedQAs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleMatchCollapse = (sectionId: string, pairId: string) => {
    const key = `${sectionId}-${pairId}`;
    setCollapsedMatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // MCQ Section Functions
  const addMCQSection = () => {
    const newSection: MCQSection = {
      id: Date.now().toString(),
      sectionNumber: "",
      heading: "",
      subtitle: "",
      marksCalculation: "",
      questions: [],
    };
    setMcqSections((prev) => [...prev, newSection]);
    // Add to section order
    setSectionOrder((prev) => [...prev, { type: "mcq", id: newSection.id }]);
  };

  const updateMCQSection = (
    sectionId: string,
    field: keyof Omit<MCQSection, "id" | "questions">,
    value: string
  ) => {
    setMcqSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const removeMCQSection = (sectionId: string) => {
    setMcqSections((prev) =>
      prev.filter((section) => section.id !== sectionId)
    );
    // Remove from section order
    setSectionOrder((prev) => prev.filter((item) => item.id !== sectionId));
  };

  const addMCQQuestion = (sectionId: string) => {
    const newQuestion: MCQQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
    };
    setMcqSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    );
  };

  const updateMCQQuestion = (
    sectionId: string,
    questionId: string,
    field: keyof MCQQuestion,
    value: any
  ) => {
    setMcqSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === questionId ? { ...q, [field]: value } : q
              ),
            }
          : section
      )
    );
  };

  const updateMCQOption = (
    sectionId: string,
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setMcqSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      options: q.options.map((opt, i) =>
                        i === optionIndex ? value : opt
                      ) as [string, string, string, string],
                    }
                  : q
              ),
            }
          : section
      )
    );
  };

  const removeMCQQuestion = (sectionId: string, questionId: string) => {
    setMcqSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
            }
          : section
      )
    );
  };

  // QA Section Functions
  const addQASection = () => {
    const newSection: QASection = {
      id: Date.now().toString(),
      sectionNumber: "",
      heading: "",
      instruction: "",
      marksCalculation: "",
      questions: [],
    };
    setQaSections((prev) => [...prev, newSection]);
    // Add to section order
    setSectionOrder((prev) => [...prev, { type: "qa", id: newSection.id }]);
  };

  const updateQASection = (
    sectionId: string,
    field: keyof Omit<QASection, "id" | "questions">,
    value: string
  ) => {
    setQaSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const removeQASection = (sectionId: string) => {
    setQaSections((prev) => prev.filter((section) => section.id !== sectionId));
    // Remove from section order
    setSectionOrder((prev) => prev.filter((item) => item.id !== sectionId));
  };

  const addQAQuestion = (sectionId: string) => {
    const newQuestion: QAQuestion = {
      id: Date.now().toString(),
      question: "",
    };
    setQaSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    );
  };

  const updateQAQuestion = (
    sectionId: string,
    questionId: string,
    value: string
  ) => {
    setQaSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === questionId ? { ...q, question: value } : q
              ),
            }
          : section
      )
    );
  };

  const removeQAQuestion = (sectionId: string, questionId: string) => {
    setQaSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
            }
          : section
      )
    );
  };

  // Match Section Functions
  const addMatchSection = () => {
    const newSection: MatchSection = {
      id: Date.now().toString(),
      sectionNumber: "",
      heading: "",
      instruction: "",
      marksCalculation: "",
      pairs: [],
    };
    setMatchSections((prev) => [...prev, newSection]);
    // Add to section order
    setSectionOrder((prev) => [...prev, { type: "match", id: newSection.id }]);
  };

  const updateMatchSection = (
    sectionId: string,
    field: keyof Omit<MatchSection, "id" | "pairs">,
    value: string
  ) => {
    setMatchSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const removeMatchSection = (sectionId: string) => {
    setMatchSections((prev) =>
      prev.filter((section) => section.id !== sectionId)
    );
    // Remove from section order
    setSectionOrder((prev) => prev.filter((item) => item.id !== sectionId));
  };

  const addMatchPair = (sectionId: string) => {
    const newPair: MatchPair = {
      id: Date.now().toString(),
      leftItem: "",
      rightItem: "",
    };
    setMatchSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, pairs: [...section.pairs, newPair] }
          : section
      )
    );
  };

  const updateMatchPair = (
    sectionId: string,
    pairId: string,
    field: "leftItem" | "rightItem",
    value: string
  ) => {
    setMatchSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              pairs: section.pairs.map((pair) =>
                pair.id === pairId ? { ...pair, [field]: value } : pair
              ),
            }
          : section
      )
    );
  };

  const removeMatchPair = (sectionId: string, pairId: string) => {
    setMatchSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              pairs: section.pairs.filter((pair) => pair.id !== pairId),
            }
          : section
      )
    );
  };

  // Function to create a new section based on selected type
  const handleCreateSection = () => {
    if (!selectedSectionType) {
      alert("Please select a section type first!");
      return;
    }

    console.log("Creating section of type:", selectedSectionType);

    if (selectedSectionType === "mcq") {
      console.log("Adding MCQ section");
      addMCQSection();
    } else if (selectedSectionType === "qa") {
      console.log("Adding QA section");
      addQASection();
    } else if (selectedSectionType === "match") {
      console.log("Adding Match section");
      addMatchSection();
    }

    // Reset the dropdown
    setSelectedSectionType("");
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    if (isGeneratingPDF) return;

    // Check if there's content to generate
    const hasContent =
      paperHeader.title ||
      paperHeader.subject ||
      mcqSections.length > 0 ||
      qaSections.length > 0 ||
      matchSections.length > 0;

    if (!hasContent) {
      alert(
        'Please add some content before generating PDF. Try using "Load Sample" to see how it works!'
      );
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const paperData: PaperData = {
        header: paperHeader,
        mcqSections: mcqSections,
        qaSections: qaSections,
        matchSections: matchSections,
        sectionOrder: sectionOrder,
      };

      const result = await generateAdvancedPDF(paperData);

      if (result.success) {
        // Show a brief success message
        const successMsg = document.createElement("div");
        successMsg.className =
          "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
        successMsg.textContent = `PDF downloaded: ${result.filename}`;
        document.body.appendChild(successMsg);

        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 3000);

        console.log("PDF generated successfully:", result.filename);
      } else {
        console.error("Error generating PDF:", result.error);
        alert("Error generating PDF. Please try again.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] print:grid-cols-1 print:h-auto">
      {/* Input Section */}
      <div className="no-print bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-xl p-6 overflow-y-auto print:hidden border border-slate-200">
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Question Paper Editor
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Create your perfect question paper
          </p>
        </div>

        {/* Paper Header */}
        <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-slate-800">
              Paper Header
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Top Text (e.g., "Praise the Lord!")
              </label>
              <input
                type="text"
                value={paperHeader.title}
                onChange={(e) =>
                  setPaperHeader((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Praise the Lord!"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Standard/Class (e.g., "STANDARD 3")
              </label>
              <input
                type="text"
                value={paperHeader.className}
                onChange={(e) =>
                  setPaperHeader((prev) => ({
                    ...prev,
                    className: e.target.value,
                  }))
                }
                placeholder="e.g., STANDARD 3"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Exam Title (e.g., "ANNUAL EXAMINATION – 2021")
              </label>
              <input
                type="text"
                value={paperHeader.subject}
                onChange={(e) =>
                  setPaperHeader((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="e.g., ANNUAL EXAMINATION – 2021"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Time Duration (e.g., "1½ Hours")
              </label>
              <input
                type="text"
                value={paperHeader.time}
                onChange={(e) =>
                  setPaperHeader((prev) => ({ ...prev, time: e.target.value }))
                }
                placeholder="e.g., 1½ Hours"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Maximum Marks
              </label>
              <input
                type="text"
                value={paperHeader.maxMarks}
                onChange={(e) =>
                  setPaperHeader((prev) => ({
                    ...prev,
                    maxMarks: e.target.value,
                  }))
                }
                placeholder="e.g., 100"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section Selector */}
        <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-slate-800">
              Add Section
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Section Type
              </label>
              <select
                value={selectedSectionType}
                onChange={(e) => setSelectedSectionType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 cursor-pointer text-slate-900"
              >
                <option value="" disabled className="text-slate-400">
                  Choose a section type...
                </option>
                <option value="mcq" className="text-slate-900">
                  📝 Multiple Choice Questions (MCQ)
                </option>
                <option value="qa" className="text-slate-900">
                  ✍️ Question & Answer
                </option>
                <option value="match" className="text-slate-900">
                  🔗 Match and Rewrite
                </option>
              </select>
            </div>
            <button
              onClick={handleCreateSection}
              disabled={!selectedSectionType}
              className="mt-8 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
            >
              ➕ Create Section
            </button>
            <button
              onClick={() => {
                setPaperHeader({
                  title: "",
                  subtitle: "",
                  className: "",
                  subject: "",
                  date: "",
                  time: "",
                  maxMarks: "",
                });
                setMcqSections([]);
                setQaSections([]);
                setMatchSections([]);
                setSectionOrder([]);
                setSelectedSectionType("");
              }}
              className="mt-8 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all duration-200 font-medium"
              title="Clear All"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Load Sample Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              // Add sample data
              setPaperHeader({
                title: "St. Mary's High School",
                subtitle: "",
                className: "Class 10",
                subject: "General Knowledge",
                date: "March 15, 2024",
                time: "2 Hours",
                maxMarks: "50",
              });

              // Create sample MCQ section
              const sampleMCQSection: MCQSection = {
                id: Date.now().toString(),
                sectionNumber: "I",
                heading: "Multiple Choice Questions",
                subtitle: "(Choose the correct answer)",
                marksCalculation: "25 × 2 = 50",
                questions: [
                  {
                    id: "1",
                    question: "What is the capital of India?",
                    options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
                  },
                  {
                    id: "2",
                    question: "Which planet is known as the Red Planet?",
                    options: ["Venus", "Mars", "Jupiter", "Saturn"],
                  },
                  {
                    id: "3",
                    question: "Who wrote the national anthem of India?",
                    options: [
                      "Rabindranath Tagore",
                      "Mahatma Gandhi",
                      "Jawaharlal Nehru",
                      "Subhash Chandra Bose",
                    ],
                  },
                ],
              };

              setMcqSections([sampleMCQSection]);
              setSectionOrder([{ type: "mcq", id: sampleMCQSection.id }]);
            }}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-medium shadow-md"
          >
            ✨ Load Sample Data
          </button>
        </div>

        {/* All Sections Container - Rendered in User-Defined Order */}
        <div className="space-y-4">
          {sectionOrder.map((item, orderIndex) => {
            console.log("Rendering section:", item.type, "ID:", item.id);

            // Render MCQ Section
            if (item.type === "mcq") {
              console.log("Rendering MCQ section, ID:", item.id);
              const section = mcqSections.find((s) => s.id === item.id);
              if (!section) {
                console.log("MCQ section not found in mcqSections array");
                return null;
              }

              const sectionNumber =
                mcqSections.findIndex((s) => s.id === item.id) + 1;

              console.log("MCQ section found, number:", sectionNumber);
              return (
                <div
                  key={section.id}
                  className="p-5 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-semibold text-blue-800">
                      MCQ Section {sectionNumber}
                    </h4>
                    <button
                      onClick={() => removeMCQSection(section.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Section Number (e.g., I, II, III)
                      </label>
                      <input
                        type="text"
                        value={section.sectionNumber}
                        onChange={(e) =>
                          updateMCQSection(
                            section.id,
                            "sectionNumber",
                            e.target.value
                          )
                        }
                        placeholder="e.g., I"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={section.heading}
                        onChange={(e) =>
                          updateMCQSection(
                            section.id,
                            "heading",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Multiple Choice Questions"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Instruction (optional)
                      </label>
                      <input
                        type="text"
                        value={section.subtitle || ""}
                        onChange={(e) =>
                          updateMCQSection(
                            section.id,
                            "subtitle",
                            e.target.value
                          )
                        }
                        placeholder="e.g., (Choose one)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Marks Calculation
                      </label>
                      <input
                        type="text"
                        value={section.marksCalculation}
                        onChange={(e) =>
                          updateMCQSection(
                            section.id,
                            "marksCalculation",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 10 X 2 = 20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-900">
                        Questions
                      </label>
                      <button
                        onClick={() => addMCQQuestion(section.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm rounded-md transition-all duration-200 font-medium shadow-sm"
                      >
                        + Add Question
                      </button>
                    </div>

                    <div className="space-y-2">
                      {section.questions.map((question, index) => {
                        const isCollapsed = collapsedMCQs.has(question.id);
                        return (
                          <div
                            key={question.id}
                            className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-300"
                          >
                            {/* Question Header - Always Visible */}
                            <div
                              className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() => toggleMCQCollapse(question.id)}
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                  {index + 1}
                                </span>
                                <p className="text-sm text-slate-700 truncate flex-1">
                                  {question.question || "Empty question"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMCQQuestion(section.id, question.id);
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                                <span
                                  className={`transition-transform duration-200 ${
                                    isCollapsed ? "" : "rotate-180"
                                  }`}
                                >
                                  <svg
                                    className="w-5 h-5 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </span>
                              </div>
                            </div>

                            {/* Question Details - Collapsible */}
                            {!isCollapsed && (
                              <div className="p-4 space-y-3 bg-white">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Question
                                  </label>
                                  <textarea
                                    value={question.question}
                                    onChange={(e) =>
                                      updateMCQQuestion(
                                        section.id,
                                        question.id,
                                        "question",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter your question here..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none text-slate-900"
                                    rows={2}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {question.options.map(
                                    (option, optionIndex) => (
                                      <div key={optionIndex}>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                          Option{" "}
                                          {String.fromCharCode(
                                            97 + optionIndex
                                          ).toUpperCase()}
                                        </label>
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) =>
                                            updateMCQOption(
                                              section.id,
                                              question.id,
                                              optionIndex,
                                              e.target.value
                                            )
                                          }
                                          placeholder={`Option ${String.fromCharCode(
                                            97 + optionIndex
                                          )}`}
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Render QA Section
            if (item.type === "qa") {
              console.log("Rendering QA section, ID:", item.id);
              const section = qaSections.find((s) => s.id === item.id);
              if (!section) {
                console.log("QA section not found in qaSections array");
                return null;
              }

              const sectionNumber =
                qaSections.findIndex((s) => s.id === item.id) + 1;

              console.log("QA section found, number:", sectionNumber);
              return (
                <div
                  key={section.id}
                  className="p-5 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-semibold text-purple-800">
                      QA Section {sectionNumber}
                    </h4>
                    <button
                      onClick={() => removeQASection(section.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Section Number (e.g., IV, V, VI)
                      </label>
                      <input
                        type="text"
                        value={section.sectionNumber}
                        onChange={(e) =>
                          updateQASection(
                            section.id,
                            "sectionNumber",
                            e.target.value
                          )
                        }
                        placeholder="e.g., IV"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={section.heading}
                        onChange={(e) =>
                          updateQASection(section.id, "heading", e.target.value)
                        }
                        placeholder="e.g., Answer the following"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Instruction (e.g., Any ten)
                      </label>
                      <input
                        type="text"
                        value={section.instruction}
                        onChange={(e) =>
                          updateQASection(
                            section.id,
                            "instruction",
                            e.target.value
                          )
                        }
                        placeholder="e.g., (Any ten)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Marks Calculation
                      </label>
                      <input
                        type="text"
                        value={section.marksCalculation}
                        onChange={(e) =>
                          updateQASection(
                            section.id,
                            "marksCalculation",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 10 X 2 = 20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-900">
                        Questions
                      </label>
                      <button
                        onClick={() => addQAQuestion(section.id)}
                        className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600"
                      >
                        + Add Question
                      </button>
                    </div>

                    {section.questions.map((question, qIndex) => (
                      <div key={question.id} className="mb-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-sm font-semibold text-slate-900 mt-2">
                            {qIndex + 1}.
                          </span>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              updateQAQuestion(
                                section.id,
                                question.id,
                                e.target.value
                              )
                            }
                            placeholder="Enter question"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                          />
                          <button
                            onClick={() =>
                              removeQAQuestion(section.id, question.id)
                            }
                            className="text-red-500 hover:text-red-700 mt-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {section.questions.length === 0 && (
                      <div className="text-center py-4 text-slate-600 text-sm">
                        No questions added yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Render Match Section
            if (item.type === "match") {
              console.log("Rendering Match section, ID:", item.id);
              const section = matchSections.find((s) => s.id === item.id);
              if (!section) {
                console.log("Match section not found in matchSections array");
                return null;
              }

              const sectionNumber =
                matchSections.findIndex((s) => s.id === item.id) + 1;

              console.log("Match section found, number:", sectionNumber);
              return (
                <div
                  key={section.id}
                  className="p-5 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-semibold text-emerald-800">
                      Match Section {sectionNumber}
                    </h4>
                    <button
                      onClick={() => removeMatchSection(section.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Section Number (e.g., II, III, IV)
                      </label>
                      <input
                        type="text"
                        value={section.sectionNumber}
                        onChange={(e) =>
                          updateMatchSection(
                            section.id,
                            "sectionNumber",
                            e.target.value
                          )
                        }
                        placeholder="e.g., II"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={section.heading}
                        onChange={(e) =>
                          updateMatchSection(
                            section.id,
                            "heading",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Match and rewrite the following"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Instruction (optional)
                      </label>
                      <input
                        type="text"
                        value={section.instruction || ""}
                        onChange={(e) =>
                          updateMatchSection(
                            section.id,
                            "instruction",
                            e.target.value
                          )
                        }
                        placeholder="e.g., (Match column A with column B)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Marks Calculation
                      </label>
                      <input
                        type="text"
                        value={section.marksCalculation}
                        onChange={(e) =>
                          updateMatchSection(
                            section.id,
                            "marksCalculation",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 10 X 1 = 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-semibold text-slate-900">
                        Match Pairs
                      </label>
                      <button
                        onClick={() => addMatchPair(section.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm rounded-md transition-all duration-200 font-medium shadow-sm"
                      >
                        + Add Pair
                      </button>
                    </div>

                    {section.pairs.map((pair, pairIndex) => (
                      <div
                        key={pair.id}
                        className="mb-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-start space-x-2 mb-2">
                          <button
                            onClick={() =>
                              toggleMatchCollapse(section.id, pair.id)
                            }
                            className="text-slate-600 hover:text-slate-900 mt-2"
                          >
                            {collapsedMatches.has(
                              `${section.id}-${pair.id}`
                            ) ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-emerald-700 mb-2">
                              Pair {pairIndex + 1}
                            </div>
                            {!collapsedMatches.has(
                              `${section.id}-${pair.id}`
                            ) && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                      Left Column
                                    </label>
                                    <input
                                      type="text"
                                      value={pair.leftItem}
                                      onChange={(e) =>
                                        updateMatchPair(
                                          section.id,
                                          pair.id,
                                          "leftItem",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter left item"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                      Right Column (Answer)
                                    </label>
                                    <input
                                      type="text"
                                      value={pair.rightItem}
                                      onChange={(e) =>
                                        updateMatchPair(
                                          section.id,
                                          pair.id,
                                          "rightItem",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter right item"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeMatchPair(section.id, pair.id)}
                            className="text-red-500 hover:text-red-700 mt-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {section.pairs.length === 0 && (
                      <div className="text-center py-4 text-slate-600 text-sm">
                        No pairs added yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto print:shadow-none print:rounded-none print:p-0">
        <div className="no-print flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Live Preview</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              <span>{isGeneratingPDF ? "Generating..." : "Download PDF"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                setMcqSections([]);
                setQaSections([]);
                setMatchSections([]);
                setSectionOrder([]);
                setPaperHeader({
                  title: "",
                  subtitle: "",
                  className: "",
                  subject: "",
                  date: "",
                  time: "",
                  maxMarks: "",
                });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <div className="question-paper bg-white border-2 border-gray-200 p-8 min-h-[600px] text-black print:border-none print:p-6 print:shadow-none">
          {/* Paper Header */}
          {(paperHeader.title || paperHeader.subject) && (
            <div className="text-center mb-6 print:mb-4">
              {paperHeader.title && (
                <div className="italic text-base mb-1 print:text-sm">
                  {paperHeader.title}
                </div>
              )}
              <h1 className="text-xl font-bold mb-1 print:text-lg uppercase">
                THE PENTECOSTAL MISSION
              </h1>
              <h2 className="text-base font-bold mb-1 print:text-sm uppercase">
                SUNDAY SCHOOL CENTRAL ORGANIZATION, BARODA
              </h2>
              {paperHeader.subject && (
                <h3 className="text-base font-bold mb-4 print:text-sm uppercase underline">
                  {paperHeader.subject}
                </h3>
              )}
              <div className="flex justify-between items-center text-sm print:text-xs font-bold pt-3">
                <div>
                  {paperHeader.time && <span>Time : {paperHeader.time}</span>}
                </div>
                <div>
                  {paperHeader.className && (
                    <span className="uppercase">{paperHeader.className}</span>
                  )}
                </div>
                <div>
                  {paperHeader.maxMarks && (
                    <span>Marks : {paperHeader.maxMarks}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sections Preview - Rendered in User-Defined Order */}
          {sectionOrder.map((item) => {
            // Render MCQ Section Preview
            if (item.type === "mcq") {
              const section = mcqSections.find((s) => s.id === item.id);
              if (!section) return null;

              return (
                <div key={section.id}>
                  <div className="mb-3 print:mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-black print:text-lg">
                        {section.sectionNumber && `${section.sectionNumber}. `}
                        {section.heading}
                        {section.subtitle && ` ${section.subtitle}`}
                      </h3>
                      {section.marksCalculation && (
                        <div className="marks-box text-right font-medium text-black print:text-sm">
                          {section.marksCalculation}
                        </div>
                      )}
                    </div>
                  </div>

                  {section.questions.length > 0 && (
                    <div className="space-y-2 print:space-y-1">
                      {section.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="print-page space-y-0 print:space-y-0 mcq-question"
                        >
                          {question.question && (
                            <div className="text-black leading-relaxed print:leading-normal mcq-question flex">
                              <span className="question-number flex-shrink-0">
                                {index + 1}.
                              </span>
                              <span className="flex-1">
                                {question.question}
                              </span>
                            </div>
                          )}

                          {question.options.some((opt) => opt.trim()) && (
                            <div className="ml-6 print:ml-4 flex flex-wrap gap-x-8 gap-y-0.5 items-start">
                              {question.options.map(
                                (option, optionIndex) =>
                                  option.trim() && (
                                    <div
                                      key={optionIndex}
                                      className="flex items-start min-w-fit max-w-[calc(50%-1rem)] mcq-question"
                                    >
                                      <span className="option-letter text-black font-bold whitespace-nowrap">
                                        ({String.fromCharCode(97 + optionIndex)}
                                        )
                                      </span>
                                      <span className="flex-1 text-black leading-relaxed print:leading-normal ml-2 break-words option-text">
                                        {option}
                                      </span>
                                    </div>
                                  )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Render QA Section Preview
            if (item.type === "qa") {
              const section = qaSections.find((s) => s.id === item.id);
              if (!section) return null;

              return (
                <div key={section.id} className="mb-3 print:mb-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-black print:text-lg">
                      {section.sectionNumber && `${section.sectionNumber}. `}
                      {section.heading}
                      {section.instruction && ` ${section.instruction}`}
                    </h3>
                    {section.marksCalculation && (
                      <div className="marks-box text-right font-medium text-black print:text-sm">
                        {section.marksCalculation}
                      </div>
                    )}
                  </div>

                  {section.questions.length > 0 && (
                    <div className="space-y-2 print:space-y-1">
                      {section.questions.map((question, index) => (
                        <div key={question.id}>
                          {question.question && (
                            <div className="text-black leading-relaxed print:leading-normal flex">
                              <span className="question-number flex-shrink-0">
                                {index + 1}.
                              </span>
                              <span className="flex-1">
                                {question.question}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Render Match Section Preview
            if (item.type === "match") {
              const section = matchSections.find((s) => s.id === item.id);
              if (!section) return null;

              return (
                <div key={section.id} className="mb-3 print:mb-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-black print:text-lg">
                      {section.sectionNumber && `${section.sectionNumber}. `}
                      {section.heading}
                      {section.instruction && ` ${section.instruction}`}
                    </h3>
                    {section.marksCalculation && (
                      <div className="marks-box text-right font-medium text-black print:text-sm">
                        {section.marksCalculation}
                      </div>
                    )}
                  </div>

                  {section.pairs.length > 0 && (
                    <div className="space-y-1">
                      {section.pairs.map((pair, index) => (
                        <div key={pair.id} className="flex items-start">
                          <div className="w-12 flex-shrink-0 text-black">
                            <span className="question-number">
                              {index + 1}.
                            </span>
                          </div>
                          <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-8 items-start">
                            <div className="text-black leading-relaxed print:leading-normal">
                              {pair.leftItem}
                            </div>
                            <div className="text-black font-bold px-4">-</div>
                            <div className="text-black leading-relaxed print:leading-normal pl-8">
                              {pair.rightItem}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}

          {!paperHeader.title &&
            !paperHeader.subject &&
            mcqSections.length === 0 &&
            qaSections.length === 0 &&
            matchSections.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">
                    Your question paper preview will appear here
                  </p>
                  <p className="text-sm">
                    Start by adding paper header information and questions
                  </p>
                  <p className="text-xs mt-2 text-purple-500">
                    💡 Try the "Load Sample" button to see how it works!
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
