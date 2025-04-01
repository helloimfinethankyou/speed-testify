import { clientPromise } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("testtastic");

        // Formidable für Datei-Upload konfigurieren
        const form = formidable({
            maxFileSize: 1 * 1024 * 1024, // 1MB
            filter: function ({ mimetype }) {
                return mimetype && (
                    mimetype.includes('zip') ||
                    mimetype.includes('html') ||
                    mimetype.includes('image')
                );
            }
        });

        // Formular-Daten parsen
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        // Validierung der erforderlichen Felder
        if (!fields.testGoals || !fields.targetAudience || !fields.testTasks || !fields.language) {
            return res.status(400).json({ 
                success: false, 
                message: 'Alle Pflichtfelder müssen ausgefüllt sein' 
            });
        }

        // Erstelle einen eindeutigen Ordner für die Dateien
        const testId = new ObjectId();
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', testId.toString());
        fs.mkdirSync(uploadDir, { recursive: true });

        let filePath = null;
        let fileType = null;

        // Verarbeite Datei-Upload wenn vorhanden
        if (files.file) {
            const file = files.file;
            const fileExt = path.extname(file.originalFilename);
            const fileName = `${uuidv4()}${fileExt}`;
            filePath = path.join(uploadDir, fileName);
            
            // Datei kopieren
            fs.copyFileSync(file.filepath, filePath);
            
            // Dateityp bestimmen
            fileType = file.mimetype;
        }

        // Erstelle Test-Dokument
        const test = {
            _id: testId,
            websiteUrl: fields.websiteUrl || null,
            filePath: filePath ? `/uploads/${testId}/${path.basename(filePath)}` : null,
            fileType: fileType,
            testGoals: fields.testGoals,
            targetAudience: fields.targetAudience,
            testTasks: fields.testTasks,
            language: fields.language,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Speichere in MongoDB
        await db.collection('tests').insertOne(test);

        return res.status(200).json({
            success: true,
            testId: testId.toString(),
            message: 'Test erfolgreich erstellt'
        });

    } catch (error) {
        console.error('Fehler beim Erstellen des Tests:', error);
        return res.status(500).json({
            success: false,
            message: 'Ein Fehler ist beim Erstellen des Tests aufgetreten'
        });
    }
} 