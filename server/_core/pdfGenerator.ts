// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmake = require("pdfmake");
import path from "path";
import fs from "fs";

// Caminhos absolutos para as fontes Roboto incluídas no pdfmake
const fontsDir = path.resolve(process.cwd(), "node_modules/pdfmake/build/fonts/Roboto");

// Carregar fontes como VFS (virtual file system) para pdfmake v0.3.x
function loadFontsToVfs() {
  const fontFiles: Record<string, string> = {
    "Roboto-Regular.ttf": path.join(fontsDir, "Roboto-Regular.ttf"),
    "Roboto-Medium.ttf": path.join(fontsDir, "Roboto-Medium.ttf"),
    "Roboto-Italic.ttf": path.join(fontsDir, "Roboto-Italic.ttf"),
    "Roboto-MediumItalic.ttf": path.join(fontsDir, "Roboto-MediumItalic.ttf"),
  };

  const vfs: Record<string, string> = {};
  for (const [name, filePath] of Object.entries(fontFiles)) {
    vfs[name] = fs.readFileSync(filePath).toString("base64");
  }
  return vfs;
}

export interface PdfDocumentData {
  doctorName: string;
  doctorCrm: string;
  doctorSpecialty?: string;
  patientName: string;
  patientDob?: string;
  documentTitle: string;
  documentContent: string;
  generatedAt: Date;
}

export async function generateClinicalPdf(data: PdfDocumentData): Promise<Buffer> {
  // Configurar fontes e VFS
  pdfmake.addVirtualFileSystem(loadFontsToVfs());
  pdfmake.addFonts({
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  });

  const headerParts: object[] = [
    { text: data.doctorName + "\n", bold: true, fontSize: 11 },
    { text: `CRM: ${data.doctorCrm}`, fontSize: 9, color: "#666666" },
  ];
  if (data.doctorSpecialty) {
    headerParts.push({ text: `  •  ${data.doctorSpecialty}`, fontSize: 9, color: "#666666" });
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [56, 72, 56, 72],
    defaultStyle: { font: "Roboto", fontSize: 10, lineHeight: 1.5 },
    header: {
      columns: [{ text: headerParts, margin: [56, 24, 56, 0] }],
    },
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: `Documento gerado com auxílio de IA e revisado pelo médico responsável  •  Pág. ${currentPage}/${pageCount}`,
          fontSize: 8,
          color: "#999999",
          alignment: "center",
          margin: [56, 0, 56, 24],
        },
      ],
    }),
    content: [
      // Linha divisória após header
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 483, y2: 0, lineWidth: 0.5, lineColor: "#DDDDDD" }],
        margin: [0, 0, 0, 16],
      },
      // Título do documento
      { text: data.documentTitle, fontSize: 14, bold: true, margin: [0, 0, 0, 4] },
      {
        text: `Emitido em ${data.generatedAt.toLocaleDateString("pt-BR")} às ${data.generatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        fontSize: 8,
        color: "#888888",
        margin: [0, 0, 0, 16],
      },
      // Dados do paciente
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: [
                  { text: "Paciente: ", bold: true },
                  data.patientName,
                  ...(data.patientDob ? [`   •   DN: ${data.patientDob}`] : []),
                ],
                fillColor: "#F8F8F8",
                border: [false, false, false, false],
                margin: [12, 8, 12, 8],
                fontSize: 10,
              },
            ],
          ],
        },
        margin: [0, 0, 0, 16],
      },
      // Linha divisória
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 483, y2: 0, lineWidth: 0.5, lineColor: "#EEEEEE" }],
        margin: [0, 0, 0, 16],
      },
      // Conteúdo do documento
      { text: data.documentContent, fontSize: 10, lineHeight: 1.6 },
    ],
  };

  const pdfDoc = pdfmake.createPdf(docDefinition);
  const buffer: Buffer = await pdfDoc.getBuffer();
  return buffer;
}
