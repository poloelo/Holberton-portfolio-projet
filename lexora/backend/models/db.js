import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
  filename: './lexora.db',
  driver: sqlite3.Database
});

console.log("✅ Base de données connectée !");

export default db;