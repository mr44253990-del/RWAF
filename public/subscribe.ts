import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountVar) {
    try {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable is missing");
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin not initialized. Please check FIREBASE_SERVICE_ACCOUNT environment variable.");
    }
    await admin.messaging().subscribeToTopic(token, "all");
    res.status(200).json({ success: true, message: "Subscribed to topic: all" });
  } catch (error: any) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: error.message });
  }
}
