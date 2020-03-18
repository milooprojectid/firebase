import * as functions from 'firebase-functions';
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
            const { action, data } = determineFirestoreAction<Covid19Data>(change);
            if (action === ACTION.UPDATE){
                console.log('data changed');
                console.table(data);
            } 
        } catch (err) {
            console.error(err.message);
        }
    });