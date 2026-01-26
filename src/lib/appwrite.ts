import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("697777ab003b4896ab21");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
