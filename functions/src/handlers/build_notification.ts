import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as humanizeDuration from 'humanize-duration';
import * as moment from 'moment';
import * as axios from 'axios';

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
    
      const duration = moment(build.finishTime).diff(moment(build.startTime));

      const message = createTelegramMessage(build);
      const buildTime = humanizeDuration(duration);
      const repoName = build.substitutions.REPO_NAME;
      const logLink = build.logUrl;
      
      const WebHookUrl = buildConfig.slackWebhook;

      await axios.default.post(WebHookUrl, {
        fallback: "-",
        text: message.text,
        color: message.color,
        fields: [
          {
            title: "Repository",
            value: repoName,
            "short": false
          },
          {
            title: "Build Time",
            value: buildTime,
            short: false
          },
          {
            title: "Log Detail",
            value: logLink,
            short: false
          }
        ]
      })
    }
});

const eventToBuild = (data: any) => {
    return JSON.parse(Buffer.from(data, 'base64').toString());
}

const createTelegramMessage = (build: any): { text: string; color: string; } => {
    switch (build.status) {
      case BUILD_STATUS.SUCCESS:
        return {
          text: "Build Completed",
          color: "#4cbbb9"
        };

      case BUILD_STATUS.FAILURE:
        return {
          text: "Build Failed",
          color: "ff6363"
        };
      case BUILD_STATUS.CANCELLED:
        return {
          text: "Build Cancelled",
          color: "#dbdbdb"
        };
      default:
        return {
          text: "Sumtinwong",
          color: "#FFFFFF"
        };    }
}
