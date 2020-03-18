import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as humanizeDuration from 'humanize-duration';
import * as moment from 'moment';
import { Telegram } from 'telegraf';

export const cloudBuildNotification = functions.region('asia-east2').pubsub.topic('cloud-builds').onPublish(async (pubSubEvent, context) => {
    const db = admin.firestore();
  
    const configs = await db.collection('configurations').doc('builds');
    const buildConfig = await configs.get().then(doc => doc.exists ? doc.data() : null);
    if (!buildConfig) return;
  
    const TOKEN = String(process.env.TOKEN_TELEGRAM);
    const GROUP_IDS = buildConfig.groupIds;
  
    const tg = new Telegram(TOKEN);
    const build = eventToBuild(pubSubEvent.data);
  
    const message = createTelegramMessage(build);
    const duration = humanizeDuration(moment(build.finishTime).unix() - moment(build.startTime).unix());
  
    const description = `${build.substitutions.REPO_NAME} ${message} ${build.status === 'SUCCESS' ? '\nOperation took ' + duration + '.' : ''}`;
    const logLink = `<a href="${build.logUrl}">Log detail</a>`;
    
    const jobs = GROUP_IDS.map((GROUP_ID: string) => tg.sendMessage(GROUP_ID, `${description}\n${logLink}`, { parse_mode: "HTML" }));
    await Promise.all(jobs);
});

const eventToBuild = (data: any) => {
    return JSON.parse(Buffer.from(data, 'base64').toString());
}

const createTelegramMessage = (build: any) => {
    switch (build.status) {
      case 'SUCCESS':
        return "deployed.";
      case 'FAILURE':
        return "build failure.";
      case 'INTERNAL_ERROR':
        return "build has failed. Internal error.";
      case 'QUEUED':
        return "build has been enqueued." ;
      case 'WORKING':
        return "build is in progress." ;
      case 'TIMEOUT':
        return "build took too long, the build has failed.";
      case 'CANCELLED':
        return "build has been cancelled.";
    }
    return "Something is strange, baby.";
}
