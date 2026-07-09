import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const app = initializeApp({ projectId: 'ai-studio-00407b30-8849-4dfa-a553-9a074851a2e1' });
const db = getFirestore(app);
async function run() {
  const doc = await db.collection('users').doc('8Mh44R06W6ZqDwsuu97g5OiBwEC3').get();
  console.log(doc.data());
}
run();
