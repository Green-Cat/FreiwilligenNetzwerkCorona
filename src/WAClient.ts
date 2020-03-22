import { create, ev, Whatsapp } from "sulla-hotfix";

export class WAClient {
    client: Whatsapp;
    debug: boolean;

    public constructor(debug = false) {
        this.debug = debug;
    }

    // Can't make this a constructor, no async allowed :/
    public async init() {
        try {
            this.client = await create('session', {
                useChrome: true,
                headless: true,
                throwErrorOnTosBlock: true,
                killTimer: 40,
                qrRefreshS: 15,
            });

            if (this.debug) {
                this.addDebugerOutput();
            }    
        } catch (err) {
            console.log('Initialisation error:', err.message);
            process.exit();
        }
    }

    public async sendMessage(to: string, content: string) {
        const sendMessageEvent = await this.client.sendText(to, content);
        if (this.debug) {
            console.log("sendMessageEvent", sendMessageEvent);
        }
    }

    public async getContacts() {
        return this.client.getAllContacts();
    }

    public async createGroup(name: string, invite: string[]) {
        const groupCreationEvent = await this.client.createGroup(name, invite);

        if (this.debug) {
            console.log("groupCreationEvent", groupCreationEvent);
        }

        return groupCreationEvent.gid._serialized;
    }

    public async getGroupByName(name: string) {
        const groups = await this.client.getAllGroups();
        if (this.debug) {
            console.log("List of groups", groups);
        }
        for (const group of groups) {
            if (group.name === name) {
                if (this.debug) {
                    console.log("Retrieved group", group);
                }
                const groupId = group.id._serialized;
                return groupId;
            }
        }
    }

    private addDebugerOutput() {
        ev.on('**', async (data, sessionId, namespace) => {
            console.log("\n----------");
            console.log('EV',data, sessionId, namespace);
            console.log("----------")
          });
          
          ev.on('sessionData.**', async (sessionData, sessionId) =>{
            console.log("\n----------")
            console.log('sessionData', sessionId, sessionData)
            console.log("----------")
          });
    }

    public delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }    
}