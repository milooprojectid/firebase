import * as admin from 'firebase-admin';
import { loadEnv } from './utils/load_env';

import * as BuildNotification from './handlers/build_notification';
import * as CovidNotification from './handlers/covid_notification_trigger';
import * as GoogleCloudAlert from './handlers/gcp_alerts';

/** initialize */
loadEnv();
admin.initializeApp();

export = {
    ...BuildNotification,
    ...CovidNotification,
    ...GoogleCloudAlert
}