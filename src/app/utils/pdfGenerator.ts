import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface QAQuestion {
  id: string;
  question: string;
}

export interface QASection {
  id: string;
  sectionNumber: string;
  heading: string;
  instruction: string;
  marksCalculation: string;
  questions: QAQuestion[];
}

export interface MatchPair {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface MatchSection {
  id: string;
  sectionNumber: string;
  heading: string;
  instruction?: string;
  marksCalculation: string;
  pairs: MatchPair[];
}

export interface MCQSection {
  id: string;
  sectionNumber: string; // e.g., "I", "II", "III"
  heading: string;
  subtitle?: string;
  marksCalculation: string;
  questions: Array<{
    id: string;
    question: string;
    options: [string, string, string, string];
  }>;
}

export interface PaperData {
  header: {
    title: string;
    subtitle: string;
    className: string;
    subject: string;
    date: string;
    time: string;
    maxMarks: string;
  };
  mcqSections?: MCQSection[];
  qaSections?: QASection[];
  matchSections?: MatchSection[];
  sectionOrder?: Array<{ type: "mcq" | "qa" | "match"; id: string }>;
}

export const generatePDF = async (paperData: PaperData) => {
  try {
    // Create a temporary element for PDF generation
    const tempElement = document.createElement("div");
    tempElement.style.position = "absolute";
    tempElement.style.left = "-9999px";
    tempElement.style.top = "0";
    tempElement.style.width = "794px"; // A4 width in pixels at 96 DPI
    tempElement.style.padding = "60px 40px"; // Standard margins
    tempElement.style.fontFamily = '"Times New Roman", serif';
    tempElement.style.fontSize = "14px";
    tempElement.style.lineHeight = "1.6";
    tempElement.style.color = "#000000";
    tempElement.style.backgroundColor = "#ffffff";

    // Generate the HTML content
    let htmlContent = "";

    // Paper Header
    if (paperData.header.title || paperData.header.subject) {
      htmlContent += `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid black; padding-bottom: 20px;">
          ${
            paperData.header.title
              ? `<h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">${paperData.header.title}</h1>`
              : ""
          }
          ${
            paperData.header.className || paperData.header.subject
              ? `<h2 style="font-size: 20px; font-weight: bold; margin: 0 0 15px 0;">${
                  paperData.header.className && paperData.header.subject
                    ? `${paperData.header.className} - ${paperData.header.subject}`
                    : paperData.header.className || paperData.header.subject
                }</h2>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <div>
              ${
                paperData.header.date
                  ? `<div><strong>Date:</strong> ${paperData.header.date}</div>`
                  : ""
              }
              ${
                paperData.header.time
                  ? `<div><strong>Time:</strong> ${paperData.header.time}</div>`
                  : ""
              }
            </div>
            <div style="text-align: right;">
              ${
                paperData.header.maxMarks
                  ? `<div><strong>Max. Marks:</strong> ${paperData.header.maxMarks}</div>`
                  : ""
              }
              <div><strong>Name:</strong> _____________________</div>
            </div>
          </div>
        </div>
      `;
    }

    // MCQ Section
    if (
      paperData.mcqSection.heading ||
      paperData.mcqSection.questions.length > 0
    ) {
      htmlContent += `
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: bold; margin: 0;">
              ${paperData.mcqSection.id ? `${paperData.mcqSection.id}. ` : ""}${
        paperData.mcqSection.heading
      }${
        paperData.mcqSection.subtitle ? ` ${paperData.mcqSection.subtitle}` : ""
      }
            </h3>
            ${
              paperData.mcqSection.marksCalculation
                ? `<div style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">${paperData.mcqSection.marksCalculation}</div>`
                : ""
            }
          </div>
        </div>
      `;
    }

    // Questions
    if (paperData.mcqSection.questions.length > 0) {
      paperData.mcqSection.questions.forEach((question, index) => {
        if (question.question) {
          htmlContent += `
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
              <div style="margin-bottom: 12px;">
                <span style="margin-right: 12px;">${index + 1}.</span>${
            question.question
          }
              </div>
          `;

          // Add options
          const validOptions = question.options.filter((opt) => opt.trim());
          if (validOptions.length > 0) {
            htmlContent += `<div style="margin-left: 24px; display: flex; flex-wrap: wrap; gap: 15px 30px; align-items: flex-start;">`;
            validOptions.forEach((option, optionIndex) => {
              htmlContent += `
                <div style="display: inline-flex; align-items: flex-start; min-width: fit-content; max-width: calc(50% - 15px);">
                  <span style="font-weight: bold; margin-right: 8px; white-space: nowrap;">(${String.fromCharCode(
                    97 + optionIndex
                  )})</span>
                  <span style="word-wrap: break-word; line-height: 1.4;">${option}</span>
                </div>
              `;
            });
            htmlContent += `</div>`;
          }

          htmlContent += `</div>`;
        }
      });
    }

    tempElement.innerHTML = htmlContent;
    document.body.appendChild(tempElement);

    // Generate canvas from the element
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 794,
      height: tempElement.scrollHeight,
    });

    // Remove the temporary element
    document.body.removeChild(tempElement);

    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add the image to PDF
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    // Add new pages if content exceeds one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    // Generate filename
    const filename = `Question_Paper_${paperData.header.subject || "MCQ"}_${
      paperData.header.className || ""
    }_${new Date().toISOString().split("T")[0]}.pdf`.replace(/\s+/g, "_");

    // Save the PDF
    pdf.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const generateAdvancedPDF = (paperData: PaperData) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const usableWidth = pageWidth - margin * 2;
    let currentY = margin;

    // Set font
    pdf.setFont("times", "normal");

    // Helper function to add text with automatic page breaks
    const addTextWithPageBreaks = (
      text: string,
      x: number,
      y: number,
      fontSize: number = 12,
      isBold: boolean = false
    ): number => {
      pdf.setFontSize(fontSize);
      pdf.setFont("times", isBold ? "bold" : "normal");

      const lines = pdf.splitTextToSize(text, usableWidth - x + margin);

      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, x, y);
        y += fontSize * 0.5; // Line spacing
      });

      return y;
    };

    // Paper Header
    if (paperData.header.title || paperData.header.subject) {
      // Title
      if (paperData.header.title) {
        pdf.setFontSize(20);
        pdf.setFont("times", "bold");
        const titleWidth = pdf.getTextWidth(paperData.header.title);
        pdf.text(
          paperData.header.title,
          (pageWidth - titleWidth) / 2,
          currentY
        );
        currentY += 15;
      }

      // Class and Subject
      if (paperData.header.className || paperData.header.subject) {
        const subtitle =
          paperData.header.className && paperData.header.subject
            ? `${paperData.header.className} - ${paperData.header.subject}`
            : paperData.header.className || paperData.header.subject;

        pdf.setFontSize(16);
        pdf.setFont("times", "bold");
        const subtitleWidth = pdf.getTextWidth(subtitle);
        pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, currentY);
        currentY += 12;
      }

      // Date, Time, Marks, Name
      currentY += 5;
      pdf.setFontSize(10);
      pdf.setFont("times", "normal");

      if (paperData.header.date) {
        pdf.text(`Date: ${paperData.header.date}`, margin, currentY);
      }
      if (paperData.header.time) {
        pdf.text(`Time: ${paperData.header.time}`, margin, currentY + 8);
      }

      if (paperData.header.maxMarks) {
        const marksText = `Max. Marks: ${paperData.header.maxMarks}`;
        const marksWidth = pdf.getTextWidth(marksText);
        pdf.text(marksText, pageWidth - margin - marksWidth, currentY);
      }

      const nameText = "Name: _____________________";
      const nameWidth = pdf.getTextWidth(nameText);
      pdf.text(nameText, pageWidth - margin - nameWidth, currentY + 8);

      currentY += 20;

      // Draw line
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 15;
    }

    // Render sections in user-defined order
    if (paperData.sectionOrder && paperData.sectionOrder.length > 0) {
      paperData.sectionOrder.forEach((item) => {
        // Render MCQ Section
        if (item.type === "mcq") {
          const section = paperData.mcqSections?.find((s) => s.id === item.id);
          if (!section) return;

          // Check if we need a new page
          if (currentY > pageHeight - margin - 50) {
            pdf.addPage();
            currentY = margin;
          }

          // MCQ Section Header
          pdf.setFontSize(14);
          pdf.setFont("times", "bold");

          // Build the section title with section number and instruction
          const sectionTitle =
            (section.sectionNumber ? `${section.sectionNumber}. ` : "") +
            section.heading +
            (section.subtitle ? ` ${section.subtitle}` : "");

          pdf.text(sectionTitle, margin, currentY);

          if (section.marksCalculation) {
            const marksWidth = pdf.getTextWidth(section.marksCalculation);
            pdf.text(
              section.marksCalculation,
              pageWidth - margin - marksWidth,
              currentY
            );
          }

          currentY += 15;

          // MCQ Questions
          section.questions.forEach((question, index) => {
            if (!question.question.trim()) return;

            // Check if we need a new page for this question
            const estimatedQuestionHeight =
              30 + question.options.filter((opt) => opt.trim()).length * 8;
            if (currentY + estimatedQuestionHeight > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }

            // Question number and text
            pdf.setFontSize(12);
            pdf.setFont("times", "normal");
            const questionText = `${index + 1}. ${question.question}`;
            currentY = addTextWithPageBreaks(
              questionText,
              margin,
              currentY,
              12,
              false
            );
            currentY += 0.5;

            // Options - Grid Layout (equal columns)
            const validOptions = question.options.filter((opt) => opt.trim());
            if (validOptions.length > 0) {
              pdf.setFont("times", "normal");
              pdf.setFontSize(11);

              // Calculate the starting position - align with question number
              const questionNumberWidth = pdf.getTextWidth(`${index + 1}. `);
              const optionsStartX = margin + questionNumberWidth;
              const maxLineWidth = usableWidth - questionNumberWidth;
              const optionsPerRow = Math.min(validOptions.length, 4); // Max 4 columns
              const columnWidth = maxLineWidth / optionsPerRow;

              let currentRow = 0;
              let maxRowHeight = 0;
              const rowHeights: number[] = [];

              // First pass: calculate heights for each option
              validOptions.forEach((option, optionIndex) => {
                const optionLetter = `(${String.fromCharCode(
                  97 + optionIndex
                )})`;
                const optionLetterWidth = pdf.getTextWidth(optionLetter + " ");
                const lines = pdf.splitTextToSize(
                  option,
                  columnWidth - optionLetterWidth - 5
                );
                const height = lines.length * 5.5;

                const row = Math.floor(optionIndex / optionsPerRow);
                if (!rowHeights[row]) rowHeights[row] = 0;
                rowHeights[row] = Math.max(rowHeights[row], height);
              });

              // Second pass: render options in grid
              validOptions.forEach((option, optionIndex) => {
                const col = optionIndex % optionsPerRow;
                const row = Math.floor(optionIndex / optionsPerRow);

                // Calculate position - start from where question text starts
                const xPos = optionsStartX + col * columnWidth;
                let yPos = currentY;

                // Add heights of previous rows
                for (let i = 0; i < row; i++) {
                  yPos += rowHeights[i] + 5;
                }

                // Check if we need a new page
                if (yPos + rowHeights[row] > pageHeight - margin) {
                  pdf.addPage();
                  currentY = margin;
                  yPos =
                    currentY +
                    (row > 0
                      ? rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
                        row * 5
                      : 0);
                }

                // Render option letter and text separately for better wrapping
                const optionLetter = `(${String.fromCharCode(
                  97 + optionIndex
                )})`;

                // Set bold for option letter
                pdf.setFont("times", "bold");
                const optionLetterWidth = pdf.getTextWidth(optionLetter + " ");

                // Render the option letter in bold
                pdf.text(optionLetter, xPos, yPos);

                // Set normal font for option text
                pdf.setFont("times", "normal");

                // Wrap only the option text with proper indentation
                const lines = pdf.splitTextToSize(
                  option,
                  columnWidth - optionLetterWidth - 5
                );

                lines.forEach((line: string, lineIndex: number) => {
                  const textXPos =
                    lineIndex === 0
                      ? xPos + optionLetterWidth
                      : xPos + optionLetterWidth;
                  pdf.text(line, textXPos, yPos + lineIndex * 5.5);
                });
              });

              // Update currentY to after all rows
              const totalHeight = rowHeights.reduce((sum, h) => sum + h + 5, 0);
              currentY += totalHeight;
            }

            currentY += 0.5; // Minimal space between questions
          });

          // Add space after MCQ section
          currentY += 15;
        }

        // Render QA Section
        if (item.type === "qa") {
          const section = paperData.qaSections?.find((s) => s.id === item.id);
          if (!section) return;

          // Check if we need a new page
          if (currentY > pageHeight - margin - 50) {
            pdf.addPage();
            currentY = margin;
          }

          // Section Header (Roman numeral + heading)
          pdf.setFontSize(14);
          pdf.setFont("times", "bold");

          const sectionHeader = section.sectionNumber
            ? `${section.sectionNumber}. ${section.heading}`
            : section.heading;

          const fullHeader = section.instruction
            ? `${sectionHeader} ${section.instruction}`
            : sectionHeader;

          pdf.text(fullHeader, margin, currentY);

          // Marks calculation on the right
          if (section.marksCalculation) {
            const marksWidth = pdf.getTextWidth(section.marksCalculation);
            pdf.text(
              section.marksCalculation,
              pageWidth - margin - marksWidth,
              currentY
            );
          }

          currentY += 12;

          // Questions
          section.questions.forEach((question, index) => {
            if (!question.question.trim()) return;

            // Check if we need a new page
            if (currentY > pageHeight - margin - 20) {
              pdf.addPage();
              currentY = margin;
            }

            // Question number and text
            pdf.setFontSize(12);
            pdf.setFont("times", "normal");
            const questionText = `${index + 1}. ${question.question}`;
            currentY = addTextWithPageBreaks(
              questionText,
              margin,
              currentY,
              12,
              false
            );
            currentY += 3; // Minimal space between questions
          });

          // Add space after QA section
          currentY += 15;
        }

        // Render Match Section
        if (item.type === "match") {
          const section = paperData.matchSections?.find(
            (s) => s.id === item.id
          );
          if (!section) return;

          // Check if we need a new page
          if (currentY > pageHeight - margin - 50) {
            pdf.addPage();
            currentY = margin;
          }

          // Section Header
          pdf.setFontSize(14);
          pdf.setFont("times", "bold");

          const sectionHeader = section.sectionNumber
            ? `${section.sectionNumber}. ${section.heading}`
            : section.heading;

          const fullHeader = section.instruction
            ? `${sectionHeader} ${section.instruction}`
            : sectionHeader;

          pdf.text(fullHeader, margin, currentY);

          // Marks calculation on the right
          if (section.marksCalculation) {
            const marksWidth = pdf.getTextWidth(section.marksCalculation);
            pdf.text(
              section.marksCalculation,
              pageWidth - margin - marksWidth,
              currentY
            );
          }

          currentY += 12;

          // Match Pairs
          section.pairs.forEach((pair, index) => {
            if (!pair.leftItem.trim() && !pair.rightItem.trim()) return;

            // Check if we need a new page
            if (currentY > pageHeight - margin - 20) {
              pdf.addPage();
              currentY = margin;
            }

            // Pair number
            pdf.setFontSize(12);
            pdf.setFont("times", "normal");
            pdf.text(`${index + 1}.`, margin, currentY);

            // Left item
            const leftText = pair.leftItem || "";
            const leftLines = pdf.splitTextToSize(leftText, usableWidth * 0.4);
            let tempY = currentY;
            leftLines.forEach((line: string) => {
              pdf.text(line, margin + 10, tempY);
              tempY += 6;
            });

            // Dash separator
            pdf.text("-", margin + usableWidth * 0.42, currentY);

            // Right item
            const rightText = pair.rightItem || "";
            const rightLines = pdf.splitTextToSize(
              rightText,
              usableWidth * 0.5
            );
            tempY = currentY;
            rightLines.forEach((line: string) => {
              pdf.text(line, margin + usableWidth * 0.46, tempY);
              tempY += 6;
            });

            currentY = Math.max(
              currentY + Math.max(leftLines.length, rightLines.length) * 6,
              currentY + 6
            );
            currentY += 2; // Small space between pairs
          });

          // Add space after Match section
          currentY += 15;
        }
      });
    }

    // Generate filename
    const filename = `Question_Paper_${paperData.header.subject || "MCQ"}_${
      paperData.header.className || ""
    }_${new Date().toISOString().split("T")[0]}.pdf`.replace(/\s+/g, "_");

    // Save the PDF
    pdf.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
