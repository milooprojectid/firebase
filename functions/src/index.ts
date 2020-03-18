import * as BuildNotification from './handlers/build_notification';
import { loadEnv } from './utils/load_env';

loadEnv();

export = {
    ...BuildNotification
}