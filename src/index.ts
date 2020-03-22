import * as fs from "fs";
import express from "express";
import * as bodyParser from "body-parser";

import { WAClient } from "./WAClient";

(async () => {
    try {
        const client = new WAClient(true);
        await client.init();

        const app = express();

        app.use(bodyParser.urlencoded({ extended: false }))

        app.get("/", (req, res) => {
            fs.createReadStream("src/form.html").pipe(res);
        });

        app.post("/", async (req, res) => {
            console.log(req.body);

            const groupName = `Hilfegruppe ${req.body.zip}`;

            // Note: this will be gotten from db in the real thing ofc, here hardcoded mine and ls' phones
            const groupInvite = ['491602673439@c.us', '4915785066725@c.us'];

            const message = `Neue Hilfeanfrage:\nName: ${req.body.name}\nTelefonnummer: ${req.body.tel}\nAnfrage: ${req.body.request}`;

            const gid = await client.createGroup(groupName, groupInvite);

            // Note: There is a delay between a group creation and the ability to write in a group
            // Since WA actually sends an invitation to yourself and auto accepts it
            // Not sure how long the delay actually needs to be, may need a bit of testing to make sure
            // But 10 seconds does work
            await client.delay(10_000);

            await client.sendMessage(gid, message);

            fs.createReadStream("src/done.html").pipe(res);
        });

        app.listen(3000, function (err) {
            if (err) {
                throw err;
            }
  
            console.log('Server started on port 3000');
        });
    } catch (e) {
        console.log("The world is ending", e)
    }
})();