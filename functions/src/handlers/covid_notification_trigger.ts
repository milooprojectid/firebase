import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

import { determineFirestoreAction } from '../utils/helpers';
import { ACTION } from '../utils/constant';

const covidDataPath = '/bot_data/covid19';
interface Covid19Data {
    confirmed: number;
    deceased: number;
    recovered: number;
    suspected: number;
}

export const covid19FirestoreOnChange = functions.region('asia-east2').firestore.document(covidDataPath)
    .onWrite(async (change, context) => {
        try {
            const db = await admin.database();

            const { action, data, dataBefore } = determineFirestoreAction<Covid19Data>(change);
            if ((action === ACTION.UPDATE) && (data.confirmed !== dataBefore?.confirmed)){
                const options = {
                    headers: {
                        'Authorization': process.env.SERVICE_TOKEN
                    }
                }
                await axios.post(process.env.SERVICE_BOT + '/subscription/notify', null, options);
            } 

            /** write to realtime database */
            await db.ref('/covid-19').set(data);
        } catch (err) {
            console.error(err.message);
        }
    });