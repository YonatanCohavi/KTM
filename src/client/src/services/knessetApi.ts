import axios from "axios";
import z from "zod";
import { membersSchema } from "./memberSchema";

const knessetClient = axios.create({
  baseURL: 'https://knesset.gov.il/WebSiteApi/knessetapi',
  headers: {
    'Content-Type': 'application/json',
  },
});

const factionResponseSchema = z.object({
  FactionList: z.array(z.object({ ID: z.number(), Name: z.string() }))
});

const memberResponseSchema = z.object({
  mks: z.array(z.object({
    MkId: z.number(),
    FactionId: z.number(),
    ImagePath: z.string(),
    Firstname: z.string(),
    Lastname: z.string(),
    GenderId: z.number()
  }))
})

const knessetApi = {
    getmembers: async () => {
        const factionPromise = knessetClient.get('/Faction/GetFactions?lng=he');    
        const membersPromise = knessetClient.get('/MkLobby/GetMkLobbyData120?lang=he');    
        const [membersResponse, factionsResponse] = await Promise.all([membersPromise,factionPromise]);
        const factions = factionResponseSchema.parse(factionsResponse.data).FactionList.map(faction => ({
            id: faction.ID,
            name: faction.Name
        }));
        const rawMembers = memberResponseSchema.parse(membersResponse.data).mks;
        const members = rawMembers.map(member => ({
          id: member.MkId,
                factionId: member.FactionId,
                imageUrl: member.ImagePath,
                firstName: member.Firstname,
                lastName: member.Lastname,
                genderCode: member.GenderId,
                fraction: factions.find(faction => faction.id === member.FactionId),
            }));
        return membersSchema.parse(members);
    } 
}

export { knessetApi };