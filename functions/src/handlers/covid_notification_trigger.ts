import * as functions from 'firebase-functions';
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
            const { action, data, dataBefore } = determineFirestoreAction<Covid19Data>(change);
            if ((action === ACTION.UPDATE) && (data.confirmed != dataBefore?.confirmed)){
                await axios.post(process.env.SERVICE_BOT + '/subscription/notify');
            } 
        } catch (err) {
            console.error(err.message);
        }
    });