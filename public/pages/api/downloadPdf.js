import { clientPromise } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { testId } = req.query;

    if (!testId) {
        return res.status(400).json({ success: false, message: 'Test ID ist erforderlich' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("testtastic");
        const test = await db.collection("tests").findOne({ _id: new ObjectId(testId) });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test nicht gefunden' });
        }

        if (!test.results) {
            return res.status(400).json({ success: false, message: 'Keine Ergebnisse verfügbar' });
        }

        // Erstelle ein neues PDF-Dokument
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Testtastic Report - ${test.websiteUrl || 'Prototyp'}`,
                Author: 'Testtastic'
            }
        });

        // Setze die Response-Header für PDF-Download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=testtastic-report-${testId}.pdf`);

        // Pipe das PDF direkt in die Response
        doc.pipe(res);

        // Header
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .text('Testtastic Report', { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica')
           .fontSize(12)
           .text(`Erstellt am: ${new Date(test.createdAt).toLocaleDateString('de-DE')}`, { align: 'center' });

        doc.moveDown(2);

        // Test-Details
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('Test-Details');

        doc.font('Helvetica')
           .fontSize(12)
           .text(`Website/Prototyp: ${test.websiteUrl || 'Prototyp-Upload'}`)
           .text(`Zielgruppe: ${test.targetAudience}`)
           .text(`Testziele: ${test.testGoals}`)
           .text(`Testaufgaben: ${test.testTasks}`)
           .text(`Sprache: ${test.language}`);

        doc.moveDown(2);

        // Zusammenfassung
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('Zusammenfassung');

        doc.font('Helvetica')
           .fontSize(12)
           .text(test.results.summary);

        doc.moveDown(2);

        // Metriken
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('Metriken');

        const metrics = test.results.metrics;
        doc.font('Helvetica')
           .fontSize(12)
           .text(`Usability: ${metrics.usabilityScore}/100`)
           .text(`Performance: ${metrics.performanceScore}/100`)
           .text(`Design: ${metrics.designScore}/100`);

        doc.moveDown(2);

        // Erkenntnisse
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('Erkenntnisse');

        test.results.findings.forEach(finding => {
            doc.font('Helvetica')
               .fontSize(12)
               .text(finding.title, { underline: true })
               .text(finding.description)
               .text(`Priorität: ${finding.priority === 'high' ? 'Hoch' : finding.priority === 'medium' ? 'Mittel' : 'Niedrig'}`)
               .moveDown();
        });

        // Empfehlungen
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('Empfehlungen');

        test.results.recommendations.forEach(rec => {
            doc.font('Helvetica')
               .fontSize(12)
               .text(`• ${rec}`)
               .moveDown(0.5);
        });

        // Footer
        doc.moveDown(2);
        doc.font('Helvetica')
           .fontSize(10)
           .text('© 2024 Testtastic - Alle Rechte vorbehalten', { align: 'center' });

        // Beende das PDF
        doc.end();

    } catch (error) {
        console.error('Fehler bei der PDF-Generierung:', error);
        return res.status(500).json({ success: false, message: 'Fehler bei der PDF-Generierung' });
    }
} 