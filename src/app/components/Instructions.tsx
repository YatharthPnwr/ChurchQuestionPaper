"use client";

export default function Instructions() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md no-print">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            How to use the Question Paper Generator
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Fill in the <strong>Paper Header</strong> section with your
                institution details
              </li>
              <li>
                Add a <strong>Section Heading</strong> (e.g., &quot;Multiple
                Choice Questions&quot;)
              </li>
              <li>
                Enter the <strong>Marks Calculation</strong> (e.g., &quot;25 × 2
                = 50&quot;)
              </li>
              <li>
                Click <strong>&quot;Add Question&quot;</strong> to create new
                MCQs
              </li>
              <li>
                Fill in the question text and four options for each question
              </li>
              <li>
                Watch the <strong>Live Preview</strong> update as you type
              </li>
              <li>
                Use <strong>&quot;Load Sample&quot;</strong> to see an example
              </li>
              <li>
                Click <strong>&quot;Print&quot;</strong> to generate a PDF or
                print the paper
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
