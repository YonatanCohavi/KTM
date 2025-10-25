import axios from "axios";
import z from "zod";

const knessetClient = axios.create({
  baseURL: 'https://knesset.gov.il/WebSiteApi/knessetapi',
  headers: {
    'Content-Type': 'application/json',
  },
});


const memberSchema = z.object({
  id: z.number(),
  factionId: z.number(),
  imageUrl: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  genderCode: z.number(),
  fraction: z.object({ id: z.number(), name: z.string() })
})
export type Member = z.infer<typeof memberSchema>;
const knessetApi = {
    getmembers: async () => {
        const factionPromise = knessetClient.get('/Faction/GetFactions?lng=he');    
        const membersPromise = knessetClient.get('/MkLobby/GetMkLobbyData120?lang=he');    
        const [membersResponse, factionsResponse] = await Promise.all([membersPromise,factionPromise]);
        const factions = factionsResponse.data['FactionList'].map((f:any) => {
            return { id: f.ID, name: f.Name };
        });
        const members = membersResponse.data['mks'].map((m: any) => {
            return memberSchema.parse({
                id: m.MkId,
                factionId: m.FactionId,
                imageUrl: m.ImagePath,
                firstName: m.Firstname,
                lastName: m.Lastname,
                genderCode: m.GenderId,
                fraction: factions.find((f:any) => f.id === m.FactionId)!,
            });
        });
        return members;
    } 
}

export { knessetApi };