import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as humanizeDuration from 'humanize-duration';
import * as moment from 'moment';
import { Telegram } from 'telegraf';

const BUILD_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  QUEUED: 'QUEUED',
  WORKING: 'WORKING',
  TIMEOUT: 'TIMEOUT',
  CANCELLED: 'CANCELLED'
}

const ELIGIBLE_STATUS = [ BUILD_STATUS.SUCCESS, BUILD_STATUS.CANCELLED, BUILD_STATUS.FAILURE ];

export const cloudBuildNotification = functions.region('asia-east2').pubsub.topic('cloud-builds').onPublish(async (pubSubEvent, context) => {
    const build = eventToBuild(pubSubEvent.data);

    if (ELIGIBLE_STATUS.includes(build.status)){
      const db = admin.firestore();

      const configs = await db.collection('configurations').doc('builds');
      const buildConfig = await configs.get().then(doc => doc.exists ? doc.data() : null);
      if (!buildConfig) return;
    
      const TOKEN = String(process.env.TOKEN_TELEGRAM);
      const tg = new Telegram(TOKEN);
    
      const message = createTelegramMessage(build);
      const duration = moment(build.finishTime).diff(moment(build.startTime));
      const humanized = humanizeDuration(duration);
    
      const description = `${build.substitutions.REPO_NAME} ${message} ${build.status === 'SUCCESS' ? '\nOperation took ' + humanized + '.' : ''}`;
      const logLink = `<a href="${build.logUrl}">Log detail</a>`;
      
      const GROUP_IDS = buildConfig.groupIds;
      const jobs = GROUP_IDS.map((GROUP_ID: string) => tg.sendMessage(GROUP_ID, `${description}\n${logLink}`, { parse_mode: "HTML" }));
      await Promise.all(jobs);
    }
});

const eventToBuild = (data: any) => {
    return JSON.parse(Buffer.from(data, 'base64').toString());
}

const createTelegramMessage = (build: any) => {
    switch (build.status) {
      case BUILD_STATUS.SUCCESS:
        return "deployed.";
      case BUILD_STATUS.FAILURE:
        return "build failure.";
      case BUILD_STATUS.INTERNAL_ERROR:
        return "build has failed. Internal error.";
      case BUILD_STATUS.QUEUED:
        return "build has been enqueued." ;
      case BUILD_STATUS.WORKING:
        return "build is in progress." ;
      case BUILD_STATUS.TIMEOUT:
        return "build took too long, the build has failed.";
      case BUILD_STATUS.CANCELLED:
        return "build has been cancelled.";
    }
    return "Something is strange baby.";
}
