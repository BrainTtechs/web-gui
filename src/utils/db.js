import { initializeFirebase } from './firebase';
import { getDatabase } from "firebase/database";

initializeFirebase();
const db = getDatabase();

export default db;
