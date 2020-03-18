import * as BuildNotification from './handlers/build_notification';
import * as admin from 'firebase-admin';
import { loadEnv } from './utils/load_env';

/** initialize */
loadEnv();
admin.initializeApp();

export = {
    ...BuildNotification
}