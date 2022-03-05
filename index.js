'use strict';
// 定数の宣言など --- (*1)
const functions = require('firebase-functions');
const {/*  */dialogflow} = require('actions-on-google');
const app = dialogflow();

// Firebaseのデータベースを使うための設定 --- (*2)
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://----------default-rtdb.firebaseio.com/' // 要書き換え ---(*2a)
});
const db = admin.database();


// 記録を行うインテント --- (*3)
app.intent('記録用インテント', (conv, params) => {
    // 記録内容を得る --- (*4)
    const memo = params.any;
    console.log('memo=', memo);
    // データベースに書き込み --- (*5)
    db.ref('memo').set({'item': memo});
    // 書き込んだ旨を返す
    conv.ask(`「${memo}」を記録しました。`);
});

// メモを参照するインテント --- (*6)
app.intent('参照用インテント', (conv, params) => {
    // メモを参照する --- (*7)
    return db.ref('memo')
             .once('value')
             .then((snapshot) => {
        // 値を取得する --- (*8)
        const doc = snapshot.val();
        if (doc && doc.item) {
            conv.ask(`「${doc.item}」というメモがあります。`);
        } else {
            conv.ask('まだメモはありません。');
        }
        return null;
    }).catch((err) => { // エラーが起きた場合、以下を実行 --- (*9)
        console.log(err);
        conv.ask('エラーで確認できませんでした。');
        return null;
    });
});
// エクスポート
exports.dialogflowFirebaseFulfillment = 
  functions.https.onRequest(app);
