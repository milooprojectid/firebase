import * as functions from 'firebase-functions';
import { Telegram } from 'telegraf';
import * as admin from 'firebase-admin';

export const googleCloudAlert = functions.region('asia-east2').pubsub.topic('cloud-builds').onPublish(async (pubSubEvent, context) => {
    const db = admin.firestore();

    // log into console
    console.info(pubSubEvent.data);

    const configs = await db.collection('configurations').doc('builds');
    const buildConfig = await configs.get().then(doc => doc.exists ? doc.data() : null);
    if (!buildConfig) return;
  
    const TOKEN = String(process.env.TOKEN_TELEGRAM);
    const tg = new Telegram(TOKEN);
  
    const message = "something went wrong on your GCP, go check it out mate."
    const GROUP_IDS = buildConfig.groupIds;
    const jobs = GROUP_IDS.map((GROUP_ID: string) => tg.sendMessage(GROUP_ID, message, { parse_mode: "HTML" }));

    await Promise.all(jobs);
});