import * as admin from 'firebase-admin';
import { loadEnv } from './utils/load_env';

import * as BuildNotification from './handlers/build_notification';
import * as CovidNotification from './handlers/covid_notification_trigger';

/** initialize */
loadEnv();
admin.initializeApp();

export = {
    ...BuildNotification,
    ...CovidNotification,
}