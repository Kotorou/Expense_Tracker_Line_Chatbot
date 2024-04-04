const line = require('@line/bot-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const ssId = env.GOOGLESHEET_ID;
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const app = express();
const port = 4000;
const currentDate = new Date().toISOString().replace('-', '/').split('T')[0].replace('-', '/');
const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
};
const client_line = new line.Client(lineConfig);

app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
        const events = req.body.events;
        console.log('event=>>>>>', events); // corrected typo here
        return events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send('OK');
    } catch (error) {
        res.status(500).end();
    }
});

const appendToGoogleSheet = async (data) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "",//path to your key file(get from google)
            scopes: "https://www.googleapis.com/auth/spreadsheets",
          });
        const authClient = await auth.getClient();
        const request = {
            spreadsheetId: ssId,
            range: '', // Change to your specific sheet and range
            valueInputOption: 'RAW',
            resource: {
                values: [data]
            },
            auth: authClient
        };
        const response = await sheets.spreadsheets.values.append(request);
        console.log('Data appended successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error appending data:', error);
        throw error;
    }
};

const handleEvent = async (event) => {
    const input = event.message.text;
    const amount = input.match(/(\d+)/);
    let dataToInsert = [];

    if (input.includes('f')) {
        dataToInsert = [currentDate, 'Foods', amount[0]];
    } else if (input.includes('t')) {
        dataToInsert = [currentDate, 'Transportation', amount[0]];
    } else if (input.includes('e')) {
        dataToInsert = [currentDate, 'Entertainment', amount[0]];
    } else if (input.includes('m')) {
        dataToInsert = [currentDate, 'Miscellaneous', amount[0]];
    }

    console.log(dataToInsert);
    //you can try to make a demo from flexmessage simulator first it would be fster
    try {
        await appendToGoogleSheet(dataToInsert);
        const sum = await getSum();
        const flexMessage = {
            type: 'flex',
            altText: 'Expense Tracker',
            contents: {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: 'Expense Tracker',
                            weight: 'bold',
                            color: '#1DB446',
                            size: 'xl'
                        },
                        {
                            type: 'separator',
                            margin: 'xxl'
                        },
                        {
                            type: 'box',
                            layout: 'vertical',
                            margin: 'xxl',
                            spacing: 'sm',
                            contents:  [
                                {
                                  "type": "box",
                                  "layout": "horizontal",
                                  "contents": [
                                    {
                                      "type": "text",
                                      "text": dataToInsert[1],
                                      "size": "md",
                                      "flex": 0
                                    },
                                    {
                                      "type": "text",
                                      "text": amount[0]+'฿',
                                      "size": "md",
                                      "color": "#111111",
                                      "align": "end"
                                    }
                                  ]
                                },]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            margin: 'md',
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'This Month',
                                            color: '#A9A9A9'
                                        },
                                        {
                                            type: 'text',
                                            text: sum.toString() + '฿',
                                            color: '#A9A9A9',
                                            margin: 'none'
                                        }
                                    ],
                                    width: '100px'
                                },
                            ],
                            position: 'relative',
                            borderWidth: 'medium'
                        }
                    ]
                },
                styles: {
                    footer: {
                        separator: true
                    }
                }
            }
        };
        return client_line.replyMessage(event.replyToken, flexMessage);
    } catch (error) {
        console.error('Error handling event:', error);
        return client_line.replyMessage(event.replyToken, { type: 'text', text: "Failed to handle event" });
    }
};


async function getSum() {
    const auth = new google.auth.GoogleAuth({
        keyFile: "",// path to your key file
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ssId,
            range: '', // Assuming the column you want to sum 
        });
        const values = response.data.values;
        let sum = 0;
        if (values) {
            for (let i = 0; i < values.length; i++) {
                const value = parseFloat(values[i][0]);
                if (!isNaN(value)) {
                    sum += value;
                }
            }
        }
        console.log('Sum:', sum);
        return sum;
    } catch (error) {
        console.error('Error getting sum:', error);
        throw error;
    }
}
const cron = require('node-cron');

const resetSheet = async () => {
    try {
        await clearSheet();
        console.log('Sheet cleared for the last day of the month');
    } catch (error) {
        console.error('Error clearing sheet:', error);
    }
};


cron.schedule('0 0 28-31 * *', async () => {
    await resetSheet();
}, {
    timezone: 'Asia/Bangkok' 
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});