import { clientPromise } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST-Anfragen erlaubt' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("testtastic-db");

    const resultData = {
      testId: req.body.testId,
      summary: req.body.summary,
      findings: req.body.findings,
      createdAt: new Date(),
    };

    const result = await db.collection("results").insertOne(resultData);

    // Update den Status des Tests auf 'completed'
    await db.collection("tests").updateOne(
      { _id: req.body.testId },
      { $set: { status: 'completed' } }
    );

    res.status(200).json({ 
      success: true, 
      resultId: result.insertedId,
      message: 'Testergebnisse erfolgreich gespeichert' 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Speichern der Testergebnisse' 
    });
  }
} 