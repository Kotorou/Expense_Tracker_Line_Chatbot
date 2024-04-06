
# Expense tracker by Line chat bot and Google Sheet

Expense Tracker Bot is a Node.js application that enables users to track their expenses via the LINE messaging platform and Google Sheets.
## Features

- Receives expense data through LINE messages.
- Stores expense data in a Google Sheet.
- Calculates and displays the total expenses for the current month.
- Automatically clears expense data at the end of each month


## Prerequisites
- Node.js installed on your machine.
- Google Sheets API credentials file (credentials.json) obtained from Google Cloud Console.
- LINE Developer account with a Messaging API channel.
## Installation
- [Tutorial to Get a bot](https://developers.line.biz/en/docs/messaging-api/building-bot/) , to get account for you Line Chat bot

- Create your own Google sheet to get a google sheet Id   
    [Google Sheets API Setup](https://ai2.appinventor.mit.edu/reference/other/googlesheets-api-setup.html)

- [Download ngrok](https://ngrok.com/download) to get a public URL for a localhost 

- Set up webhook URL in your LINE Developer Console to point to <your_server_domain>/webhook that get from ngrok

- Create a .env file to keep your tokens 





    
 ### Examples
```
ACCESS_TOKEN=your_line_channel_access_token
SECRET_TOKEN=your_line_channel_secret_token
GOOGLESHEET_ID=your_google_sheet_id
```

## Usage
- Start sending expense messages to your LINE Bot. 
Example message format: f100 (for food expense of 100 Baht)
     
