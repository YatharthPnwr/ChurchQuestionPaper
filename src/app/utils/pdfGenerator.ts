import jsPDF from "jspdf";

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

export interface PartSection {
  id: string;
  title: string;
}

export interface MemoryVerse {
  id: string;
  verse: string;
}

export interface MemoryVerseSection {
  id: string;
  sectionNumber: string;
  heading: string;
  instruction?: string;
  marksCalculation: string;
  verses: MemoryVerse[];
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
  memoryVerseSections?: MemoryVerseSection[];
  partSections?: PartSection[];
  sectionOrder?: Array<{
    type: "mcq" | "qa" | "match" | "memoryverse" | "part";
    id: string;
  }>;
}

// export const generatePDF = async (paperData: PaperData) => {
//   try {
//     // Create a temporary element for PDF generation
//     const tempElement = document.createElement("div");
//     tempElement.style.position = "absolute";
//     tempElement.style.left = "-9999px";
//     tempElement.style.top = "0";
//     tempElement.style.width = "794px"; // A4 width in pixels at 96 DPI
//     tempElement.style.padding = "60px 40px"; // Standard margins
//     tempElement.style.fontFamily = '"Times New Roman", serif';
//     tempElement.style.fontSize = "14px";
//     tempElement.style.lineHeight = "1.6";
//     tempElement.style.color = "#000000";
//     tempElement.style.backgroundColor = "#ffffff";

//     // Generate the HTML content
//     let htmlContent = "";

//     // Paper Header
//     if (paperData.header.title || paperData.header.subject) {
//       htmlContent += `
//         <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid black; padding-bottom: 20px;">
//           ${
//             paperData.header.title
//               ? `<h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">${paperData.header.title}</h1>`
//               : ""
//           }
//           ${
//             paperData.header.className || paperData.header.subject
//               ? `<h2 style="font-size: 20px; font-weight: bold; margin: 0 0 15px 0;">${
//                   paperData.header.className && paperData.header.subject
//                     ? `${paperData.header.className} - ${paperData.header.subject}`
//                     : paperData.header.className || paperData.header.subject
//                 }</h2>`
//               : ""
//           }
//           <div style="display: flex; justify-content: space-between; font-size: 12px;">
//             <div>
//               ${
//                 paperData.header.date
//                   ? `<div><strong>Date:</strong> ${paperData.header.date}</div>`
//                   : ""
//               }
//               ${
//                 paperData.header.time
//                   ? `<div><strong>Time:</strong> ${paperData.header.time}</div>`
//                   : ""
//               }
//             </div>
//             <div style="text-align: right;">
//               ${
//                 paperData.header.maxMarks
//                   ? `<div><strong>Max. Marks:</strong> ${paperData.header.maxMarks}</div>`
//                   : ""
//               }
//               <div><strong>Name:</strong> _____________________</div>
//             </div>
//           </div>
//         </div>
//       `;
//     }

//     // MCQ Section
//     if (
//       paperData.mcqSection.heading ||
//       paperData.mcqSection.questions.length > 0
//     ) {
//       htmlContent += `
//         <div style="margin-bottom: 30px;">
//           <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
//             <h3 style="font-size: 18px; font-weight: bold; margin: 0;">
//               ${paperData.mcqSection.id ? `${paperData.mcqSection.id}. ` : ""}${
//         paperData.mcqSection.heading
//       }${
//         paperData.mcqSection.subtitle ? ` ${paperData.mcqSection.subtitle}` : ""
//       }
//             </h3>
//             ${
//               paperData.mcqSection.marksCalculation
//                 ? `<div style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">${paperData.mcqSection.marksCalculation}</div>`
//                 : ""
//             }
//           </div>
//         </div>
//       `;
//     }

//     // Questions
//     if (paperData.mcqSection.questions.length > 0) {
//       paperData.mcqSection.questions.forEach((question, index) => {
//         if (question.question) {
//           htmlContent += `
//             <div style="margin-bottom: 20px; page-break-inside: avoid;">
//               <div style="margin-bottom: 12px;">
//                 <span style="margin-right: 12px;">${index + 1}.</span>${
//             question.question
//           }
//               </div>
//           `;

//           // Add options
//           const validOptions = question.options.filter((opt) => opt.trim());
//           if (validOptions.length > 0) {
//             htmlContent += `<div style="margin-left: 24px; display: flex; flex-wrap: wrap; gap: 15px 30px; align-items: flex-start;">`;
//             validOptions.forEach((option, optionIndex) => {
//               htmlContent += `
//                 <div style="display: inline-flex; align-items: flex-start; min-width: fit-content; max-width: calc(50% - 15px);">
//                   <span style="font-weight: bold; margin-right: 8px; white-space: nowrap;">(${String.fromCharCode(
//                     97 + optionIndex
//                   )})</span>
//                   <span style="word-wrap: break-word; line-height: 1.4;">${option}</span>
//                 </div>
//               `;
//             });
//             htmlContent += `</div>`;
//           }

//           htmlContent += `</div>`;
//         }
//       });
//     }

//     tempElement.innerHTML = htmlContent;
//     document.body.appendChild(tempElement);

//     // Generate canvas from the element
//     const canvas = await html2canvas(tempElement, {
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: "#ffffff",
//       width: 794,
//       height: tempElement.scrollHeight,
//     });

//     // Remove the temporary element
//     document.body.removeChild(tempElement);

//     // Create PDF
//     const imgWidth = 210; // A4 width in mm
//     const pageHeight = 297; // A4 height in mm
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
//     let heightLeft = imgHeight;

//     const pdf = new jsPDF("p", "mm", "a4");
//     let position = 0;

//     // Add the image to PDF
//     pdf.addImage(
//       canvas.toDataURL("image/png"),
//       "PNG",
//       0,
//       position,
//       imgWidth,
//       imgHeight
//     );
//     heightLeft -= pageHeight;

//     // Add new pages if content exceeds one page
//     while (heightLeft >= 0) {
//       position = heightLeft - imgHeight;
//       pdf.addPage();
//       pdf.addImage(
//         canvas.toDataURL("image/png"),
//         "PNG",
//         0,
//         position,
//         imgWidth,
//         imgHeight
//       );
//       heightLeft -= pageHeight;
//     }

//     // Generate filename
//     const filename = `Question_Paper_${paperData.header.subject || "MCQ"}_${
//       paperData.header.className || ""
//     }_${new Date().toISOString().split("T")[0]}.pdf`.replace(/\s+/g, "_");

//     // Save the PDF
//     pdf.save(filename);

//     return { success: true, filename };
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// };

export const generateAdvancedPDF = async (paperData: PaperData) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const usableWidth = pageWidth - margin * 2;
    let currentY = margin;

    // Set font
    pdf.setFont("times", "normal");

    // Paper Header
    if (paperData.header.title || paperData.header.subject) {
      // "Praise the Lord!" in italic
      if (paperData.header.title) {
        pdf.setFontSize(13);
        pdf.setFont("times", "italic");
        const titleWidth = pdf.getTextWidth(paperData.header.title);
        pdf.text(
          paperData.header.title,
          (pageWidth - titleWidth) / 2,
          currentY
        );
        currentY += 7;
      }

      // "THE PENTECOSTAL MISSION" - not bold
      pdf.setFontSize(16);
      pdf.setFont("times", "normal");
      const org1 = "THE PENTECOSTAL MISSION";
      const org1Width = pdf.getTextWidth(org1);
      pdf.text(org1, (pageWidth - org1Width) / 2, currentY);
      currentY += 7;

      // "SUNDAY SCHOOL CENTRAL ORGANIZATION, BARODA" - larger and not bold
      pdf.setFontSize(14);
      pdf.setFont("times", "normal");
      const org2 = "SUNDAY SCHOOL CENTRAL ORGANIZATION, BARODA";
      const org2Width = pdf.getTextWidth(org2);
      pdf.text(org2, (pageWidth - org2Width) / 2, currentY);
      currentY += 8;

      // Subject (e.g., "ANNUAL EXAMINATION - 2021") - underlined
      if (paperData.header.subject) {
        pdf.setFontSize(13);
        pdf.setFont("times", "bold");
        const subjectUpperCase = paperData.header.subject.toUpperCase();
        const subjectWidth = pdf.getTextWidth(subjectUpperCase);
        const subjectX = (pageWidth - subjectWidth) / 2;
        pdf.text(subjectUpperCase, subjectX, currentY);
        // Draw underline
        pdf.line(subjectX, currentY + 1, subjectX + subjectWidth, currentY + 1);
        currentY += 10;
      }

      // Bottom line with Time, Standard, Marks
      currentY += 6;
      pdf.setFontSize(12);
      pdf.setFont("times", "bold");

      // Time on the left
      if (paperData.header.time) {
        pdf.text(`Time : ${paperData.header.time}`, margin, currentY);
      }

      // Standard/Class in the center
      if (paperData.header.className) {
        const classText = paperData.header.className.toUpperCase();
        const classWidth = pdf.getTextWidth(classText);
        pdf.text(classText, (pageWidth - classWidth) / 2, currentY);
      }

      // Marks on the right
      if (paperData.header.maxMarks) {
        const marksText = `Marks : ${paperData.header.maxMarks}`;
        const marksWidth = pdf.getTextWidth(marksText);
        pdf.text(marksText, pageWidth - margin - marksWidth, currentY);
      }

      currentY += 8;
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

          currentY += 8;

          // MCQ Questions
          section.questions.forEach((question, index) => {
            if (!question.question.trim()) return;

            // Check if we need a new page for this question
            const estimatedQuestionHeight =
              20 + question.options.filter((opt) => opt.trim()).length * 6;
            if (currentY + estimatedQuestionHeight > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }

            // Question number and text
            pdf.setFontSize(12);
            pdf.setFont("times", "normal");

            // Render question number
            const questionNumber = `${index + 1}.`;
            pdf.text(questionNumber, margin, currentY);

            // Calculate indentation for wrapped text
            const numberWidth = pdf.getTextWidth(questionNumber + " ");
            const questionStartX = margin + numberWidth;
            const maxQuestionWidth = usableWidth - numberWidth;

            // Split question text to fit width
            const questionLines = pdf.splitTextToSize(
              question.question,
              maxQuestionWidth
            );

            // Render question text with proper indentation
            questionLines.forEach((line: string, lineIndex: number) => {
              if (currentY > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
              }
              pdf.text(line, questionStartX, currentY);
              if (lineIndex < questionLines.length - 1) {
                currentY += 5.5; // Line height
              }
            });

            currentY += 5.5; // Move down after the last line of question text

            // Options - Grid Layout (equal columns)
            const validOptions = question.options.filter((opt) => opt.trim());
            if (validOptions.length > 0) {
              pdf.setFont("times", "normal");
              pdf.setFontSize(12);

              // Calculate the starting position - align with question number
              const questionNumberWidth = pdf.getTextWidth(`${index + 1}. `);
              const optionsStartX = margin + questionNumberWidth;
              const maxLineWidth = usableWidth - questionNumberWidth;
              const optionsPerRow = Math.min(validOptions.length, 4); // Max 4 columns
              const columnWidth = maxLineWidth / optionsPerRow;

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
                  yPos += rowHeights[i] + 2;
                }

                // Check if we need a new page
                if (yPos + rowHeights[row] > pageHeight - margin) {
                  pdf.addPage();
                  currentY = margin;
                  yPos =
                    currentY +
                    (row > 0
                      ? rowHeights.slice(0, row).reduce((a, b) => a + b, 0) +
                        row * 2
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
              const totalHeight = rowHeights.reduce((sum, h) => sum + h + 2, 0);
              currentY += totalHeight;
            }

            currentY += 3; // Small space between questions
          });

          // Add space after MCQ section
          currentY += 8;
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

          currentY += 8;

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

            // Render question number
            const questionNumber = `${index + 1}.`;
            pdf.text(questionNumber, margin, currentY);

            // Calculate indentation for wrapped text
            const numberWidth = pdf.getTextWidth(questionNumber + " ");
            const questionStartX = margin + numberWidth;
            const maxQuestionWidth = usableWidth - numberWidth;

            // Split question text to fit width
            const questionLines = pdf.splitTextToSize(
              question.question,
              maxQuestionWidth
            );

            // Render question text with proper indentation
            questionLines.forEach((line: string, lineIndex: number) => {
              if (currentY > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
              }
              pdf.text(line, questionStartX, currentY);
              if (lineIndex < questionLines.length - 1) {
                currentY += 5.5; // Line height
              }
            });

            currentY += 7; // Small space between questions
          });

          // Add space after QA section
          currentY += 8;
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

          currentY += 8;

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
            const leftLines = pdf.splitTextToSize(leftText, usableWidth * 0.35);
            let tempY = currentY;
            leftLines.forEach((line: string) => {
              pdf.text(line, margin + 10, tempY);
              tempY += 6;
            });

            // Dash separator
            pdf.text("-", margin + usableWidth * 0.4, currentY);

            // Right item
            const rightText = pair.rightItem || "";
            const rightLines = pdf.splitTextToSize(
              rightText,
              usableWidth * 0.5
            );
            tempY = currentY;
            rightLines.forEach((line: string) => {
              pdf.text(line, margin + usableWidth * 0.5, tempY);
              tempY += 6;
            });

            currentY = Math.max(
              currentY + Math.max(leftLines.length, rightLines.length) * 6,
              currentY + 6
            );
            currentY += 2; // Small space between pairs
          });

          // Add space after Match section
          currentY += 8;
        }

        // Render Memory Verse Section
        if (item.type === "memoryverse") {
          const section = paperData.memoryVerseSections?.find(
            (s) => s.id === item.id
          );
          if (!section) return;

          // Check if we need a new page
          if (currentY > pageHeight - margin - 50) {
            pdf.addPage();
            currentY = margin;
          }

          // Memory Verse Section Header
          pdf.setFontSize(14);
          pdf.setFont("times", "bold");

          const sectionTitle =
            (section.sectionNumber ? `${section.sectionNumber}. ` : "") +
            section.heading +
            (section.instruction ? ` ${section.instruction}` : "");

          pdf.text(sectionTitle, margin, currentY);

          if (section.marksCalculation) {
            const marksWidth = pdf.getTextWidth(section.marksCalculation);
            pdf.text(
              section.marksCalculation,
              pageWidth - margin - marksWidth,
              currentY
            );
          }

          currentY += 8;

          // Memory Verses - Grid Layout (4 columns)
          if (section.verses.length > 0) {
            pdf.setFontSize(12);

            const versesPerRow = 4;
            const columnWidth = usableWidth / versesPerRow;

            section.verses.forEach((verse, index) => {
              if (!verse.verse.trim()) return;

              const col = index % versesPerRow;
              const row = Math.floor(index / versesPerRow);

              // Check if we need a new page for a new row
              if (col === 0 && currentY > pageHeight - margin - 10) {
                pdf.addPage();
                currentY = margin;
              }

              const xPos = margin + col * columnWidth;
              const yPos = currentY + row * 6;

              // Verse number (bold) and reference (normal)
              const verseNumber = `${index + 1}.`;
              const verseReference = verse.verse;

              // Render number in bold
              pdf.setFont("times", "bold");
              pdf.text(verseNumber, xPos, yPos);

              // Calculate width of the number to position the reference text
              const numberWidth = pdf.getTextWidth(verseNumber + " ");

              // Render reference in normal font
              pdf.setFont("times", "normal");
              const verseLines = pdf.splitTextToSize(
                verseReference,
                columnWidth - numberWidth - 5
              );

              verseLines.forEach((line: string, lineIndex: number) => {
                pdf.text(line, xPos + numberWidth, yPos + lineIndex * 5);
              });
            });

            // Move to next line after all verses
            const totalRows = Math.ceil(section.verses.length / versesPerRow);
            currentY += totalRows * 6 + 6; // Add spacing after verses
          }

          // Add space after Memory Verse section
          currentY += 2;
        }

        // Render Part Section
        if (item.type === "part") {
          const section = paperData.partSections?.find((s) => s.id === item.id);
          if (!section) return;

          // Check if we need a new page
          if (currentY > pageHeight - margin - 30) {
            pdf.addPage();
            currentY = margin;
          }

          // Part Title - centered and bold
          pdf.setFontSize(14);
          pdf.setFont("times", "bold");

          const titleWidth = pdf.getTextWidth(section.title);
          const centerX = (pageWidth - titleWidth) / 2;
          pdf.text(section.title, centerX, currentY);

          currentY += 10; // Space after part title
        }
      });
    }

    // Add decorative design at the end of the paper
    if (currentY > margin) {
      // Add some space before the design
      currentY += 15;

      // Check if we need a new page
      if (currentY > pageHeight - margin - 20) {
        pdf.addPage();
        currentY = margin + 15;
      }

      // Add the decorative image
      try {
        const imgPath = "/image.png";

        // Load image as blob and convert to base64
        const response = await fetch(imgPath);
        const blob = await response.blob();
        const imgData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        // Calculate dimensions to center the image (slightly bigger)
        const imgWidth = 30; // Width in mm (increased from 25)
        const imgHeight = 5.5; // Height in mm (increased from 4.5)
        const centerX = (pageWidth - imgWidth) / 2;

        pdf.addImage(imgData, "PNG", centerX, currentY, imgWidth, imgHeight);
      } catch (error) {
        console.error("Error loading decorative image:", error);
        // Continue without image if there's an error
      }
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
