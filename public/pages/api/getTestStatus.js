import { clientPromise } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { testId } = req.query;

    if (!testId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Test ID ist erforderlich' 
        });
    }

    try {
        const client = await clientPromise;
        const db = client.db("testtastic");

        // Test aus der Datenbank abrufen
        const test = await db.collection('tests').findOne({
            _id: new ObjectId(testId)
        });

        if (!test) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test nicht gefunden' 
            });
        }

        // Berechne den Fortschritt basierend auf der verstrichenen Zeit
        const now = new Date();
        const createdAt = new Date(test.createdAt);
        const elapsedTime = (now - createdAt) / 1000; // in Sekunden
        const totalDuration = 30; // Gesamtdauer in Sekunden
        const progress = Math.min(Math.round((elapsedTime / totalDuration) * 100), 100);

        // Bestimme den aktuellen Schritt basierend auf dem Fortschritt
        let currentStep = 0;
        if (progress >= 25) currentStep = 1;
        if (progress >= 50) currentStep = 2;
        if (progress >= 75) currentStep = 3;
        if (progress >= 100) currentStep = 4;

        // Starte die Analyse bei 75% Fortschritt
        if (progress >= 75 && !test.analysisStarted) {
            // Markiere die Analyse als gestartet
            await db.collection('tests').updateOne(
                { _id: new ObjectId(testId) },
                { $set: { analysisStarted: true } }
            );

            // Starte die Analyse im Hintergrund
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyzeTest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testId }),
            }).catch(error => {
                console.error('Fehler beim Starten der Analyse:', error);
            });
        }

        // Wenn der Test abgeschlossen ist und keine Ergebnisse vorhanden sind
        if (progress >= 100 && !test.results) {
            return res.status(200).json({
                success: true,
                status: 'analyzing',
                progress: 100,
                currentStep: 4,
                message: 'Test wird analysiert...'
            });
        }

        // Wenn der Test noch läuft
        if (progress < 100) {
            return res.status(200).json({
                success: true,
                status: 'in_progress',
                progress,
                currentStep
            });
        }

        // Wenn der Test bereits abgeschlossen ist und Ergebnisse vorhanden sind
        return res.status(200).json({
            success: true,
            status: 'completed',
            progress: 100,
            currentStep: 4,
            results: test.results
        });

    } catch (error) {
        console.error('Fehler beim Abrufen des Teststatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Ein Fehler ist beim Abrufen des Teststatus aufgetreten'
        });
    }
} 