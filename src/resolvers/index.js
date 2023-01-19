const path = require("path");
const fsPromises = require("fs/promises");
const {
  fileExists,
  readJsonFile,
  deleteFile,
  getDirectoryFileNames,
} = require("../utils/fileHandling");
const { GraphQLError, printType } = require("graphql");
const crypto = require("crypto");
// const { audienceType } = require("../enums/audienceType");
const axios = require("axios").default;

// Create a variable holding the file path (from computer root directory) to the todo file directory
// const hiddenGemsDirectory = path.join(__dirname, "..", "data", "hiddenGems"); //global variabel

exports.resolvers = {
  Query: {
    getAllHiddenGems: async (_, args) => {
      console.log(process.env.SHEETDB_URI);
      let hiddenGemsList = [];

      try {
        const response = await axios.get(process.env.SHEETDB_URI);
        hiddenGemsList = response.data;
        if (response.data?.length > 0) hiddenGemsList = response.data; //om listan är mer än noll så skicka response. ALLTSÅ får felmeddelande om är noll.
      } catch (error) {
        console.error(error);
        return new GraphQLError("Ooops, something went wrong");
      }

      return hiddenGemsList;
    },
  },

  Mutation: {
    createHiddenGem: async (_, args) => {
      // Destructure input variables
      const { name, description } = args.input; //dess ligger under input iom vi skapat ett inputobjekt med dessa egenskaper... Så vi plockar ut dem från input därför! Så vi kan accessa de värdena via de namnen.

      // Skapa ett unikt id + data objektet // Skapa ett JS objekt som motsvarar hur vi vill att datan ska läggas in i vårt Sheet + generate random ID för våran Ticket. //All data som vi vill skicka upp skriver vi in här, sen måste titlarna i spreadsheeten matcha dessa för att de ska läggs till därunder, annars blir det fel.
      const newHiddenGem = {
        // Generera ett random id (av typ UUID)
        name: name,
        description: description || "",
        id: crypto.randomUUID(),
      };

      try {
        const endpoint = process.env.SHEETDB_URI;
        const response = await axios.post(
          endpoint,
          {
            data: [newHiddenGem],
          },
          {
            headers: {
              "Accept-Encoding": "gzip,deflate,compress",
            },
          }
        );
        console.log(response);
      } catch (error) {
        console.error(error);
        return new GraphQLError(
          "Could not add your Hidden Gem, something went wrong..."
        );
      }

      // IF (success) return JS objekt som mostvarar vår HiddenGem type i schemat
      return newHiddenGem;
    },

    // deleteHiddenGem: async (_, args) => {
    //   return null;
    // },
  },
};
