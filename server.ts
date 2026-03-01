import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("lifepulse.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    dob TEXT,
    medicare_no TEXT
  );

  CREATE TABLE IF NOT EXISTS health_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    date TEXT,
    type TEXT,
    description TEXT,
    provider TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    date TEXT,
    medicine TEXT,
    dosage TEXT,
    status TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    date TEXT,
    weight REAL,
    bp_sys INTEGER,
    bp_dia INTEGER,
    heart_rate INTEGER,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );
`);

// Seed data if empty
const patientCount = db.prepare("SELECT COUNT(*) as count FROM patients").get() as { count: number };
if (patientCount.count === 0) {
  const insertPatient = db.prepare("INSERT INTO patients (name, dob, medicare_no) VALUES (?, ?, ?)");
  insertPatient.run("John Doe", "1990-05-15", "1234 56789 1");

  const insertEvent = db.prepare("INSERT INTO health_events (patient_id, date, type, description, provider) VALUES (?, ?, ?, ?, ?)");
  insertEvent.run(1, "1990-05-15", "Birth", "Healthy birth at Royal Prince Alfred Hospital", "RPA Hospital");
  insertEvent.run(1, "1990-06-15", "Immunization", "6-week vaccinations (Hepatitis B, DTPa, etc.)", "Community Health Center");
  insertEvent.run(1, "1995-02-10", "Checkup", "Preschool health check - Normal growth", "Dr. Sarah Smith (GP)");
  insertEvent.run(1, "2010-08-22", "Injury", "Sprained ankle during school sports", "Sydney Children's Hospital");
  insertEvent.run(1, "2023-11-05", "Checkup", "Annual physical - BP slightly elevated", "Dr. James Wilson (GP)");

  const insertRx = db.prepare("INSERT INTO prescriptions (patient_id, date, medicine, dosage, status) VALUES (?, ?, ?, ?, ?)");
  insertRx.run(1, "2023-11-05", "Amlodipine", "5mg daily", "Active");
  insertRx.run(1, "2010-08-22", "Ibuprofen", "400mg as needed", "Completed");

  const insertVitals = db.prepare("INSERT INTO vitals (patient_id, date, weight, bp_sys, bp_dia, heart_rate) VALUES (?, ?, ?, ?, ?, ?)");
  insertVitals.run(1, "2023-01-10", 82.5, 120, 80, 72);
  insertVitals.run(1, "2023-04-15", 83.2, 125, 82, 75);
  insertVitals.run(1, "2023-07-20", 84.0, 130, 85, 78);
  insertVitals.run(1, "2023-11-05", 85.5, 138, 88, 80);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/patient/:id", (req, res) => {
    const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(req.params.id);
    const events = db.prepare("SELECT * FROM health_events WHERE id = ? ORDER BY date DESC").all(req.params.id);
    const rx = db.prepare("SELECT * FROM prescriptions WHERE id = ? ORDER BY date DESC").all(req.params.id);
    const vitals = db.prepare("SELECT * FROM vitals WHERE id = ? ORDER BY date ASC").all(req.params.id);
    res.json({ patient, events, rx, vitals });
  });

  app.get("/api/health-summary", (req, res) => {
    const events = db.prepare("SELECT * FROM health_events ORDER BY date ASC").all();
    const rx = db.prepare("SELECT * FROM prescriptions ORDER BY date DESC").all();
    const vitals = db.prepare("SELECT * FROM vitals ORDER BY date ASC").all();
    res.json({ events, rx, vitals });
  });

  app.post("/api/events", (req, res) => {
    const { date, type, description, provider } = req.body;
    const info = db.prepare("INSERT INTO health_events (patient_id, date, type, description, provider) VALUES (?, ?, ?, ?, ?)")
      .run(1, date, type, description, provider);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/prescriptions", (req, res) => {
    const { date, medicine, dosage, status } = req.body;
    const info = db.prepare("INSERT INTO prescriptions (patient_id, date, medicine, dosage, status) VALUES (?, ?, ?, ?, ?)")
      .run(1, date, medicine, dosage, status);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/vitals", (req, res) => {
    const { date, weight, bp_sys, bp_dia, heart_rate } = req.body;
    const info = db.prepare("INSERT INTO vitals (patient_id, date, weight, bp_sys, bp_dia, heart_rate) VALUES (?, ?, ?, ?, ?, ?)")
      .run(1, date, weight, bp_sys, bp_dia, heart_rate);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();